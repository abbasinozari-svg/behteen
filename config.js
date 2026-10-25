// ==========================================
// تنظیمات اتصال به پروژه Supabase
// ==========================================
const SUPABASE_URL = 'https://czloewhijgyftcwiukkv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6bG9ld2hpamd5ZnRjd2l1a2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MTMwMDYsImV4cCI6MjEwNzk4OTAwNn0.WCRp_PQRf9AaoH6FfcRs3DuxsCMHiwLJassnsEdFNi4';

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// دسته‌بندی‌های اصلی کاتالوگ
const categoriesMeta = [
  { id: 'figs', title: 'انجیر خشک استهبان', icon: '🌰' },
  { id: 'derivatives', title: 'فرآورده‌های انجیر', icon: '🍬' },
  { id: 'syrups', title: 'شیره‌های طبیعی', icon: '🍯' },
  { id: 'nuts', title: 'آجیل و خشکبار', icon: '🥜' }
];

// داده‌های جدول مقایسه‌گر تخصصی انجیر
const figDetails = [
  { id: 'fig-open', name: 'انجیر دهان‌باز', grade: 'مجلسی صادراتی (خندان)', openPct: 98, sweetPct: 92, note: 'بهترین انتخاب برای هدیه، عید نوروز و پذیرایی شیک' },
  { id: 'fig-large-light', name: 'درشت و رنگ روشن', grade: 'درجه ۱ ممتاز آفتابی', openPct: 60, sweetPct: 90, note: 'بسیار گوشتی، درشت و خوش‌رنگ بدون گوگرد' },
  { id: 'fig-mixed-choco', name: 'درهم و شکلاتی', grade: 'کاراملی و به‌صرفه', openPct: 45, sweetPct: 95, note: 'پرشهد، نرم و عالی برای مصرف روزانه خانواده' },
  { id: 'fig-dark-lacquer', name: 'تیره و لاکی', grade: 'سنتی و خون‌ساز', openPct: 25, sweetPct: 96, note: 'تراکم بالای املاح و شیره غلیظ درونی' },
  { id: 'fig-bird-pecked', name: 'گنجشک‌خورده', grade: 'شیرین‌ترین شهد باغ', openPct: 85, sweetPct: 100, note: 'دست‌چین طبیعی پرندگان باغ به دلیل حداکثر شیرینی' }
];

