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

  // 2. ENGLISH (EN)
  en: {
    translation: {
      nav: {
        home: "Home",
        profile: "Profile",
        timeline: "Timeline",
        memories: "Fan Works",
        songs: "Songs",
        settings: "Settings"
      },
      home: {
        title: "Aya & Arjuna",
        subtitle: "Official Fan Archive",
        desc: "Virtual Youtubers • Content Creators • Artists",
        welcome: "About Website",
        welcome_desc: "Welcome to the official fan archive and portfolio of Aya Aulya and Arjuna Arkana. Discover their career journey, music works, and amazing fan creations here.",
        btn_aya: "View Aya's Profile",
        btn_arjuna: "View Arjuna's Profile",
        next_stream: "NEXT LIVE STREAM",
        no_schedule: "No upcoming streams scheduled.",
        remind_me: "Open Stream",
        check_schedule: "Check Full Schedule",
        
        countdown_title: "Road to Debut Anniversary",
        days: "Days",
        hours: "Hours",
        minutes: "Mins",
        seconds: "Secs",
        happy_anniv: "HAPPY ANNIVERSARY!",
        anniv_desc: "Thank you for accompanying Aya & Arjuna's journey.",
        anniv_debut_title: "HAPPY DEBUT ANNIVERSARY!",
        anniv_debut_desc: "Celebrating the amazing journey of Aya & Arjuna with us.",
        anniv_aya_title: "HAPPY ANNIVERSARY AYA AULYA!",
        anniv_aya_desc: "Celebrating a special day for Aya Aulya.",
        anniv_arjuna_title: "HAPPY ANNIVERSARY ARJUNA ARKANA!",
        anniv_arjuna_desc: "Celebrating a special day for Arjuna Arkana.",

        oshi_title: "Oshi Meter",
        oshi_desc: "Show your support! Click to send energy.",
        btn_support_aya: "Support Aya",
        btn_support_arjuna: "Support Arjuna",
        total_support: "Total Support"
      },
      profile: {
        loading: "Preparing Profile...",
        subscribers: "Subscribers",
        fan_name: "Fan Name",
        birthday: "Birthday",
        debut: "Debut Date",
        language: "Languages",
        family: "Family",
        likes: "Likes",
        dislikes: "Dislikes",
        contact: "Contact",
        links: "Official Links",
        tabs: {
          bio: "Bio/Info",
          timeline: "Timeline",
          memories: "Fan Works",
          songs: "Songs"
        }
      },
      timeline: {
        title: "Activity Timeline",
        desc: "Archive of streams, videos, and community posts.",
        loading: "Loading Activities...",
        search_placeholder: "Search activity title...",
        sort: "Sort By",
        filter_year: "All Years",
        filter_month: "All Months",
        newest: "Newest",
        oldest: "Oldest",
        watch_video: "Watch Video",
        view_post: "View Post",
        no_data: "No activities found."
      },
      memories: {
        title: "Fan Works Gallery",
        desc: "Fanart, clips, games, and special creations from the community.",
        loading: "Loading Works...",
        search_placeholder: "Search title or artist...",
        view_on: "View on",
        watch_on: "Watch on",
        download: "Download",
        no_data: "No works saved yet."
      },
      songs: {
        title: "Discography",
        desc: "Collection of Original Songs & Cover Songs.",
        loading: "Loading Songs...",
        search_placeholder: "Search song title...",
        type_all: "All",
        type_original: "Original",
        type_cover: "Cover",
        play: "Play Song",
        no_data: "No songs found."
      },
      settings: {
        title: "Settings",
        tab_lang: "Language",
        tab_report: "Report Issue",
        lang_desc: "Select website display language:",
        report: {
          category_label: "Problematic Section",
          cat_home: "Home Menu",
          cat_profile: "Profile Menu",
          cat_timeline: "Timeline Menu",
          cat_memories: "Fan Works Menu",
          cat_songs: "Songs Menu",
          cat_other: "Other",
          other_placeholder: "Specify which part...",
          desc_label: "Issue Details",
          desc_placeholder: "Explain what happened, what error appeared...",
          upload_label: "Attachment (Optional)",
          upload_btn: "Upload Screenshot",
          cancel: "Cancel",
          submit: "Send Report",
          success: "Report sent successfully! Thank you for your feedback.",
          contact_help: "Need urgent help?"
        }
      }
    }
  },

  // 3. JAPANESE (JP)
  jp: {
    translation: {
      nav: {
        home: "ホーム",
        profile: "プロフィール",
        timeline: "タイムライン",
        memories: "ファン作品",
        songs: "歌",
        settings: "設定"
      },
      home: {
        title: "アヤ & アルジュナ",
        subtitle: "公式ファンアーカイブ",
        desc: "バーチャルYouTuber • コンテンツクリエイター • アーティスト",
        welcome: "ウェブサイトについて",
        welcome_desc: "アヤ・アウリヤとアルジュナ・アルカナの公式ファンアーカイブへようこそ。彼らのキャリア、音楽作品、そしてファンの皆様の素晴らしい創作物をここで見つけてください。",
        btn_aya: "アヤのプロフィール",
        btn_arjuna: "アルジュナのプロフィール",
        next_stream: "次回の配信",
        no_schedule: "予定されている配信はありません。",
        remind_me: "配信を開く",
        check_schedule: "スケジュールを確認",
        
        countdown_title: "デビュー記念日まで",
        days: "日",
        hours: "時間",
        minutes: "分",
        seconds: "秒",
        happy_anniv: "記念日おめでとう！",
        anniv_desc: "アヤとアルジュナの旅に同行してくれてありがとう。",
        anniv_debut_title: "デビュー記念日おめでとう！",
        anniv_debut_desc: "アヤとアルジュナの素晴らしい旅を祝いましょう。",
        anniv_aya_title: "アヤ・アウリヤ 記念日おめでとう！",
        anniv_aya_desc: "アヤ・アウリヤの特別な日をお祝いします。",
        anniv_arjuna_title: "アルジュナ・アルカナ 記念日おめでとう！",
        anniv_arjuna_desc: "アルジュナ・アルカナの特別な日をお祝いします。",

        oshi_title: "推しメーター",
        oshi_desc: "応援を送ろう！クリックしてエネルギーを送ってください。",
        btn_support_aya: "アヤを応援",
        btn_support_arjuna: "アルジュナを応援",
        total_support: "総応援数"
      },
      profile: {
        loading: "プロフィールを準備中...",
        subscribers: "登録者数",
        fan_name: "ファンネーム",
        birthday: "誕生日",
        debut: "デビュー日",
        language: "言語",
        family: "家族",
        likes: "好きなもの",
        dislikes: "嫌いなもの",
        contact: "連絡先",
        links: "公式リンク",
        tabs: {
          bio: "プロフィール",
          timeline: "タイムライン",
          memories: "ファン作品",
          songs: "歌"
        }
      },
      timeline: {
        title: "活動の軌跡",
        desc: "配信、動画、コミュニティ投稿のアーカイブ。",
        loading: "活動を読み込み中...",
        search_placeholder: "タイトルを検索...",
        sort: "並び替え",
        filter_year: "すべての年",
        filter_month: "すべての月",
        newest: "新しい順",
        oldest: "古い順",
        watch_video: "動画を見る",
        view_post: "投稿を見る",
        no_data: "活動が見つかりません。"
      },
      memories: {
        title: "ファン作品ギャラリー",
        desc: "コミュニティからのファンアート、クリップ、ゲーム。",
        loading: "作品を読み込み中...",
        search_placeholder: "タイトルやアーティストを検索...",
        view_on: "で見る",
        watch_on: "で見る",
        download: "ダウンロード",
        no_data: "まだ作品が保存されていません。"
      },
      songs: {
        title: "ディスコグラフィ",
        desc: "オリジナル曲とカバー曲のコレクション。",
        loading: "曲を読み込み中...",
        search_placeholder: "曲名を検索...",
        type_all: "すべて",
        type_original: "オリジナル",
        type_cover: "カバー",
        play: "再生する",
        no_data: "曲が見つかりません。"
      },
      settings: {
        title: "設定",
        tab_lang: "言語",
        tab_report: "問題を報告",
        lang_desc: "表示言語を選択してください：",
        report: {
          category_label: "問題のある箇所",
          cat_home: "ホームメニュー",
          cat_profile: "プロフィールメニュー",
          cat_timeline: "タイムラインメニュー",
          cat_memories: "ファン作品メニュー",
          cat_songs: "歌メニュー",
          cat_other: "その他",
          other_placeholder: "具体的な箇所を入力...",
          desc_label: "詳細",
          desc_placeholder: "何が起きたか、どのようなエラーが出たか説明してください...",
          upload_label: "添付ファイル（任意）",
          upload_btn: "スクリーンショットをアップロード",
          cancel: "キャンセル",
          submit: "報告を送信",
          success: "報告が送信されました！ご意見ありがとうございます。",
          contact_help: "緊急のヘルプが必要ですか？"
        }
      }
    }
  },

  // 4. KOREAN (KR)
  kr: {
    translation: {
      nav: {
        home: "홈",
        profile: "프로필",
        timeline: "타임라인",
        memories: "팬 창작물",
        songs: "노래",
        settings: "설정"
      },
      home: {
        title: "아야 & 아르주나",
        subtitle: "공식 팬 아카이브",
        desc: "버츄얼 유튜버 • 콘텐츠 크리에이터 • 아티스트",
        welcome: "웹사이트 소개",
        welcome_desc: "아야 아울리아와 아르주나 아르카나의 공식 팬 아카이브에 오신 것을 환영합니다. 그들의 활동 기록, 음악, 그리고 팬들의 멋진 창작물을 여기서 확인하세요.",
        btn_aya: "아야 프로필 보기",
        btn_arjuna: "아르주나 프로필 보기",
        next_stream: "다음 라이브",
        no_schedule: "예정된 스트리밍이 없습니다.",
        remind_me: "스트림 열기",
        check_schedule: "전체 일정 확인",
        
        countdown_title: "데뷔 기념일까지",
        days: "일",
        hours: "시간",
        minutes: "분",
        seconds: "초",
        happy_anniv: "기념일 축하합니다!",
        anniv_desc: "아야 & 아르주나의 여정에 함께 해주셔서 감사합니다.",
        anniv_debut_title: "데뷔 기념일 축하합니다!",
        anniv_debut_desc: "아야와 아르주나의 여정을 축하합니다.",
        anniv_aya_title: "아야 아울리아 기념일 축하!",
        anniv_aya_desc: "아야의 특별한 날.",
        anniv_arjuna_title: "아르주나 아르카나 기념일 축하!",
        anniv_arjuna_desc: "아르주나의 특별한 날.",

        oshi_title: "오시 미터",
        oshi_desc: "응원을 보내주세요! 클릭하여 에너지를 보내세요.",
        btn_support_aya: "아야 응원하기",
        btn_support_arjuna: "아르주나 응원하기",
        total_support: "총 응원"
      },
      profile: {
        loading: "프로필 준비 중...",
        subscribers: "구독자 수",
        fan_name: "팬덤명",
        birthday: "생일",
        debut: "데뷔일",
        language: "사용 언어",
        family: "가족",
        likes: "좋아하는 것",
        dislikes: "싫어하는 것",
        contact: "연락처",
        links: "공식 링크",
        tabs: {
          bio: "정보",
          timeline: "타임라인",
          memories: "팬 창작물",
          songs: "노래"
        }
      },
      timeline: {
        title: "활동 기록",
        desc: "스트리밍, 비디오 및 커뮤니티 게시물 아카이브.",
        loading: "활동 로딩 중...",
        search_placeholder: "활동 제목 검색...",
        sort: "정렬",
        filter_year: "모든 연도",
        filter_month: "모든 월",
        newest: "최신순",
        oldest: "오래된순",
        watch_video: "비디오 보기",
        view_post: "게시물 보기",
        no_data: "활동을 찾을 수 없습니다."
      },
      memories: {
        title: "팬 창작물 갤러리",
        desc: "팬아트, 클립 및 커뮤니티의 창작물.",
        loading: "작품 로딩 중...",
        search_placeholder: "제목 또는 아티스트 검색...",
        view_on: "에서 보기",
        watch_on: "에서 보기",
        download: "다운로드",
        no_data: "저장된 창작물이 없습니다."
      },
      songs: {
        title: "디스코그래피",
        desc: "오리지널 곡 및 커버 곡 모음.",
        loading: "노래 로딩 중...",
        search_placeholder: "노래 제목 검색...",
        type_all: "전체",
        type_original: "오리지널",
        type_cover: "커버",
        play: "재생",
        no_data: "노래를 찾을 수 없습니다."
      },
      settings: {
        title: "설정",
        tab_lang: "언어",
        tab_report: "문제 신고",
        lang_desc: "웹사이트 표시 언어 선택:",
        report: {
          category_label: "문제가 발생한 부분",
          cat_home: "홈 메뉴",
          cat_profile: "프로필 메뉴",
          cat_timeline: "타임라인 메뉴",
          cat_memories: "팬 창작물 메뉴",
          cat_songs: "노래 메뉴",
          cat_other: "기타",
          other_placeholder: "어느 부분인지 입력하세요...",
          desc_label: "세부 내용",
          desc_placeholder: "무슨 일이 일어났는지, 어떤 오류가 떴는지 설명해주세요...",
          upload_label: "첨부 파일 (선택 사항)",
          upload_btn: "스크린샷 업로드",
          cancel: "취소",
          submit: "신고 보내기",
          success: "신고가 전송되었습니다! 의견 감사합니다.",
          contact_help: "긴급한 도움이 필요하신가요?"
        }
      }
    }
  },

  // 5. RUSSIAN (RU)
  ru: {
    translation: {
      nav: {
        home: "Главная",
        profile: "Профиль",
        timeline: "Таймлайн",
        memories: "Творчество",
        songs: "Песни",
        settings: "Настройки"
      },
      home: {
        title: "Ая и Арджуна",
        subtitle: "Официальный фан-архив",
        desc: "Виртуальные ютуберы • Контент-мейкеры • Артисты",
        welcome: "О веб-сайте",
        welcome_desc: "Добро пожаловать в официальный фан-архив и портфолио Аи Аулии и Арджуны Арканы. Откройте для себя их карьеру, музыку и лучшие творения фанатов здесь.",
        btn_aya: "Профиль Аи",
        btn_arjuna: "Профиль Арджуны",
        next_stream: "СЛЕДУЮЩИЙ СТРИМ",
        no_schedule: "Нет запланированных трансляций.",
        remind_me: "Открыть стрим",
        check_schedule: "Полное расписание",
        
        countdown_title: "До годовщины дебюта",
        days: "Дней",
        hours: "Часов",
        minutes: "Минут",
        seconds: "Секунд",
        happy_anniv: "С ГОДОВЩИНОЙ!",
        anniv_desc: "Спасибо, что сопровождали Аю и Арджуну в этом путешествии.",
        anniv_debut_title: "С ГОДОВЩИНОЙ ДЕБЮТА!",
        anniv_debut_desc: "Празднуем путешествие Аи и Арджуны.",
        anniv_aya_title: "С ГОДОВЩИНОЙ АЯ!",
        anniv_aya_desc: "Особый день Аи.",
        anniv_arjuna_title: "С ГОДОВЩИНОЙ АРДЖУНА!",
        anniv_arjuna_desc: "Особый день Арджуны.",

        oshi_title: "Оши-метр",
        oshi_desc: "Поддержите! Нажмите, чтобы отправить энергию.",
        btn_support_aya: "Поддержать Аю",
        btn_support_arjuna: "Поддержать Арджуну",
        total_support: "Всего поддержки"
      },
      profile: {
        loading: "Подготовка профиля...",
        subscribers: "Подписчики",
        fan_name: "Фан-имя",
        birthday: "День рождения",
        debut: "Дата дебюта",
        language: "Языки",
        family: "Семья",
        likes: "Нравится",
        dislikes: "Не нравится",
        contact: "Контакты",
        links: "Ссылки",
        tabs: {
          bio: "Инфо",
          timeline: "Таймлайн",
          memories: "Творчество",
          songs: "Песни"
        }
      },
      timeline: {
        title: "Лента активности",
        desc: "Архив стримов, видео и постов сообщества.",
        loading: "Загрузка активности...",
        search_placeholder: "Поиск по названию...",
        sort: "Сортировка",
        filter_year: "Все годы",
        filter_month: "Все месяцы",
        newest: "Сначала новые",
        oldest: "Сначала старые",
        watch_video: "Смотреть видео",
        view_post: "Открыть пост",
        no_data: "Активность не найдена."
      },
      memories: {
        title: "Галерея Творчества",
        desc: "Фан-арт, клипы и креативные работы от сообщества.",
        loading: "Загрузка работ...",
        search_placeholder: "Поиск по названию или автору...",
        view_on: "Смотреть в",
        watch_on: "Смотреть в",
        download: "Скачать",
        no_data: "Работ пока нет."
      },
      songs: {
        title: "Дискография",
        desc: "Коллекция оригинальных песен и каверов.",
        loading: "Загрузка песен...",
        search_placeholder: "Поиск песни...",
        type_all: "Все",
        type_original: "Оригинал",
        type_cover: "Кавер",
        play: "Слушать",
        no_data: "Песни не найдены."
      },
      settings: {
        title: "Настройки",
        tab_lang: "Язык",
        tab_report: "Сообщить о проблеме",
        lang_desc: "Выберите язык интерфейса:",
        report: {
          category_label: "Проблемный раздел",
          cat_home: "Главная",
          cat_profile: "Профиль",
          cat_timeline: "Таймлайн",
          cat_memories: "Раздел Творчества",
          cat_songs: "Песни",
          cat_other: "Другое",
          other_placeholder: "Укажите раздел...",
          desc_label: "Детали проблемы",
          desc_placeholder: "Опишите, что произошло, какая ошибка появилась...",
          upload_label: "Вложение (необязательно)",
          upload_btn: "Загрузить скриншот",
          cancel: "Отмена",
          submit: "Отправить",
          success: "Отчет отправлен! Спасибо за отзыв.",
          contact_help: "Нужна срочная помощь?"
        }
      }
    }
  }
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