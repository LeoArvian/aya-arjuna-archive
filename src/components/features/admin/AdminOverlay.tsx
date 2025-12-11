import { useEffect, useState } from 'react';
import { X, Search, ArrowLeft, Loader2, CheckCircle, KeyRound } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { adminService } from '../../../services/adminService';
import AdminDashboard from './AdminDashboard';
import type { AdminUser, PasswordRequest } from '../../../types';
import CoolLoader from '../../shared/CoolLoader';
import { toast } from 'sonner'; // Tambahkan import ini

interface AdminOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// Tipe untuk Screen/Step Lupa Password
type Screen = 'login' | 'search' | 'verify' | 'request_sent' | 'waiting' | 'reset_form';

export default function AdminOverlay({ isOpen, onClose }: AdminOverlayProps) {
  const { user, isAuthenticated, login, checkSession, updateActivity } = useAuthStore();
  
  const [screen, setScreen] = useState<Screen>('login');
  
  // Login Form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Forgot Password Flow
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [lastCharInput, setLastCharInput] = useState('');
  const [requestStatus, setRequestStatus] = useState<PasswordRequest | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Cek sesi saat dibuka
  useEffect(() => {
    if (isOpen) checkSession();
  }, [isOpen, checkSession]);

  // Lock Body Scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const resetFlow = () => {
    setScreen('login');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setLastCharInput('');
    setLoginError('');
    setRequestStatus(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    const res = await adminService.login(username, password);
    if (res.error) {
      setLoginError(res.error);
    } else if (res.user) {
      login(res.user);
      setUsername(''); setPassword('');
      setShowDashboard(true);
    }
    setLoading(false);
  };

  // === LOGIKA LUPA PASSWORD ===

  // 1. Cari User (Live Search)
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const results = await adminService.searchAdminsByUsername(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // 2. PILIH USER -> CEK STATUS REQUEST
  const handleSelectUser = async (u: AdminUser) => {
    setLoading(true);
    setSelectedUser(u);
    
    // Cek apakah ada request pending/approved
    try {
      const existingReq = await adminService.getActivePasswordRequest(u.id);
      setRequestStatus(existingReq);

      if (existingReq?.status === 'approved') {
        // Jika sudah diapprove leader -> Langsung ganti password
        setScreen('reset_form');
      } else if (existingReq?.status === 'pending') {
        // Jika masih pending -> Tampilkan waiting screen
        setScreen('waiting');
      } else {
        // Belum ada request -> Masuk tahap verifikasi karakter terakhir
        setScreen('verify');
      }
    } catch (e) {
      console.error(e);
      // Jika error (misal tabel belum dibuat), fallback ke verify
      setScreen('verify');
    } finally {
      setLoading(false);
    }
  };

  // 3. VERIFIKASI KARAKTER TERAKHIR
  const handleVerifyLastChar = () => {
    if (!selectedUser?.password_hash) return;
    
    const realLastChar = selectedUser.password_hash.slice(-1);
    
    if (lastCharInput === realLastChar) {
      // Benar -> Boleh reset langsung (Self Service)
      setScreen('reset_form');
    } else {
      setLoginError("Karakter salah!");
    }
  };

  // 4. REQUEST KE LEADER (TIDAK INGAT)
  const handleRequestReset = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      await adminService.createPasswordRequest(selectedUser.id);
      setScreen('request_sent');
    } catch (e) {
      setLoginError("Gagal mengirim request.");
    } finally {
      setLoading(false);
    }
  };

  // 5. GANTI PASSWORD BARU
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (newPassword !== confirmNewPassword) {
      setLoginError("Password tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      // Pass request ID jika ini berasal dari approval leader
      await adminService.completePasswordReset(selectedUser.id, newPassword, requestStatus?.id);
      
      // PERBAIKAN: Ganti alert dengan toast.success
      toast.success("Password berhasil diubah! Silakan login kembali.", {
        description: "Gunakan password baru Anda untuk masuk.",
        duration: 4000,
      });
      
      resetFlow();
    } catch (e) {
      setLoginError("Gagal mengganti password.");
    } finally {
      setLoading(false);
    }
  };

  // Reset tampilan dashboard saat panel ditutup
  useEffect(() => {
    if (!isOpen) {
      setShowDashboard(false);
      resetFlow();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // === TAMPILAN DASHBOARD PENUH ===
  if (isAuthenticated && user && showDashboard) {
    return (
      <div className="fixed inset-0 z-50 bg-dark-bg animate-in fade-in duration-200 overflow-hidden" onClick={updateActivity}>
        <AdminDashboard onClose={onClose} />
      </div>
    );
  }

  // === TAMPILAN LOGIN / WIZARD ===
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto custom-scrollbar">
      <button onClick={onClose} className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors z-50"><X size={32} /></button>

      <div className="w-full max-w-md p-6" onClick={updateActivity}>
        
        {/* --- SCREEN: LOGIN --- */}
        {screen === 'login' && (
          <div className="bg-dark-surface border border-dark-border rounded-xl p-8 shadow-2xl">
            {isAuthenticated && user ? (
              // Welcome Back Screen
              <div className="text-center">
                <img src={user.avatar_url || "https://placehold.co/100"} alt="Profile" className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-primary object-cover"/>
                <h2 className="text-2xl font-bold text-white mb-1" style={{ color: user.username_color || '#fff' }}>Halo, {user.username}</h2>
                <p className="text-white/60 uppercase text-sm tracking-wider mb-8 font-bold text-primary">{user.role}</p>
                <div className="space-y-3">
                  <button onClick={() => setShowDashboard(true)} className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold transition-all">Masuk Dashboard Admin</button>
                  <button onClick={onClose} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-all">Kembali ke Website</button>
                </div>
              </div>
            ) : (
              // Login Form
              <>
                <div className="text-center mb-8">
                    <img 
                      src="../../../../public/AJA.png" 
                      alt="Admin Logo" 
                      className="w-24 h-24 mx-auto mb-4 object-contain drop-shadow-2xl animate-in zoom-in duration-500 rounded-full border-4 border-primary/20 animate-float"
                    />
                    <h2 className="text-2xl font-bold text-white">Admin Access</h2>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-black/30 border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="Username" />
                  </div>
                  <div>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/30 border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="Password" />
                  </div>
                  
                  {/* BUTTON LUPA PASSWORD DISINI */}
                  <div className="flex justify-end">
                    <button type="button" onClick={() => setScreen('search')} className="text-xs text-primary hover:text-primary-light hover:underline font-bold">
                      Lupa Password?
                    </button>
                  </div>

                  {loginError && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">{loginError}</div>}
                  <button type="submit" disabled={loading} className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-all disabled:opacity-50">{loading ? 'Memproses...' : 'Login'}</button>
                </form>
              </>
            )}
          </div>
        )}

        {/* --- SCREEN: SEARCH USER --- */}
        {screen === 'search' && (
          <div className="bg-dark-surface border border-dark-border rounded-xl p-8 shadow-2xl animate-in slide-in-from-right-4">
            <button onClick={resetFlow} className="mb-4 text-white/50 hover:text-white flex items-center gap-2 text-sm"><ArrowLeft size={16}/> Kembali Login</button>
            <h2 className="text-xl font-bold text-white mb-2">Cari Akun Anda</h2>
            <p className="text-white/50 text-sm mb-6">Masukkan username untuk menemukan akun.</p>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18}/>
              <input 
                autoFocus
                value={searchQuery} 
                onChange={(e) => handleSearch(e.target.value)} 
                className="w-full bg-black/30 border border-dark-border rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary" 
                placeholder="Ketik username..." 
              />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {searchResults.map(u => (
                <button 
                  key={u.id} 
                  onClick={() => handleSelectUser(u)}
                  className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left"
                >
                  <img src={u.avatar_url || "https://placehold.co/50"} className="w-10 h-10 rounded-full object-cover"/>
                  <span className="font-bold text-white">{u.username}</span>
                </button>
              ))}
              {searchQuery && searchResults.length === 0 && <div className="text-white/30 text-center py-4 text-sm">Tidak ditemukan.</div>}
            </div>
            {loading && <div className="text-center text-primary mt-4"><Loader2 className="animate-spin inline"/> Memuat...</div>}
          </div>
        )}

        {/* --- SCREEN: VERIFY LAST CHAR --- */}
        {screen === 'verify' && selectedUser && (
          <div className="bg-dark-surface border border-dark-border rounded-xl p-8 shadow-2xl animate-in slide-in-from-right-4">
            <button onClick={() => setScreen('search')} className="mb-4 text-white/50 hover:text-white flex items-center gap-2 text-sm"><ArrowLeft size={16}/> Kembali</button>
            <div className="text-center mb-6">
              <img src={selectedUser.avatar_url || "https://placehold.co/100"} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-2 border-primary"/>
              <h3 className="text-lg font-bold text-white">Halo, {selectedUser.username}</h3>
              <p className="text-white/50 text-sm">Untuk keamanan, verifikasi kepemilikan akun.</p>
            </div>

            <div className="bg-black/30 p-4 rounded-xl border border-white/5 mb-6 text-center">
              <label className="block text-white/70 text-sm mb-3">Masukkan 1 Huruf/Angka <strong>TERAKHIR</strong> dari password Anda:</label>
              <input 
                maxLength={1}
                value={lastCharInput}
                onChange={(e) => setLastCharInput(e.target.value)}
                className="w-12 h-12 text-center text-xl font-bold bg-white/10 border border-white/20 rounded-lg text-white focus:border-primary outline-none mx-auto block"
              />
            </div>

            {loginError && <div className="text-red-400 text-center text-sm mb-4">{loginError}</div>}

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleVerifyLastChar}
                disabled={!lastCharInput}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-all disabled:opacity-50"
              >
                Verifikasi & Ganti Password
              </button>
              <button 
                onClick={handleRequestReset}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-medium rounded-lg transition-all"
              >
                Saya Lupa Password (Minta Leader)
              </button>
            </div>
          </div>
        )}

        {/* --- SCREEN: REQUEST SENT --- */}
        {screen === 'request_sent' && (
          <div className="bg-dark-surface border border-dark-border rounded-xl p-8 shadow-2xl text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Request Terkirim!</h2>
            <p className="text-white/60 text-sm mb-6">
              Permintaan reset password telah dikirim ke Leader. Silakan hubungi Leader untuk mempercepat proses.
            </p>
            <button onClick={resetFlow} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg">Kembali ke Login</button>
          </div>
        )}

        {/* --- SCREEN: WAITING FOR APPROVAL --- */}
        {screen === 'waiting' && (
          <div className="bg-dark-surface border border-dark-border rounded-xl p-8 shadow-2xl text-center animate-in zoom-in-95">
            <div className="flex justify-center mb-6">
               <CoolLoader text="Menunggu Persetujuan..." />
            </div>
            <p className="text-white/50 text-sm mb-6 mt-4">
              Permintaan Anda sedang diproses oleh Leader. Coba lagi nanti jika sudah disetujui.
            </p>
            <button onClick={resetFlow} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg">Kembali</button>
          </div>
        )}

        {/* --- SCREEN: RESET FORM --- */}
        {screen === 'reset_form' && (
          <div className="bg-dark-surface border border-dark-border rounded-xl p-8 shadow-2xl animate-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><KeyRound className="text-primary"/> Ganti Password Baru</h2>
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="text-xs uppercase text-white/50 font-bold mb-1 block">Password Baru</label>
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-black/30 border border-dark-border rounded-lg p-3 text-white focus:border-primary outline-none" />
              </div>
              <div>
                <label className="text-xs uppercase text-white/50 font-bold mb-1 block">Konfirmasi Password</label>
                <input type="password" required value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="w-full bg-black/30 border border-dark-border rounded-lg p-3 text-white focus:border-primary outline-none" />
              </div>
              
              {loginError && <div className="text-red-400 text-sm">{loginError}</div>}

              <button type="submit" disabled={loading} className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg mt-4">
                {loading ? 'Menyimpan...' : 'Simpan Password'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}