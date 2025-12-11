import { useState, useEffect, useRef } from 'react';
import { adminService } from '../../../services/adminService';
import { contentService } from '../../../services/contentService';
import type { AdminUser, UserRole, DeletionRequest, PasswordRequest } from '../../../types';
import { useAuthStore } from '../../../store/useAuthStore';
import { 
  MoreVertical, Shield, User, Lock, Trash2, Edit, Crown, 
  Bell, Check, X, Camera, Palette, Key, AlertTriangle, Circle, Unlock, Siren,
  Eye, KeyRound, ZoomIn, ZoomOut, Search, ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';

// === KONFIGURASI OWNER ===
const ABSOLUTE_USERNAME = "admin"; 

const PRESET_COLORS = [
  '#ffffff', '#ef4444', '#f97316', '#eab308', 
  '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899'
];

// Helper: Cek apakah user online
const isUserOnline = (lastLogin?: string) => {
  if (!lastLogin) return false;
  return (new Date().getTime() - new Date(lastLogin).getTime()) < 2.5 * 60 * 1000;
};

// === COMPONENT CARD ADMIN (TAMPILAN MOBILE) ===
const AdminCard = ({ 
  admin, 
  currentUser, 
  activeDropdown, 
  setActiveDropdown, 
  handleAction, 
  handleEditSelf,
  dropdownRef
}: any) => {
  const isMe = currentUser?.id === admin.id;
  const isOwner = currentUser?.username === ABSOLUTE_USERNAME;
  const isTargetOwner = admin.username === ABSOLUTE_USERNAME;
  const isTargetLeader = admin.role === 'leader';

  const showMenu = !isMe && !isTargetOwner && (isOwner || !isTargetLeader);

  return (
    <div className={`bg-black/20 border border-white/10 rounded-xl p-4 flex flex-col gap-3 relative ${isMe ? 'ring-1 ring-primary/50 bg-primary/5' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
           <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 overflow-hidden ${admin.role === 'leader' ? 'border-yellow-500 text-yellow-500' : 'border-gray-500 text-gray-400'}`}>
              {admin.avatar_url ? (
                <img src={admin.avatar_url} className="w-full h-full object-cover"/>
              ) : (
                admin.username[0].toUpperCase()
              )}
           </div>
           <div>
              <div className="font-bold text-sm flex items-center gap-2" style={{ color: admin.username_color || '#fff' }}>
                 {admin.username}
                 {isMe && <span className="text-[9px] bg-primary px-1.5 py-0.5 rounded text-white">You</span>}
                 {isTargetOwner && <span className="text-[9px] bg-red-600 px-2 py-0.5 rounded text-white shadow-red-500/20 shadow-lg">OWNER</span>}
                 {!isTargetOwner && isTargetLeader && <span className="text-[9px] bg-yellow-600 px-2 py-0.5 rounded text-white">Leader</span>}
              </div>
              <div className="text-[10px] text-white/40 font-mono">{admin.id.slice(0, 8)}...</div>
           </div>
        </div>
        
        {isMe ? (
           <button onClick={handleEditSelf} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70">
              <Edit size={16}/>
           </button>
        ) : showMenu ? (
           <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === admin.id ? null : admin.id);
                }} 
                className="p-2 text-white/50 hover:text-white"
              >
                 <MoreVertical size={18}/>
              </button>
              
              {activeDropdown === admin.id && (
                 <>
                    {/* BACKDROP: Klik disini untuk tutup */}
                    <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }} />
                    
                    {/* MENU: Z-Index 50 & STOP PROPAGATION AGAR TOMBOL BISA DIKLIK */}
                    <div 
                        ref={dropdownRef}
                        className="absolute right-0 top-8 w-48 bg-dark-surface border border-dark-border shadow-xl rounded-lg z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        {admin.role === 'staff' && (
                          <>
                            <button onClick={(e) => handleAction('promote_leader', admin)} className="px-4 py-3 text-left hover:bg-white/5 text-xs text-yellow-500 bg-dark-surface border-b border-white/5 flex items-center gap-2"><Crown size={12}/> Jadikan Leader</button>
                            <button onClick={(e) => handleAction('toggle_lock', admin)} className="px-4 py-3 text-left hover:bg-white/5 text-xs bg-dark-surface border-b border-white/5 flex items-center gap-2">{admin.is_locked ? <><Unlock size={12}/> Buka Kunci</> : <><Lock size={12}/> Kunci Akun</>}</button>
                            <button onClick={(e) => handleAction('delete_instant', admin)} className="px-4 py-3 text-left hover:bg-red-500/10 text-red-400 text-xs font-bold bg-dark-surface flex items-center gap-2"><Trash2 size={12}/> Hapus Permanen</button>
                          </>
                        )}
                        {isOwner && admin.role === 'leader' && (
                          <>
                            <div className="px-4 py-1.5 text-[10px] font-bold text-white/30 bg-black/20 uppercase tracking-wider">Owner Actions</div>
                            <button onClick={(e) => handleAction('demote_staff', admin)} className="px-4 py-3 text-left hover:bg-white/5 text-xs text-yellow-400 bg-dark-surface border-b border-white/5 flex items-center gap-2"><ShieldAlert size={12}/> Turunkan ke Staff</button>
                            <button onClick={(e) => handleAction('delete_instant', admin)} className="px-4 py-3 text-left hover:bg-red-500/10 text-red-400 text-xs font-bold bg-dark-surface flex items-center gap-2"><Trash2 size={12}/> Hapus Permanen</button>
                          </>
                        )}
                    </div>
                 </>
              )}
           </div>
        ) : (
          !isMe && <Shield size={16} className="text-white/20" title={isTargetOwner ? "OWNER (Kebal Hukum)" : "Sesama Leader terlindungi"} />
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
         <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${admin.role === 'leader' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-500/10 text-gray-400'}`}>
            {admin.role === 'leader' ? <Crown size={10} /> : <User size={10} />} {admin.role === 'leader' ? 'LEADER' : 'STAFF'}
         </span>
         {admin.is_locked ? (
            <span className="flex items-center gap-1 text-red-400 text-[10px] font-bold"><Lock size={10}/> Locked</span>
         ) : (
            <div className="flex items-center gap-1.5">
               <Circle size={8} className={isUserOnline(admin.last_login) ? "fill-green-500 text-green-500" : "fill-gray-500 text-gray-500"} />
               <span className={`text-[10px] font-bold ${isUserOnline(admin.last_login) ? "text-green-400" : "text-gray-500"}`}>{isUserOnline(admin.last_login) ? "Online" : "Offline"}</span>
            </div>
         )}
      </div>
    </div>
  );
};