// داده‌های پیش‌فرض (برای نمایش فوری بدون نیاز به فیلترشکن حتی در صورت اختلال اینترنت)
const FALLBACK_DATA = {
  settings: {
    brand_name: "به‌تین",
    brand_tag: "BEH TEEN",
    brand_title: "آجیل و خشکبار به‌تین | محصولی از بهشت استهبان",
    about_text: "ما قصد داریم خشکبار را مستقیم و بدون واسطه از باغدار به دست مصرف‌کننده برسانیم. اگر دنبال انجیر خشک و محصولات باکیفیت بر پایه انجیر هستید ما اینجاییم.",
    phone: "09171305766",
    phone_display: "۰۹۱۷۱۳۰۵۷۶۶",
    eitaa_url: "https://eitaa.com/behteen",
    eitaa_handle: "eitaa.com/behteen",
    bale_url: "https://ble.ir/behteen",
    bale_handle: "ble.ir/behteen",
    logo_url: ""
  },
  products: [
    { id: "fig-open", category: "figs", categoryLabel: "انجیر خشک", title: "انجیر دهان‌باز استهبان", badge: "مجلسی و صادراتی", badgeColor: "bg-amber-100 text-amber-900 border-amber-300", goals: ["luxury"], shortDesc: "انجیر خندان و تمام دهان‌باز با دانه‌های درشت و رنگ روشن، گلچین‌شده از بهترین باغات استهبان برای پذیرایی ویژه.", flavors: ["بسته‌بندی سفارشی", "درجه یک دست‌چین"], imageUrl: "" },
    { id: "fig-large-light", category: "figs", categoryLabel: "انجیر خشک", title: "انجیر درشت و رنگ روشن", badge: "درشت و سفید", badgeColor: "bg-yellow-100 text-yellow-900 border-yellow-300", goals: ["luxury", "daily"], shortDesc: "انجیر خشک درشت با رنگ زرد و روشن طبیعی، بسیار خوش‌ظاهر، گوشتی و سرشار از کلسیم و فیبر.", flavors: ["سایز درشت", "رنگ روشن طبیعی"], imageUrl: "" },
    { id: "fig-mixed-choco", category: "figs", categoryLabel: "انجیر خشک", title: "انجیر درهم و شکلاتی", badge: "پرطرفدار و به‌صرفه", badgeColor: "bg-orange-100 text-orange-900 border-orange-300", goals: ["daily", "energy"], shortDesc: "انجیر خشک با رنگ عسلی و شکلاتی طبیعی و سایز درهم؛ سرشار از شیره طبیعی انجیر و فوق‌العاده مقوی برای مصرف روزانه خانواده.", flavors: ["بار تازه امسالی"], imageUrl: "" },
    { id: "fig-dark-lacquer", category: "figs", categoryLabel: "انجیر خشک", title: "انجیر تیره و لاکی", badge: "طبیعی و پرشیره", badgeColor: "bg-stone-200 text-stone-800 border-stone-300", goals: ["daily", "energy"], shortDesc: "انجیر خشک با پوست تیره و لاکی‌رنگ که به دلیل غلظت بالای شیره درونی، طعم بسیار لذیذ و خواص خون‌سازی فراوانی دارد.", flavors: ["طبیعی و سنتی"], imageUrl: "" },
    { id: "fig-bird-pecked", category: "figs", categoryLabel: "انجیر خشک", title: "انجیر گنجشک‌خورده", badge: "شیرین‌ترین انجیر باغ!", badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300", goals: ["daily", "diet"], shortDesc: "پرندگان باغ همیشه شیرین‌ترین و رسیده‌ترین انجیرهای روی درخت را نوک می‌زنند! انجیر گنجشک‌خورده استهبان اصیل‌ترین و شیرین‌ترین انتخاب برای مصرف خانگی است.", flavors: ["طبیعی روی درخت خشک‌شده"], imageUrl: "" },
    { id: "fig-masghati", category: "derivatives", categoryLabel: "فرآورده‌های انجیر و شیره", title: "مسقطی انجیر (در ۵ طعم)", badge: "۵ طعم سنتی و جذاب", badgeColor: "bg-rose-100 text-rose-900 border-rose-300", goals: ["luxury", "energy"], shortDesc: "مسقطی نرم و کشسان تهیه‌شده از عصاره و شیره انجیر استهبان در ۵ طعم متنوع برای پذیرایی همراه با چای و دمنوش.", flavors: ["زرشک", "کنجد", "نارگیل", "گل محمدی", "مغز بادام زمینی"], imageUrl: "" },
    { id: "tinjed", category: "derivatives", categoryLabel: "فرآورده‌های انجیر و شیره", title: "تینجد (میکس انجیر و کنجد)", badge: "بمب انرژی در ۵ طعم", badgeColor: "bg-amber-100 text-amber-900 border-amber-300", goals: ["energy", "diet", "daily"], shortDesc: "ترکیب مقوی و سنتی انجیر چرخ‌شده استهبان و کنجد برشته، غنی‌شده با ۵ مغز و طعم فوق‌العاده برای کودکان و ورزشکاران.", flavors: ["نارگیل", "گل محمدی", "بادام درختی", "گردو", "پسته کوهی"], imageUrl: "" },
    { id: "fig-bar", category: "derivatives", categoryLabel: "فرآورده‌های انجیر و شیره", title: "انجیر بار (با روکش پسته)", badge: "روکش پسته", badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300", goals: ["diet", "energy", "luxury"], shortDesc: "اسنک و شکلات انرژی‌زای طبیعی از انجیر فشرده مرغوب با روکش غنی از خلال و مغز پسته سبز؛ جایگزین عالی تنقلات مصنوعی.", flavors: ["روکش پسته ممتاز"], imageUrl: "" },
    { id: "fig-gaz", category: "derivatives", categoryLabel: "فرآورده‌های انجیر و شیره", title: "گز انجیر (بدون شکر مصنوعی)", badge: "بدون شکر مصنوعی", badgeColor: "bg-teal-100 text-teal-900 border-teal-300", goals: ["diet", "luxury"], shortDesc: "گز فوق‌العاده سالم و رژیمی که بدون هیچ‌گونه شکر مصنوعی و با شیره انجیر، چیپس خرما و مغز بادام تهیه شده است.", flavors: ["شیره انجیر", "چیپس خرما", "مغز بادام"], imageUrl: "" },
    { id: "fig-pressed", category: "derivatives", categoryLabel: "فرآورده‌های انجیر و شیره", title: "انجیر پرسی (فرآیند شده)", badge: "خالص و فشرده", badgeColor: "bg-orange-100 text-orange-900 border-orange-300", goals: ["energy", "daily"], shortDesc: "بلوک‌های انجیر خشک فرآیند و پرس‌شده با ماندگاری بالا و حمل آسان، سرشار از کالری سالم برای کوهنوردی و مصرف روزانه.", flavors: ["بسته‌بندی قالبی پرسی"], imageUrl: "" },
    { id: "syrup-five", category: "syrups", categoryLabel: "فرآورده‌های انجیر و شیره", title: "پنج شیره طبیعی", badge: "معجون ۵ میوه", badgeColor: "bg-purple-100 text-purple-900 border-purple-300", goals: ["energy", "daily"], shortDesc: "معجون خون‌ساز و مقوی تهیه‌شده از شیره خالص انگور، انجیر، توت، خرما و سیب.", flavors: ["شیره انگور", "شیره انجیر", "شیره توت", "شیره خرما", "شیره سیب"], imageUrl: "" },
    { id: "syrup-four", category: "syrups", categoryLabel: "فرآورده‌های انجیر و شیره", title: "چهار شیره طبیعی", badge: "گرم و انرژی‌بخش", badgeColor: "bg-amber-100 text-amber-900 border-amber-300", goals: ["energy", "daily"], shortDesc: "تهیه‌شده از شیره انگور، انجیر، خرما و توت با طبع گرم و انرژی‌بخشی فوری برای تمام فصول سال.", flavors: ["شیره انگور", "شیره انجیر", "شیره خرما", "شیره توت"], imageUrl: "" },
    { id: "syrup-fig", category: "syrups", categoryLabel: "فرآورده‌های انجیر و شیره", title: "شیره انجیر طبیعی", badge: "عصاره خالص انجیر", badgeColor: "bg-rose-100 text-rose-900 border-rose-300", goals: ["energy", "diet"], shortDesc: "شیره خالص و غلیظ گرفته‌شده از انجیرهای شیرین استهبان؛ بسیار ملین، مقوی معده و گوارش و جایگزین فوق‌العاده قند و شکر.", flavors: ["۱۰۰٪ عصاره خالص انجیر استهبان"], imageUrl: "" },
    { id: "almond-raw", category: "nuts", categoryLabel: "آجیل و خشکبار", title: "مغز بادام درختی خام", badge: "تازه و شیرین", badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300", goals: ["diet", "luxury", "energy"], shortDesc: "مغز بادام درختی ایرانی خام، درشت و ۱۰۰٪ شیرین؛ سرشار از ویتامین E، پروتئین و کلسیم برای سلامت استخوان و پوست.", flavors: ["خام و بدون نمک"], imageUrl: "" },
    { id: "almond-salted", category: "nuts", categoryLabel: "آجیل و خشکبار", title: "مغز بادام درختی شور", badge: "برشته و ترد", badgeColor: "bg-amber-100 text-amber-900 border-amber-300", goals: ["luxury"], shortDesc: "مغز بادام درختی دست‌چین که به اندازه ملایم نمک‌سود و برشته شده تا طعمی فوق‌العاده ترد و لذیذ برای آجیل مهمانی داشته باشد.", flavors: ["برشته نمکی ملایم"], imageUrl: "" },
    { id: "cashew-raw", category: "nuts", categoryLabel: "آجیل و خشکبار", title: "مغز بادام هندی خام", badge: "درشت و کره‌ای", badgeColor: "bg-stone-100 text-stone-800 border-stone-300", goals: ["diet", "luxury"], shortDesc: "مغز بادام هندی خام با بافت نرم و طعم کره‌ای طبیعی، بدون نمک و افزودنی برای ورزشکاران و تغذیه سالم.", flavors: ["خام درجه یک"], imageUrl: "" },
    { id: "cashew-salted", category: "nuts", categoryLabel: "آجیل و خشکبار", title: "مغز بادام هندی شور", badge: "زعفرانی و مجلسی", badgeColor: "bg-yellow-100 text-yellow-900 border-yellow-400", goals: ["luxury"], shortDesc: "مغز بادام هندی برشته‌شده و شور با رنگ طلایی جذاب، معطر و بسیار خوش‌خوراک برای تزیین آجیل و پذیرایی لوکس.", flavors: ["شور و طلایی"], imageUrl: "" },
    { id: "almond-stone", category: "nuts", categoryLabel: "آجیل و خشکبار", title: "بادام سنگی", badge: "ماندگاری طولانی", badgeColor: "bg-orange-100 text-orange-900 border-orange-300", goals: ["daily"], shortDesc: "بادام با پوست چوبی (سنگی) از باغات کوهستانی که مغز درون آن تا ماه‌ها کاملاً تازه، روغنی و معطر باقی می‌ماند.", flavors: ["با پوست طبیعی"], imageUrl: "" }
  ]
};
