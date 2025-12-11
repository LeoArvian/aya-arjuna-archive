import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  // 1. INDONESIA (ID)
  id: {
    translation: {
      nav: {
        home: "Beranda",
        profile: "Profil",
        timeline: "Linimasa",
        memories: "Karya Fans",
        songs: "Lagu",
        settings: "Pengaturan"
      },
      home: {
        title: "Aya & Arjuna",
        subtitle: "Arsip Penggemar Resmi",
        desc: "Virtual Youtubers • Content Creators • Artists",
        welcome: "Tentang Website",
        welcome_desc: "Selamat datang di website resmi arsip dan portofolio Aya Aulya dan Arjuna Arkana. Temukan perjalanan karir, karya musik, dan kreativitas fans terbaik mereka di sini.",
        btn_aya: "Lihat Profil Aya",
        btn_arjuna: "Lihat Profil Arjuna",
        next_stream: "LIVE BERIKUTNYA",
        no_schedule: "Belum ada jadwal stream mendatang.",
        remind_me: "Buka Stream",
        check_schedule: "Cek Jadwal Lengkap",
        
        // Anniversary
        countdown_title: "Menuju Anniversary Debut",
        days: "Hari",
        hours: "Jam",
        minutes: "Menit",
        seconds: "Detik",
        happy_anniv: "SELAMAT ANNIVERSARY!",
        anniv_desc: "Terima kasih telah menemani perjalanan Aya & Arjuna.",
        anniv_debut_title: "HAPPY DEBUT ANNIVERSARY!",
        anniv_debut_desc: "Merayakan perjalanan luar biasa Aya & Arjuna bersama kita.",
        anniv_aya_title: "HAPPY ANNIVERSARY AYA AULYA!",
        anniv_aya_desc: "Selamat merayakan hari spesial untuk Aya Aulya.",
        anniv_arjuna_title: "HAPPY ANNIVERSARY ARJUNA ARKANA!",
        anniv_arjuna_desc: "Selamat merayakan hari spesial untuk Arjuna Arkana.",

        // Oshi Meter
        oshi_title: "Oshi Meter",
        oshi_desc: "Tunjukkan dukunganmu! Klik untuk mengirim semangat.",
        btn_support_aya: "Semangati Aya",
        btn_support_arjuna: "Semangati Arjuna",
        total_support: "Total Dukungan"
      },
      profile: {
        loading: "Menyiapkan Profil...",
        subscribers: "Pelanggan",
        fan_name: "Nama Fan",
        birthday: "Ulang Tahun",
        debut: "Tanggal Debut",
        language: "Bahasa",
        family: "Keluarga",
        likes: "Hal yang Disukai",
        dislikes: "Hal yang Dibenci",
        contact: "Kontak",
        links: "Tautan Resmi",
        tabs: {
          bio: "Bio/Info",
          timeline: "Linimasa",
          memories: "Karya Fans",
          songs: "Lagu"
        }
      },
      timeline: {
        title: "Jejak Aktivitas",
        desc: "Arsip stream, video, dan postingan komunitas.",
        loading: "Memuat Aktivitas...",
        search_placeholder: "Cari judul aktivitas...",
        sort: "Urutkan",
        filter_year: "Semua Tahun",
        filter_month: "Semua Bulan",
        newest: "Terbaru",
        oldest: "Terlama",
        watch_video: "Tonton Video",
        view_post: "Lihat Postingan",
        no_data: "Tidak ada aktivitas ditemukan."
      },
      memories: {
        title: "Galeri Karya Fans",
        desc: "Kumpulan Fanart, klip, game, dan kreasi kreatif dari komunitas.",
        loading: "Memuat Karya...",
        search_placeholder: "Cari judul atau artis...",
        view_on: "Lihat di",
        watch_on: "Tonton di",
        download: "Unduh",
        no_data: "Belum ada karya tersimpan."
      },
      songs: {
        title: "Diskografi",
        desc: "Koleksi Original Song & Cover Song.",
        loading: "Memuat Lagu...",
        search_placeholder: "Cari judul lagu...",
        type_all: "Semua",
        type_original: "Original",
        type_cover: "Cover",
        play: "Putar Lagu",
        no_data: "Lagu tidak ditemukan."
      },
      settings: {
        title: "Pengaturan",
        tab_lang: "Bahasa",
        tab_report: "Lapor Masalah",
        lang_desc: "Pilih bahasa tampilan website:",
        report: {
          category_label: "Bagian yang bermasalah",
          cat_home: "Menu Beranda",
          cat_profile: "Menu Profil",
          cat_timeline: "Menu Linimasa",
          cat_memories: "Menu Karya Fans",
          cat_songs: "Menu Lagu",
          cat_other: "Lainnya",
          other_placeholder: "Sebutkan bagian mana...",
          desc_label: "Detail Masalah",
          desc_placeholder: "Jelaskan apa yang terjadi, error apa yang muncul...",
          upload_label: "Lampiran (Opsional)",
          upload_btn: "Unggah Screenshot",
          cancel: "Batal",
          submit: "Kirim Laporan",
          success: "Laporan berhasil dikirim! Terima kasih atas masukan Anda.",
          contact_help: "Butuh bantuan mendesak?"
        }
      }
    }
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "id", // Bahasa default awal
    fallbackLng: "id",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;