// === MAIN COMPONENT ===
export default function ManageAdmins() {
  const { user: currentUser, login: updateLocalUser } = useAuthStore();
  
  // SECURITY CHECK
  if (currentUser?.role !== 'leader') return null;

  // STATE DATA
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [passRequests, setPassRequests] = useState<PasswordRequest[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]); 
  
  // STATE UI
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // STATE MODALS
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showEditSelfModal, setShowEditSelfModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  
  // STATE NOTIFIKASI PINTAR (RED DOT)
  const [isNotifBadged, setIsNotifBadged] = useState(false);
  // Ref untuk menyimpan jumlah notif terakhir
  const prevTotalRef = useRef(0);

  // STATE FORMS
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'staff' as UserRole });
  const [targetAction, setTargetAction] = useState<AdminUser | null>(null);

  // STATE EDIT SELF
  const [selfTab, setSelfTab] = useState<'profile' | 'security'>('profile');
  const [selfForm, setSelfForm] = useState({ 
    username: '', username_color: '#ffffff', avatar_url: '', 
    old_password: '', new_password: '', confirm_password: ''
  });
  
  // CROPPER STATES
  const [showCropper, setShowCropper] = useState(false);
  const [tempImgSrc, setTempImgSrc] = useState<string | null>(null);
  const [cropScale, setCropScale] = useState(1);
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // === INIT ===
  useEffect(() => {
    const init = async () => {
      if (currentUser) await adminService.updateAdmin(currentUser.id, { last_login: new Date().toISOString() });
      fetchAdmins();
      fetchRequests();
    };
    init();
    const heartbeatInterval = setInterval(() => {
      if (currentUser) {
        adminService.updateAdmin(currentUser.id, { last_login: new Date().toISOString() });
        fetchAdmins(); 
      }
    }, 60000);
    return () => clearInterval(heartbeatInterval);
  }, [currentUser]);

  // LOGIKA RED DOT PINTAR
  useEffect(() => {
    const totalCurrent = requests.length + passRequests.length + securityAlerts.length;
    
    // Jika jumlah notif bertambah dari sebelumnya -> Nyalakan Badge
    if (totalCurrent > prevTotalRef.current) {
        setIsNotifBadged(true);
    }
    
    // Update ref untuk perbandingan selanjutnya
    prevTotalRef.current = totalCurrent;
  }, [requests.length, passRequests.length, securityAlerts.length]);

  // Handler Buka Notifikasi (Matikan Badge)
  const handleOpenNotif = () => {
    setShowNotifModal(true);
    setIsNotifBadged(false);
  };

  // Init form edit saat dibuka
  useEffect(() => {
    if (showEditSelfModal && currentUser) {
      setSelfForm({
        username: currentUser.username,
        username_color: currentUser.username_color || '#ffffff',
        avatar_url: currentUser.avatar_url || '',
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
      setSelfTab('profile');
    }
  }, [showEditSelfModal, currentUser]);

  const fetchAdmins = async () => {
    try {
      const data = await adminService.getAllAdmins();
      const sorted = data.sort((a, b) => {
        if (a.username === ABSOLUTE_USERNAME) return -1;
        if (b.username === ABSOLUTE_USERNAME) return 1;
        if (a.role === 'leader' && b.role !== 'leader') return -1;
        if (a.role !== 'leader' && b.role === 'leader') return 1;
        return 0;
      });
      setAdmins(sorted);
    } catch (err) { console.error(err); }
  };

  const fetchRequests = async () => {
    const { deletions, passwords } = await adminService.getAllPendingRequests();
    setRequests(deletions);
    setPassRequests(passwords);
    const alerts = await adminService.getSecurityAlerts();
    setSecurityAlerts(alerts);
  };

  // === HANDLERS CROPPER ===
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setTempImgSrc(reader.result as string);
        setShowCropper(true);
        setCropScale(1);
        setCropPos({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropPos.x, y: e.clientY - cropPos.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) setCropPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  const performCrop = async () => {
     if (!imgRef.current || !canvasRef.current) return;
     const canvas = canvasRef.current;
     const ctx = canvas.getContext('2d');
     const image = imgRef.current;
     canvas.width = 400; canvas.height = 400;
     if (ctx) {
        ctx.clearRect(0, 0, 400, 400);
        ctx.save();
        ctx.beginPath(); ctx.arc(200, 200, 200, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
        const scale = cropScale * (400 / 256);
        ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, (cropPos.x * scale) + (400 - image.width * cropScale * scale) / 2, (cropPos.y * scale) + (400 - image.height * cropScale * scale) / 2, image.width * cropScale * scale, image.height * cropScale * scale);
        canvas.toBlob(async (blob) => {
          if (blob) {
            const f = new File([blob], "avatar_crop.png", { type: "image/png" });
            const toastId = toast.loading("Mengunggah Avatar...");
            try {
              const url = await contentService.uploadFile(f, 'public-assets'); 
              if (url) {
                setSelfForm(prev => ({ ...prev, avatar_url: url }));
                toast.success("Foto profil diperbarui!", { id: toastId });
                setShowCropper(false);
              }
            } catch (e) { toast.error("Gagal upload.", { id: toastId }); }
          }
        }, 'image/png');
     }
  };

  // === ACTIONS ===
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Membuat akun...');
    try {
      await adminService.createAdmin(newUser.username, newUser.password, newUser.role, currentUser!.id);
      toast.success('Admin berhasil dibuat!', { id: toastId });
      setIsCreating(false);
      setNewUser({ username: '', password: '', role: 'staff' });
      fetchAdmins();
    } catch (err: any) { 
      toast.error(err.message || 'Gagal membuat akun.', { id: toastId }); 
    }
  };

  const handleUpdateSelfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const toastId = toast.loading('Memproses perubahan...');
    try {
      if (selfForm.new_password) {
        if (!selfForm.old_password) { toast.error("Masukkan password lama.", { id: toastId }); return; }
        if (selfForm.new_password !== selfForm.confirm_password) { toast.error("Password tidak cocok.", { id: toastId }); return; }
        const isOldValid = await adminService.verifyPassword(currentUser.id, selfForm.old_password);
        if (!isOldValid) { toast.error("Password lama salah!", { id: toastId }); return; }
      }
      const updates: any = {};
      if (selfForm.username !== currentUser.username) updates.username = selfForm.username;
      if (selfForm.avatar_url !== currentUser.avatar_url) updates.avatar_url = selfForm.avatar_url;
      if (selfForm.username_color !== currentUser.username_color) updates.username_color = selfForm.username_color;
      if (selfForm.new_password) updates.password_hash = selfForm.new_password;

      if (Object.keys(updates).length === 0) { toast.info("Tidak ada perubahan.", { id: toastId }); return; }

      const updatedUser = await adminService.updateAdmin(currentUser.id, updates);
      updateLocalUser(updatedUser);
      toast.success('Profil diperbarui!', { id: toastId });
      setShowEditSelfModal(false);
      fetchAdmins();
    } catch (err) { toast.error('Gagal update.', { id: toastId }); }
  };

  // === FIX PENTING: ACTION HANDLER ===
  const handleAction = async (action: string, target: AdminUser) => {
    // Tutup menu dulu sebelum modal muncul
    setActiveDropdown(null); 

    if (action === 'delete_instant') { 
        setTargetAction(target); 
        // Beri jeda sekejap agar state dropdown benar-benar clear
        setTimeout(() => setShowConfirmDeleteModal(true), 50); 
        return; 
    }

    const toastId = toast.loading('Memproses...');
    try {
      if (action === 'promote_leader') await adminService.updateAdmin(target.id, { role: 'leader' });
      if (action === 'demote_staff') await adminService.updateAdmin(target.id, { role: 'staff' });
      if (action === 'toggle_lock') await adminService.updateAdmin(target.id, { is_locked: !target.is_locked });
      
      toast.success('Berhasil!', { id: toastId });
      fetchAdmins();
    } catch (err) { toast.error('Gagal memproses aksi.', { id: toastId }); }
  };

  const confirmDeleteInstant = async () => {
    if (!targetAction) return;
    const toastId = toast.loading('Menghapus akun...');
    try {
      await adminService.deleteAdmin(targetAction.id);
      toast.success('Akun dihapus.', { id: toastId });
      setShowConfirmDeleteModal(false); 
      setTargetAction(null); 
      fetchAdmins();
    } catch (err: any) { 
      console.error(err);
      toast.error(`Gagal Hapus: ${err.message || 'Cek Log Aktivitas.'}`, { id: toastId }); 
    }
  };

  const handleRequestDecision = async (reqId: string, decision: 'approved' | 'rejected') => {
    const toastId = toast.loading('Memproses...');
    try {
      await adminService.processDeletionRequest(reqId, decision);
      toast.success(decision === 'approved' ? 'Akun dihapus' : 'Ditolak', { id: toastId });
      fetchRequests(); fetchAdmins();   
    } catch (err) { toast.error('Gagal.', { id: toastId }); }
  };

  const handlePassRequestDecision = async (reqId: string, decision: 'approved' | 'rejected') => {
    const toastId = toast.loading('Memproses...');
    try {
      await adminService.processPasswordRequest(reqId, decision);
      toast.success(decision === 'approved' ? 'Disetujui' : 'Ditolak', { id: toastId });
      fetchRequests();
    } catch (err) { toast.error('Gagal.', { id: toastId }); }
  };

  const filteredAdmins = admins.filter(a => a.username.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-6xl pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Shield className="text-primary" /> Manage Admins
          </h2>
          <p className="text-white/50 text-sm">Panel Khusus Leader (Full Access).</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16}/>
             <input 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Cari admin..."
               className="w-full bg-dark-surface border border-dark-border rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-primary outline-none"
             />
          </div>

          <button 
              onClick={handleOpenNotif} 
              className="relative p-2.5 bg-dark-surface border border-dark-border rounded-xl hover:bg-white/5 transition-colors"
          >
              <Bell size={20} className="text-white" />
              {isNotifBadged && (
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              )}
          </button>
          
          <button 
            onClick={() => setIsCreating(!isCreating)} 
            className="flex-1 md:flex-none px-6 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 text-sm"
          >
            {isCreating ? 'Batal' : '+ Tambah Staff'}
          </button>
        </div>
      </div>

      {/* FORM CREATE */}
      {isCreating && (
        <div className="bg-dark-surface p-4 md:p-6 rounded-2xl border border-dark-border mb-6 animate-in slide-in-from-top-4 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">Buat Akun Tim Baru</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input required placeholder="Username" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="bg-black/30 border border-dark-border rounded-lg p-3 text-white focus:border-primary outline-none text-sm" />
            <input required type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="bg-black/30 border border-dark-border rounded-lg p-3 text-white focus:border-primary outline-none text-sm" />
            <select value={newUser.role} onChange={(e: any) => setNewUser({...newUser, role: e.target.value})} className="bg-black/30 border border-dark-border rounded-lg p-3 text-white focus:border-primary outline-none text-sm cursor-pointer">
              <option value="staff" className="bg-dark-surface text-white">Staff (Biasa)</option>
              <option value="leader" className="bg-dark-surface text-white">Leader (Full Akses)</option>
            </select>
            <button type="submit" className="bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors text-sm py-3 md:py-0">Simpan Akun</button>
          </form>
          <p className="text-xs text-white/40 mt-3 flex items-center gap-2"><AlertTriangle size={12}/> Info: Role Staff tidak bisa mengakses halaman ini. Role Leader punya akses penuh.</p>
        </div>
      )}

      {/* === TABLE DESKTOP === */}
      <div className="hidden md:block bg-dark-surface rounded-2xl border border-dark-border shadow-xl min-h-[300px]">
        <table className="w-full text-left">
          <thead className="bg-black/20 text-white/40 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="p-5">User Info</th>
              <th className="p-5">Jabatan</th>
              <th className="p-5">Status</th>
              <th className="p-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white">
            {filteredAdmins.map((admin) => {
              const isMe = currentUser?.id === admin.id;
              const isOwner = currentUser?.username === ABSOLUTE_USERNAME; 
              const isTargetOwner = admin.username === ABSOLUTE_USERNAME;  
              const isTargetLeader = admin.role === 'leader';              
              
              const showMenu = !isMe && !isTargetOwner && (isOwner || !isTargetLeader);

              return (
                <tr key={admin.id} className={`hover:bg-white/5 transition-colors ${isMe ? 'bg-primary/5' : ''}`}>
                  <td className="p-5 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 ${admin.role === 'leader' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-gray-500 bg-gray-500/10 text-gray-400'}`}>
                      {admin.avatar_url ? <img src={admin.avatar_url} className="w-full h-full rounded-full object-cover" /> : admin.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-2" style={{ color: admin.username_color || '#fff' }}>
                        {admin.username}
                        {isMe && <span className="text-[10px] bg-primary px-2 py-0.5 rounded-full text-white">Anda</span>}
                        {isTargetOwner && <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded text-white shadow-red-500/20 shadow-lg">OWNER</span>}
                        {!isTargetOwner && isTargetLeader && <span className="text-[10px] bg-yellow-600 px-2 py-0.5 rounded text-white">Leader</span>}
                      </div>
                      <div className="text-xs text-white/40">Last login: {admin.last_login ? new Date(admin.last_login).toLocaleDateString() : '-'}</div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${admin.role === 'leader' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-500/10 text-gray-400'}`}>
                      {admin.role === 'leader' ? <Crown size={12} /> : <User size={12} />} {admin.role === 'leader' ? 'LEADER' : 'STAFF'}
                    </span>
                  </td>
                  <td className="p-5">
                    {admin.is_locked ? <span className="flex items-center gap-1 text-red-400 text-xs font-bold"><Lock size={12}/> Terkunci</span> : <div className="flex items-center gap-2"><Circle size={10} className={isUserOnline(admin.last_login) ? "fill-green-500 text-green-500" : "fill-gray-500 text-gray-500"} /><span className={`text-xs font-bold ${isUserOnline(admin.last_login) ? "text-green-400" : "text-gray-500"}`}>{isUserOnline(admin.last_login) ? "Online" : "Offline"}</span></div>}
                  </td>
                  <td className="p-5 text-right relative">
                    {isMe ? (
                      <button onClick={() => setShowEditSelfModal(true)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors flex items-center gap-2 ml-auto"><Edit size={16} /> <span className="text-xs">Edit Profil</span></button>
                    ) : showMenu ? (
                      <div className="relative">
                        <button 
                           onClick={(e) => { 
                             e.stopPropagation(); 
                             setActiveDropdown(activeDropdown === admin.id ? null : admin.id); 
                           }} 
                           className="p-2 rounded-lg transition-colors ml-auto hover:bg-white/10 text-white/70 hover:text-white"
                        >
                           <MoreVertical size={20} />
                        </button>
                        
                        {activeDropdown === admin.id && (
                          <>
                             {/* BACKDROP AMAN & MENU Z-INDEX 50 */}
                             <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }} />
                             
                             <div 
                                ref={dropdownRef}
                                className="absolute right-10 top-8 w-60 bg-dark-surface border border-dark-border shadow-2xl rounded-xl z-50 flex flex-col animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto custom-scrollbar"
                                onClick={(e) => e.stopPropagation()} // STOP PROPAGATION PADA MENU
                             >
                                {/* MENU STAFF */}
                                {admin.role === 'staff' && (
                                  <>
                                    <button onClick={(e) => handleAction('promote_leader', admin)} className="px-4 py-3 text-left hover:bg-white/5 text-sm text-yellow-500 bg-dark-surface border-b border-white/5 flex items-center gap-2"><Crown size={14}/> Jadikan Leader</button>
                                    <button onClick={(e) => handleAction('toggle_lock', admin)} className="px-4 py-3 text-left hover:bg-white/5 text-sm flex items-center gap-2 border-b border-white/5 bg-dark-surface">{admin.is_locked ? <><Unlock size={14}/> Buka Kunci</> : <><Lock size={14}/> Kunci Akun</>}</button>
                                    <button onClick={(e) => handleAction('delete_instant', admin)} className="px-4 py-3 text-left hover:bg-red-500/10 text-red-400 text-sm font-bold bg-dark-surface flex items-center gap-2"><Trash2 size={14}/> Hapus Permanen</button>
                                  </>
                                )}

                                {/* MENU OWNER */}
                                {isOwner && admin.role === 'leader' && (
                                  <>
                                    <div className="px-4 py-2 text-[10px] font-bold text-white/30 bg-black/20 uppercase tracking-wider">Owner Actions</div>
                                    <button onClick={(e) => handleAction('demote_staff', admin)} className="px-4 py-3 text-left hover:bg-white/5 text-sm text-yellow-400 bg-dark-surface border-b border-white/5 flex items-center gap-2"><ShieldAlert size={14}/> Turunkan ke Staff</button>
                                    <button onClick={(e) => handleAction('delete_instant', admin)} className="px-4 py-3 text-left hover:bg-red-500/10 text-red-400 text-sm font-bold bg-dark-surface flex items-center gap-2"><Trash2 size={14}/> Hapus Permanen</button>
                                  </>
                                )}
                              </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="flex items-center justify-end gap-1 text-white/20 text-xs italic cursor-help" title={isTargetOwner ? "OWNER (Kebal Hukum)" : "Sesama Leader terlindungi"}>
                        <Shield size={14} /> Protected
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* === MOBILE LIST === */}
      <div className="md:hidden grid grid-cols-1 gap-4">
         {filteredAdmins.map(admin => (
            <AdminCard 
              key={admin.id} 
              admin={admin} 
              currentUser={currentUser}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              handleAction={handleAction}
              handleEditSelf={() => setShowEditSelfModal(true)} 
              dropdownRef={dropdownRef}
            />
         ))}
      </div>

      {/* === MODAL EDIT DIRI SENDIRI (LENGKAP) === */}
      {showEditSelfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => !showCropper && setShowEditSelfModal(false)}>
          <div className="w-full max-w-lg bg-dark-surface border border-dark-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-dark-border flex justify-between items-center bg-black/20">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><User className="text-primary"/> Edit Profil Saya</h3>
              <button onClick={() => setShowEditSelfModal(false)} className="text-white/50 hover:text-white"><X size={24}/></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {showCropper && tempImgSrc ? (
                <div className="flex flex-col items-center animate-in fade-in">
                  <p className="text-white/60 text-sm mb-4">Geser & Zoom untuk menyesuaikan foto</p>
                  <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-primary shadow-2xl bg-black cursor-move mb-4" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                    <img ref={imgRef} src={tempImgSrc} className="absolute max-w-none pointer-events-none select-none" style={{ transform: `translate(${cropPos.x}px, ${cropPos.y}px) scale(${cropScale})`, transformOrigin: 'center center' }} draggable={false} />
                  </div>
                  <div className="flex items-center gap-4 w-full px-8 mb-6">
                    <ZoomOut size={16} className="text-white/50"/>
                    <input type="range" min="0.5" max="3" step="0.1" value={cropScale} onChange={e => setCropScale(parseFloat(e.target.value))} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary" />
                    <ZoomIn size={16} className="text-white/50"/>
                  </div>
                  <div className="flex gap-2 w-full">
                    <button onClick={() => { setShowCropper(false); setTempImgSrc(null); }} className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold">Batal</button>
                    <button onClick={performCrop} className="flex-1 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold flex items-center justify-center gap-2"><Check size={18}/> Gunakan Foto</button>
                  </div>
                  <canvas ref={canvasRef} className="hidden"></canvas>
                </div>
              ) : (
                <form onSubmit={handleUpdateSelfSubmit} className="space-y-6">
                  <div className="flex p-1 bg-black/30 rounded-xl border border-white/5 mb-6">
                    <button type="button" onClick={() => setSelfTab('profile')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${selfTab === 'profile' ? 'bg-white/10 text-white shadow' : 'text-white/40 hover:text-white'}`}>Profil Umum</button>
                    <button type="button" onClick={() => setSelfTab('security')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${selfTab === 'security' ? 'bg-white/10 text-red-400 shadow' : 'text-white/40 hover:text-white'}`}>Keamanan</button>
                  </div>
                  
                  {selfTab === 'profile' && (
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                      <div className="flex flex-col items-center mb-6">
                        <div className="w-24 h-24 rounded-full border-2 border-primary bg-black/50 overflow-hidden mb-3 relative group">
                          {selfForm.avatar_url ? <img src={selfForm.avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-gray-700 to-gray-900">{selfForm.username[0]?.toUpperCase()}</div>}
                          <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera size={24} className="text-white mb-1"/>
                            <span className="text-[10px] text-white font-bold uppercase">Ganti</span>
                            <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                          </label>
                        </div>
                        <div className="w-full relative">
                           <input value={selfForm.avatar_url} onChange={e => setSelfForm({...selfForm, avatar_url: e.target.value})} placeholder="Atau paste URL gambar..." className="w-full bg-black/30 border border-dark-border rounded-lg py-2 px-3 text-xs text-center text-white/70 focus:border-primary outline-none" />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs uppercase text-white/50 font-bold mb-1 block">Username</label>
                        <div className="flex gap-2">
                          <input value={selfForm.username} onChange={e => setSelfForm({...selfForm, username: e.target.value})} style={{ color: selfForm.username_color }} className="flex-1 bg-black/30 border border-dark-border rounded-lg p-3 font-bold focus:border-primary outline-none" />
                          <div className="relative group">
                            <div className="w-12 h-full rounded-lg border border-dark-border cursor-pointer flex items-center justify-center" style={{ backgroundColor: selfForm.username_color }}><Palette size={20} className="text-black/50 mix-blend-overlay" /></div>
                            <input type="color" value={selfForm.username_color} onChange={e => setSelfForm({...selfForm, username_color: e.target.value})} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"/>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {PRESET_COLORS.map(color => (
                            <button key={color} type="button" onClick={() => setSelfForm({...selfForm, username_color: color})} className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${selfForm.username_color === color ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }}/>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selfTab === 'security' && (
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm mb-4"><AlertTriangle size={16} className="inline mr-2 mb-0.5"/>Anda harus memasukkan password lama untuk mengganti password.</div>
                      <div>
                        <label className="text-xs uppercase text-white/50 font-bold mb-1 block">Password Lama</label>
                        <div className="relative"><Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"/><input type="password" value={selfForm.old_password} onChange={e => setSelfForm({...selfForm, old_password: e.target.value})} className="w-full bg-black/30 border border-dark-border rounded-lg pl-10 p-3 text-white focus:border-primary outline-none" placeholder="••••••" /></div>
                      </div>
                      <div className="pt-2 border-t border-white/10 mt-2">
                        <label className="text-xs uppercase text-white/50 font-bold mb-1 block">Password Baru</label>
                        <input type="password" value={selfForm.new_password} onChange={e => setSelfForm({...selfForm, new_password: e.target.value})} className="w-full bg-black/30 border border-dark-border rounded-lg p-3 text-white focus:border-primary outline-none mb-3" placeholder="Password Baru" />
                        <input type="password" value={selfForm.confirm_password} onChange={e => setSelfForm({...selfForm, confirm_password: e.target.value})} className="w-full bg-black/30 border border-dark-border rounded-lg p-3 text-white focus:border-primary outline-none" placeholder="Ulangi Password Baru" />
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3 pt-4 border-t border-dark-border">
                    <button type="button" onClick={() => setShowEditSelfModal(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold">Batal</button>
                    <button type="submit" className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold">Simpan Perubahan</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === MODAL CONFIRM DELETE (Z-INDEX 100 - PASTI DI ATAS) === */}
      {showConfirmDeleteModal && targetAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowConfirmDeleteModal(false)}>
          <div className="w-full max-w-md bg-dark-surface border border-red-500/30 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4"><AlertTriangle size={32} className="text-red-500" /></div>
              <h3 className="text-2xl font-bold text-white mb-2">Hapus Akun?</h3>
              <p className="text-white/60">Hapus akun <span className="text-white font-bold">{targetAction.username}</span> secara permanen?</p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowConfirmDeleteModal(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold">Batal</button>
              <button type="button" onClick={confirmDeleteInstant} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL NOTIFIKASI & REQUEST === */}
      {showNotifModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowNotifModal(false)}>
          <div className="w-full max-w-2xl bg-dark-surface border border-dark-border rounded-2xl shadow-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-dark-border flex justify-between items-center bg-black/20">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Bell className="text-primary" /> Notifikasi & Permintaan
              </h3>
              <button onClick={() => setShowNotifModal(false)} className="text-white/50 hover:text-white"><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* ALERTS */}
              {securityAlerts.length > 0 && (
                <div className="animate-pulse">
                  <h4 className="text-sm font-bold text-red-500 uppercase mb-3 flex items-center gap-2">
                    <Siren size={16}/> Security Alerts
                  </h4>
                  <div className="space-y-3">
                    {securityAlerts.map(log => (
                      <div key={log.id} className="bg-red-900/20 border border-red-500/50 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                           <AlertTriangle size={20} className="text-red-500"/>
                           <span className="font-bold text-red-200">Alert</span>
                           <span className="text-xs text-white/30 ml-auto">{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-white/80 mb-1">Pelaku: <strong className="text-white">{log.admin_name}</strong></p>
                        <p className="text-xs text-red-300 italic">"{log.details}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REQUESTS */}
              {passRequests.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-white/50 uppercase mb-3 flex items-center gap-2">
                    <KeyRound size={16}/> Reset Password Requests
                  </h4>
                  <div className="space-y-3">
                    {passRequests.map(req => (
                      <div key={req.id} className="bg-black/30 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
                            <Key size={20} />
                          </div>
                          <div>
                            <p className="text-white font-bold">{req.username}</p>
                            <p className="text-xs text-white/50">Lupa password • {new Date(req.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button onClick={() => handlePassRequestDecision(req.id, 'rejected')} className="flex-1 sm:flex-none px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors">Tolak</button>
                          <button onClick={() => handlePassRequestDecision(req.id, 'approved')} className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors">Izinkan Ganti</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {requests.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-white/50 uppercase mb-3 flex items-center gap-2">
                    <Trash2 size={16}/> Deletion Requests
                  </h4>
                  <div className="space-y-3">
                    {requests.map(req => (
                      <div key={req.id} className="bg-black/30 border border-white/10 rounded-xl p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div><h4 className="font-bold text-white text-lg">Hapus: <span className="text-red-400">{req.target_username}</span></h4><p className="text-white/50 text-sm">Oleh: <span className="text-primary">{req.requester_username}</span></p></div>
                          <span className="text-xs text-white/30">{new Date(req.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg text-white/80 text-sm mb-4">"{req.reason}"</div>
                        {req.proof_images && <div className="flex gap-2 mb-4 overflow-x-auto pb-2">{req.proof_images.map((img, idx) => <a key={idx} href={img} target="_blank" rel="noreferrer" className="relative group w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-white/10"><img src={img} className="w-full h-full object-cover"/><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Eye size={16} className="text-white"/></div></a>)}</div>}
                        <div className="flex gap-3">
                          <button onClick={() => handleRequestDecision(req.id, 'rejected')} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold">Tolak</button>
                          <button onClick={() => handleRequestDecision(req.id, 'approved')} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold flex-1">Terima & Hapus</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {requests.length === 0 && passRequests.length === 0 && securityAlerts.length === 0 && (
                <div className="text-center py-20 text-white/30 flex flex-col items-center gap-3">
                  <Bell size={48} className="opacity-20" />
                  <p>Tidak ada notifikasi baru.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}