// ============================================================
// SUPABASE CONFIGURATION
// ============================================================

const SUPABASE_CONFIG = {
    url: 'https://togcddwoizdbfqpqslyg.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvZ2NkZHdvaXpkYmZxcHFzbHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1ODMxNjIsImV4cCI6MjEwMDE1OTE2Mn0.oXcsEk5ib5ZZRPnmls7HgL4ah49aB3nZOYRLCWA8FHg',
    tables: {
        users: 'users',
        products: 'products',
        orders: 'orders',
        cart: 'cart',
        coupons: 'coupons',
        notifications: 'notifications'
    }
};

// ============================================================
// SUPABASE CLIENT
// ============================================================

let supabaseClient = null;

try {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.key
        );
        console.log('✅ Supabase client initialized');
    } else {
        console.warn('⚠️ Supabase SDK not loaded');
    }
} catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function isSupabaseAvailable() {
    return supabaseClient !== null && typeof supabaseClient !== 'undefined';
}

function getSupabase() {
    return supabaseClient;
}

// ============================================================
// EXPORT
// ============================================================

window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.supabaseClient = supabaseClient;
window.isSupabaseAvailable = isSupabaseAvailable;
window.getSupabase = getSupabase;

console.log('✅ Supabase config loaded'); 
