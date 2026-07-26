// ============================================================
// SUPABASE CONFIGURATION
// ============================================================

// 🔑 أدخل بيانات Supabase الخاصة بك هنا
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

// إنشاء عميل Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// تصدير العميل للاستخدام في جميع الملفات
window.supabaseClient = supabaseClient;

console.log('✅ Supabase client initialized');
