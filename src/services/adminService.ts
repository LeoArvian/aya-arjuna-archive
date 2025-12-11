import { supabase } from '../lib/supabaseClient';
import type { AdminUser, UserRole, DeletionRequest, PasswordRequest } from '../types';
import { logService } from './logService'; // Import Log Service

export const adminService = {
  // === 1. LOGIN SYSTEM ===
  async login(username: string, passwordInput: string) {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !data) {
        // Log Gagal Login (Opsional, hati-hati spam)
        return { user: null, error: 'Username tidak ditemukan.' };
      }

      // Cek Password
      if (data.password_hash !== passwordInput) {
        // Log Password Salah (Penting untuk deteksi Brute Force)
        return { user: null, error: 'Password salah.' };
      }

      // Cek Status Terkunci
      if (data.is_locked) {
        return { user: null, error: 'Akun ini sedang dikunci oleh Leader.' };
      }

      // Update Last Login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id);

      // LOG LOGIN BERHASIL
      // Kita panggil logService manual karena di login belum tentu ada session aktif di store
      // Tapi logService butuh currentUser dari store.
      // Solusi: Kita insert manual ke DB atau biarkan logService handle setelah login di component.
      // Untuk simplifikasi, kita log di component AdminOverlay setelah sukses login.
      
      return { user: data as AdminUser, error: null };
    } catch (err) {
      console.error("Login Error:", err);
      return { user: null, error: 'Terjadi kesalahan koneksi.' };
    }
  },

  // === 2. MANAJEMEN ADMIN (CRUD) ===
  async getAllAdmins() {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data as AdminUser[];
  },

  async createAdmin(username: string, passwordHash: string, role: UserRole, creatorId: string, avatarUrl?: string) {
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        username,
        password_hash: passwordHash, 
        role,
        created_by: creatorId,
        avatar_url: avatarUrl || `https://ui-avatars.com/api/?name=${username}&background=random`
      })
      .select()
      .single();
    
    if (error) throw error;

    // LOG: CREATE ADMIN
    await logService.addLog(
      'CREATE', 
      'MANAGE_ADMINS', 
      `Membuat akun baru: "${username}" dengan role [${role.toUpperCase()}]`
    );

    return data;
  },

  async updateAdmin(targetId: string, updates: Partial<AdminUser> & { password_hash?: string }) {
    // Ambil data lama dulu untuk perbandingan log
    const { data: oldData } = await supabase.from('admin_users').select('username, role, is_locked').eq('id', targetId).single();
    
    const { data, error } = await supabase
      .from('admin_users')
      .update(updates)
      .eq('id', targetId)
      .select()
      .single();
    
    if (error) throw error;

    // LOG: UPDATE ADMIN (Cek apa yang berubah)
    const targetName = oldData?.username || 'Unknown';

    if (updates.role && updates.role !== oldData?.role) {
      await logService.addLog(
        'UPDATE', 
        'MANAGE_ADMINS', 
        `Mengubah role "${targetName}" dari [${oldData?.role.toUpperCase()}] menjadi [${updates.role.toUpperCase()}]`
      );
    }

    if (updates.is_locked !== undefined && updates.is_locked !== oldData?.is_locked) {
      const status = updates.is_locked ? 'MENGUNCI (LOCK)' : 'MEMBUKA (UNLOCK)';
      await logService.addLog(
        'UPDATE', 
        'MANAGE_ADMINS', 
        `${status} akun "${targetName}"`
      );
    }

    if (updates.password_hash) {
      // Cek apakah ini ganti password sendiri atau orang lain
      // (Bisa dicek di component, tapi log generik disini aman)
      await logService.addLog(
        'UPDATE', 
        'SECURITY', 
        `Mengubah password untuk akun "${targetName}"`
      );
    }

    if (updates.username && updates.username !== oldData?.username) {
      await logService.addLog(
        'UPDATE', 
        'PROFILE', 
        `Mengubah username "${targetName}" menjadi "${updates.username}"`
      );
    }

    return data;
  },

  async deleteAdmin(targetId: string) {
    // Ambil nama target sebelum dihapus
    const { data: target } = await supabase.from('admin_users').select('username').eq('id', targetId).single();
    const targetName = target?.username || 'Unknown ID';

    // A. Putuskan hubungan 'created_by' (Set null pada child)
    await supabase.from('admin_users').update({ created_by: null }).eq('created_by', targetId);
    
    // B. Hapus semua request penghapusan terkait
    await supabase.from('deletion_requests').delete().or(`target_admin_id.eq.${targetId},requester_id.eq.${targetId}`);
    
    // C. Hapus request password terkait
    await supabase.from('password_reset_requests').delete().eq('user_id', targetId);
    
    // D. Hapus akun admin
    const { error } = await supabase.from('admin_users').delete().eq('id', targetId);
    if (error) throw error;

    // LOG: DELETE ADMIN
    await logService.addLog(
      'DELETE', 
      'MANAGE_ADMINS', 
      `MENGHAPUS PERMANEN akun admin: "${targetName}"`
    );

    return true;
  },

  async verifyPassword(userId: string, passwordInput: string) {
    const { data, error } = await supabase.from('admin_users').select('password_hash').eq('id', userId).single();
    if (error || !data) return false;
    return data.password_hash === passwordInput;
  },

  // === 3. FITUR LUPA PASSWORD ===
  async searchAdminsByUsername(query: string) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, username, password_hash, avatar_url')
      .ilike('username', `%${query}%`)
      .limit(5);
    
    if (error) throw error;
    return data as AdminUser[];
  },

  async getActivePasswordRequest(userId: string) {
    const { data, error } = await supabase
      .from('password_reset_requests')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as PasswordRequest | null;
  },

  async createPasswordRequest(userId: string) {
    const { error } = await supabase
      .from('password_reset_requests')
      .insert({ user_id: userId, status: 'pending' });
    
    if (error) throw error;
    
    // Log System (Opsional karena ini user belum login)
  },

  async completePasswordReset(userId: string, newPassword: string, requestId?: string) {
    // Update Password User
    await this.updateAdmin(userId, { password_hash: newPassword });
    
    // Tandai request selesai (jika ada)
    if (requestId) {
      await supabase
        .from('password_reset_requests')
        .update({ status: 'completed' })
        .eq('id', requestId);
    }

    // Log sudah di-handle di fungsi updateAdmin
  },

  // === 4. FITUR REQUEST & NOTIFIKASI LEADER ===
  
  // Ambil SEMUA request pending (Delete & Password)
  async getAllPendingRequests() {
    // 1. Deletion Requests
    const { data: delReqs } = await supabase
      .from('deletion_requests')
      .select(`*, target:admin_users!target_admin_id(username), requester:admin_users!requester_id(username)`)
      .eq('status', 'pending');

    // 2. Password Requests
    const { data: passReqs } = await supabase
      .from('password_reset_requests')
      .select(`*, user:admin_users!user_id(username)`)
      .eq('status', 'pending');

    return {
      deletions: (delReqs || []).map((item: any) => ({
        ...item,
        target_username: item.target?.username || 'Unknown',
        requester_username: item.requester?.username || 'Unknown'
      })) as DeletionRequest[],
      passwords: (passReqs || []).map((item: any) => ({
        ...item,
        username: item.user?.username || 'Unknown'
      })) as PasswordRequest[]
    };
  },

  // FITUR BARU: Ambil Security Alerts untuk Leader (Log yang dihapus)
  async getSecurityAlerts() {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        admin:admin_users!admin_id (username, role)
      `)
      .eq('target_section', 'SECURITY_ALERT') // Filter khusus log keamanan
      .order('created_at', { ascending: false })
      .limit(10); // Ambil 10 terakhir aja

    if (error) return [];

    return data.map((log: any) => ({
      ...log,
      admin_name: log.admin?.username || 'Unknown'
    }));
  },

  // Create Request Hapus (Moderator/Staff)
  async createDeletionRequest(req: { targetId: string, requesterId: string, reason: string, proofs: string[] }) {
    const { error } = await supabase.from('deletion_requests').insert({
      target_admin_id: req.targetId,
      requester_id: req.requesterId,
      reason: req.reason,
      proof_images: req.proofs,
      status: 'pending'
    });
    if (error) throw error;

    // LOG: PERMINTAAN HAPUS
    // Ambil nama target buat log
    const { data: target } = await supabase.from('admin_users').select('username').eq('id', req.targetId).single();
    await logService.addLog(
      'CREATE', 
      'REQUEST', 
      `Mengajukan permintaan penghapusan akun "${target?.username || 'Unknown'}"`
    );
  },

  // Process Request Hapus (Leader)
  async processDeletionRequest(requestId: string, action: 'approved' | 'rejected') {
    const { data: reqData } = await supabase.from('deletion_requests').select('*').eq('id', requestId).single();
    if (!reqData) throw new Error("Request tidak ditemukan");
    
    // Update status dulu
    const { error } = await supabase.from('deletion_requests').update({ status: action }).eq('id', requestId);
    if (error) throw error;

    // LOG KEPUTUSAN
    const statusText = action === 'approved' ? 'MENYETUJUI' : 'MENOLAK';
    await logService.addLog(
      'UPDATE', 
      'REQUEST', 
      `${statusText} permintaan penghapusan akun (ReqID: ${requestId.slice(0,8)}...)`
    );

    // Jika Approved, hapus akun (Log Hapus akan dipanggil di fungsi deleteAdmin)
    if (action === 'approved') {
        await this.deleteAdmin(reqData.target_admin_id);
    }
  },

  // Process Request Password (Leader)
  async processPasswordRequest(requestId: string, action: 'approved' | 'rejected') {
    if (action === 'rejected') {
      // Hapus request jika ditolak
      await supabase.from('password_reset_requests').delete().eq('id', requestId);
      
      // LOG PENOLAKAN
      await logService.addLog('UPDATE', 'REQUEST', `MENOLAK permintaan reset password (ReqID: ${requestId.slice(0,8)}...)`);
    } else {
      // Set approved
      await supabase.from('password_reset_requests').update({ status: 'approved' }).eq('id', requestId);
      
      // LOG PERSETUJUAN
      await logService.addLog('UPDATE', 'REQUEST', `MENYETUJUI permintaan reset password (ReqID: ${requestId.slice(0,8)}...)`);
    }
  },

  // === 5. DASHBOARD STATS ===
  async getDashboardStats() {
    const [timeline, memories, songs, admins] = await Promise.all([
      supabase.from('content_timeline').select('*', { count: 'exact', head: true }),
      supabase.from('content_memories').select('*', { count: 'exact', head: true }),
      supabase.from('content_songs').select('*', { count: 'exact', head: true }),
      supabase.from('admin_users').select('*', { count: 'exact', head: true })
    ]);

    return {
      timelineCount: timeline.count || 0,
      memoriesCount: memories.count || 0,
      songsCount: songs.count || 0,
      adminsCount: admins.count || 0
    };
  }
};