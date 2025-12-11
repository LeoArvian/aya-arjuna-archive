// --- GENERAL TYPES ---

export interface MultilingualText {
  id: string;
  en: string;
  jp: string;
  kr: string;
  ru: string;
}

// Tipe Hashtag Baru (Sesuai JSONB di Database)
export interface Hashtag {
  label: string;
  value: string;
}

// --- TALENT PROFILE (Updated) ---
export interface TalentProfile {
  id: string;
  name: MultilingualText;
  description: MultilingualText;
  sub_count: number;
  languages: string[];
  debut_date: string;
  birthday: string;
  fan_name: MultilingualText;
  
  hashtags: Hashtag[]; // Field Hashtag Baru
  
  likes: string[];
  dislikes: string[];
  family: MultilingualText;
  
  // === UPDATE BAGIAN INI ===
  sprites: string[]; // Array URL Sprite (Dinamis)
  // Hapus sprite_url, sprite_url_2, sprite_url_3
  
  contact_email: string;
  social_links: {
    youtube?: string;
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    saweria?: string;
    whatsapp?: string;
    discord?: string;
  };
  is_live?: boolean;
  live_url?: string;
}


// YANG BARU (LEBIH BERSIH)
export type UserRole = 'leader' | 'staff';

export interface AdminUser {
  id: string;
  username: string;
  username_color?: string;
  avatar_url?: string;
  role: UserRole;
  is_locked: boolean;
  created_by?: string;
  created_at: string;
  last_login?: string;
  password_hash?: string; 
}

export interface DeletionRequest {
  id: string;
  target_admin_id: string;
  requester_id: string;
  reason: string;
  proof_images: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  target_username?: string;
  requester_username?: string;
}

export interface PasswordRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'completed';
  created_at: string;
  username?: string;
}

export interface ActivityLog {
  id: string;
  admin_id: string;
  action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'OTHER';
  target_section: string;
  details: string;
  created_at: string;
  admin_name?: string;
  admin_role?: string;
}

// --- CONTENT ---
export type ContentType = 'stream' | 'video' | 'post';
export type BadgeType = 'membership' | 'upcoming' | 'none' | 'original' | 'cover' | 'ongoing';

export interface TimelineItem {
  id: string;
  talent: 'aya' | 'arjuna';
  title: string;
  description: string;
  type: ContentType;
  badge: BadgeType;
  date: string;
  url: string;
  thumbnail_url: string;
  created_at: string;
}

export interface MemoryItem {
  id: string;
  talent: 'aya' | 'arjuna' | 'all';
  title: string;
  description: string;
  author_name: string;
  platform: 'twitter' | 'youtube' | 'instagram' | 'game_download' | 'game_web' | 'other';
  platform_url: string;
  media_url: string;
  date: string;
  created_at: string;
}

export interface SongItem {
  id: string;
  talent: 'aya' | 'arjuna' | 'duet';
  title: string;
  type: 'original' | 'cover';
  duration: string;
  release_date: string;
  youtube_url: string;
  thumbnail_url: string;
  created_at: string;
}

// --- INTERACTION ---
export interface GuestbookMessage {
  id: string;
  sender_name: string;
  message: string;
  status: 'pending' | 'approved';
  created_at: string;
}

export interface FanCard {
  id: string;
  sender_name: string;
  message: string;
  theme: 'aya' | 'arjuna';
  image_url: string;
  created_at: string;
  
  raw_logo_url?: string;
  custom_bg_url?: string;
  bg_overlay_opacity?: number;
  logo_mode?: 'default' | 'emoji' | 'image';
  custom_emoji?: string;
  style_config?: any;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface FanCardConfig {
  id: string;
  is_form_active: boolean;
  is_gallery_active: boolean;
  active_event: 'debut' | 'aya_bday' | 'arjuna_bday';
  active_year: 1 | 2 | 3;
  updated_at: string;
}

export interface ReportTicket {
  id: string;
  category: 'home' | 'profile' | 'timeline' | 'memories' | 'songs' | 'other';
  description: string;
  image_url?: string;
  status: 'pending' | 'resolved';
  created_at: string;
}