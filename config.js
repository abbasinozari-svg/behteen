// ==========================================
// تنظیمات اتصال به پروژه Supabase
// ==========================================
const SUPABASE_URL = 'https://czloewhijgyftcwiukkv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6bG9ld2hpamd5ZnRjd2l1a2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MTMwMDYsImV4cCI6MjEwNzk4OTAwNn0.WCRp_PQRf9AaoH6FfcRs3DuxsCMHiwLJassnsEdFNi4';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
