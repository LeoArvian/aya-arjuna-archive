import type { TalentProfile } from '../../../types';
import { Mail, Instagram, Twitter, MessageCircle, DollarSign, Youtube } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../../store/useSettingsStore'; 

interface ProfileBioProps {
  profile: TalentProfile;
}

export default function ProfileBio({ profile }: ProfileBioProps) {
  const { t } = useTranslation();
  const { language } = useSettingsStore(); 
  const links: any = profile.social_links || {};

  // Helper untuk ambil teks sesuai bahasa (fallback ke ID jika kosong)
  const getLoc = (data: any) => {
    if (typeof data === 'string') return data; 
    if (!data) return "-";
    return data[language] || data['en'] || data['id'] || "-";
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      
      {/* Header Nama & Deskripsi */}
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{getLoc(profile.name)}</h1>
        {/* PERBAIKAN DI SINI: Tambahkan (profile.sub_count || 0) */}
        <p className="text-xl text-primary font-medium mb-4">{(profile.sub_count || 0).toLocaleString()} {t('profile.subscribers')}</p>
        <p className="text-white/70 leading-relaxed whitespace-pre-line">
          {getLoc(profile.description)}
        </p>
      </div>

      {/* Grid Informasi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-dark-surface p-6 rounded-2xl border border-dark-border">
        <InfoItem label={t('profile.fan_name')} value={getLoc(profile.fan_name)} />
        <InfoItem label={t('profile.birthday')} value={profile.birthday} />
        {/* Tambahan safety check untuk tanggal debut juga */}
        <InfoItem label={t('profile.debut')} value={profile.debut_date ? new Date(profile.debut_date).toLocaleDateString() : "-"} />
        <InfoItem label={t('profile.language')} value={profile.languages?.join(", ")} />
        <InfoItem label={t('profile.family')} value={getLoc(profile.family)} />
        
        {/* Hashtags - VERSI BARU (Dinamis dari Array) */}
        <div className="col-span-1 md:col-span-2 space-y-2 mt-2">
          {profile.hashtags && profile.hashtags.length > 0 ? (
            profile.hashtags.map((tag, idx) => (
              <div key={idx} className="flex gap-2 text-sm">
                <span className="text-white/50 w-24 capitalize">{tag.label}</span>
                <span className="text-primary font-medium">#{tag.value}</span>
              </div>
            ))
          ) : (
            <div className="text-white/30 text-sm italic">Belum ada hashtag</div>
          )}
        </div>

        {/* Likes / Dislikes */}
        <div className="col-span-1 md:col-span-2 border-t border-dark-border pt-4 mt-2 grid grid-cols-2 gap-4">
          <div>
            <span className="text-green-400 text-sm font-bold block mb-1">{t('profile.likes')}</span>
            <ul className="list-disc list-inside text-white/70 text-sm">
              {profile.likes?.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
          <div>
            <span className="text-red-400 text-sm font-bold block mb-1">{t('profile.dislikes')}</span>
            <ul className="list-disc list-inside text-white/70 text-sm">
              {profile.dislikes?.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* Kontak */}
      <div className="bg-dark-surface p-6 rounded-2xl border border-dark-border">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Mail className="text-primary" size={20} /> {t('profile.contact')}
        </h3>
        {profile.contact_email ? (
            <a href={`mailto:${profile.contact_email}`} className="text-white/80 hover:text-primary transition-colors underline decoration-dotted">
              {profile.contact_email}
            </a>
        ) : (
            <span className="text-white/30">-</span>
        )}
      </div>

      {/* Links */}
      <div className="bg-dark-surface p-6 rounded-2xl border border-dark-border">
        <h3 className="text-lg font-bold text-white mb-4">{t('profile.links')}</h3>
        <div className="flex flex-wrap gap-3">
          <SocialBtn href={links.youtube} icon={<Youtube size={18} />} label="YouTube" color="bg-red-600" />
          <SocialBtn href={links.twitter} icon={<Twitter size={18} />} label="Twitter/X" color="bg-black border border-white/20" />
          <SocialBtn href={links.instagram} icon={<Instagram size={18} />} label="Instagram" color="bg-pink-600" />
          <SocialBtn href={links.tiktok} icon={<span>TT</span>} label="TikTok" color="bg-black border border-white/20" />
          <SocialBtn href={links.saweria} icon={<DollarSign size={18} />} label="Saweria" color="bg-yellow-600" />
          <SocialBtn href={links.whatsapp} icon={<MessageCircle size={18} />} label="WhatsApp" color="bg-green-600" />
          <SocialBtn href={links.discord} icon={<span>DC</span>} label="Discord" color="bg-indigo-600" />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string, value?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wider text-white/40 mb-1">{label}</span>
      <span className="text-white font-medium">{value || "-"}</span>
    </div>
  );
}

function SocialBtn({ href, icon, label, color }: { href?: string, icon: React.ReactNode, label: string, color: string }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noreferrer" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-bold hover:scale-105 transition-transform ${color}`}>
      {icon} {label}
    </a>
  );
}