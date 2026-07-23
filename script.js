// ============================================================
// إعدادات Supabase
// ============================================================
const supabaseUrl = 'https://togcddwoizdbfqpqslyg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvZ2NkZHdvaXpkYmZxcHFzbHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1ODMxNjIsImV4cCI6MjEwMDE1OTE2Mn0.oXcsEk5ib5ZZRPnmls7HgL4ah49aB3nZOYRLCWA8FHg';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

console.log('✅ script.js loaded - Supabase initialized');

// ============================================================
// 1. CART
// ============================================================
let cart = [];
let currentLang = 'ar';
let currentSort = 'default';
let appliedCoupon = null;
let currentUser = null;
let currentUserData = null;

// ============================================================
// 2. PRODUCTS DATA (جميع المنتجات من الصورة - 50 منتج)
// ============================================================
const defaultProducts = [
    // ===== فاكهة (25 منتج) =====
    { id: 1, name: 'تفاح', nameEn: 'Apple', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍎', price: 25, oldPrice: null, offer: null, description: 'تفاح طازج من مزارعنا', descEn: 'Fresh apples from our farms', popular: 120, stock: 100 },
    { id: 2, name: 'برتقال', nameEn: 'Orange', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍊', price: 20, oldPrice: null, offer: null, description: 'برتقال عصير طازج', descEn: 'Fresh juice oranges', popular: 95, stock: 100 },
    { id: 3, name: 'موز', nameEn: 'Banana', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍌', price: 28, oldPrice: null, offer: null, description: 'موز طازج من المزرعة', descEn: 'Fresh bananas from the farm', popular: 150, stock: 100 },
    { id: 4, name: 'مانجو', nameEn: 'Mango', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🥭', price: 30, oldPrice: 35, offer: 'عرض 5 كجم بسعر 150 ج.م', description: 'مانجو طازج - عرض خاص', descEn: 'Fresh mango - Special offer', popular: 200, stock: 100 },
    { id: 5, name: 'أناناس', nameEn: 'Pineapple', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍍', price: 40, oldPrice: null, offer: null, description: 'أناناس طازج من الفلبين', descEn: 'Fresh pineapple from Philippines', popular: 60, stock: 100 },
    { id: 6, name: 'فراولة', nameEn: 'Strawberry', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍓', price: 35, oldPrice: 45, offer: 'خصم 20%', description: 'فراولة طازجة - عرض خاص', descEn: 'Fresh strawberries - Special offer', popular: 180, stock: 100 },
    { id: 7, name: 'عنب', nameEn: 'Grapes', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍇', price: 38, oldPrice: null, offer: null, description: 'عنب أسود حلو', descEn: 'Sweet black grapes', popular: 110, stock: 100 },
    { id: 8, name: 'رمان', nameEn: 'Pomegranate', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍎', price: 32, oldPrice: null, offer: null, description: 'رمان أحمر شهي', descEn: 'Delicious red pomegranate', popular: 75, stock: 100 },
    { id: 9, name: 'كيوي', nameEn: 'Kiwi', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🥝', price: 45, oldPrice: null, offer: null, description: 'كيوي طازج غني بفيتامين C', descEn: 'Fresh kiwi rich in Vitamin C', popular: 55, stock: 100 },
    { id: 10, name: 'خوخ', nameEn: 'Peach', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍑', price: 30, oldPrice: null, offer: null, description: 'خوخ طازج حلو المذاق', descEn: 'Fresh sweet peaches', popular: 80, stock: 100 },
    { id: 11, name: 'كمثرى', nameEn: 'Pear', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍐', price: 28, oldPrice: null, offer: null, description: 'كمثرى طازجة عصيرية', descEn: 'Fresh juicy pears', popular: 70, stock: 100 },
    { id: 12, name: 'كرز', nameEn: 'Cherry', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍒', price: 50, oldPrice: null, offer: null, description: 'كرز طازج حلو', descEn: 'Fresh sweet cherries', popular: 90, stock: 100 },
    { id: 13, name: 'بطيخ', nameEn: 'Watermelon', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍉', price: 15, oldPrice: null, offer: null, description: 'بطيخ أحمر منعش', descEn: 'Refreshing red watermelon', popular: 200, stock: 100 },
    { id: 14, name: 'شمام', nameEn: 'Cantaloupe', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍈', price: 20, oldPrice: null, offer: null, description: 'شمام طازج حلو', descEn: 'Fresh sweet cantaloupe', popular: 85, stock: 100 },
    { id: 15, name: 'ليمون', nameEn: 'Lemon', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍋', price: 18, oldPrice: null, offer: null, description: 'ليمون طازج حامض', descEn: 'Fresh sour lemons', popular: 110, stock: 100 },
    { id: 16, name: 'جريب فروت', nameEn: 'Grapefruit', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍊', price: 22, oldPrice: null, offer: null, description: 'جريب فروت طازج', descEn: 'Fresh grapefruit', popular: 40, stock: 100 },
    { id: 17, name: 'تمر', nameEn: 'Dates', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🌴', price: 35, oldPrice: null, offer: null, description: 'تمر طازج غني بالطاقة', descEn: 'Fresh energy-rich dates', popular: 130, stock: 100 },
    { id: 18, name: 'تين', nameEn: 'Fig', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍃', price: 40, oldPrice: null, offer: null, description: 'تين طازج حلو', descEn: 'Fresh sweet figs', popular: 60, stock: 100 },
    { id: 19, name: 'رطب', nameEn: 'Fresh Dates', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🌴', price: 30, oldPrice: null, offer: null, description: 'رطب طازج من النخيل', descEn: 'Fresh dates from palm', popular: 100, stock: 100 },
    { id: 20, name: 'أفوكادو', nameEn: 'Avocado', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🥑', price: 55, oldPrice: null, offer: null, description: 'أفوكادو طازج غني بالدهون الصحية', descEn: 'Fresh healthy fat avocado', popular: 150, stock: 100 },
    { id: 21, name: 'جوافة', nameEn: 'Guava', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍐', price: 20, oldPrice: null, offer: null, description: 'جوافة طازجة غنية بفيتامين C', descEn: 'Fresh Vitamin C rich guava', popular: 90, stock: 100 },
    { id: 22, name: 'فاكهة التنين', nameEn: 'Dragon Fruit', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🐉', price: 60, oldPrice: null, offer: null, description: 'فاكهة التنين الطازجة', descEn: 'Fresh dragon fruit', popular: 120, stock: 100 },
    { id: 23, name: 'ليتشي', nameEn: 'Lychee', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍓', price: 45, oldPrice: null, offer: null, description: 'ليتشي طازج حلو', descEn: 'Fresh sweet lychee', popular: 80, stock: 100 },
    { id: 24, name: 'كاكا', nameEn: 'Persimmon', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍊', price: 35, oldPrice: null, offer: null, description: 'كاكا طازجة حلوة', descEn: 'Fresh sweet persimmon', popular: 50, stock: 100 },
    { id: 25, name: 'يوسفي', nameEn: 'Tangerine', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍊', price: 18, oldPrice: null, offer: null, description: 'يوسفي طازج حلو', descEn: 'Fresh sweet tangerine', popular: 130, stock: 100 },
    
    // ===== خضار (25 منتج) =====
    { id: 26, name: 'طماطم', nameEn: 'Tomato', category: 'خضار', categoryEn: 'Vegetables', emoji: '🍅', price: 15, oldPrice: 20, offer: 'خصم 25%', description: 'طماطم طازجة - عرض خاص', descEn: 'Fresh tomatoes - Special offer', popular: 190, stock: 100 },
    { id: 27, name: 'خيار', nameEn: 'Cucumber', category: 'خضار', categoryEn: 'Vegetables', emoji: '🥒', price: 15, oldPrice: null, offer: null, description: 'خيار طازج مقرمش', descEn: 'Fresh crunchy cucumber', popular: 140, stock: 100 },
    { id: 28, name: 'فلفل', nameEn: 'Pepper', category: 'خضار', categoryEn: 'Vegetables', emoji: '🫑', price: 30, oldPrice: null, offer: null, description: 'فلفل ألوان طازج', descEn: 'Fresh colorful peppers', popular: 90, stock: 100 },
    { id: 29, name: 'خس', nameEn: 'Lettuce', category: 'خضار', categoryEn: 'Vegetables', emoji: '🥬', price: 10, oldPrice: 12, offer: 'عرض 5 كجم بسعر 50 ج.م', description: 'خس طازج - عرض خاص', descEn: 'Fresh lettuce - Special offer', popular: 130, stock: 100 },
    { id: 30, name: 'سبانخ', nameEn: 'Spinach', category: 'خضار', categoryEn: 'Vegetables', emoji: '🌿', price: 14, oldPrice: null, offer: null, description: 'سبانخ غني بالحديد', descEn: 'Iron-rich spinach', popular: 85, stock: 100 },
    { id: 31, name: 'جزر', nameEn: 'Carrot', category: 'خضار', categoryEn: 'Vegetables', emoji: '🥕', price: 18, oldPrice: null, offer: null, description: 'جزر طازج غني بفيتامين أ', descEn: 'Fresh vitamin A rich carrots', popular: 160, stock: 100 },
    { id: 32, name: 'بطاطس', nameEn: 'Potato', category: 'خضار', categoryEn: 'Vegetables', emoji: '🥔', price: 16, oldPrice: 22, offer: '5 كجم بسعر 80 ج.م', description: 'بطاطس طازجة - 5 كجم بسعر خاص', descEn: 'Fresh potatoes - 5kg special price', popular: 220, stock: 100 },
    { id: 33, name: 'بنجر', nameEn: 'Beetroot', category: 'خضار', categoryEn: 'Vegetables', emoji: '🍠', price: 20, oldPrice: null, offer: null, description: 'بنجر أحمر غني بالحديد', descEn: 'Iron-rich red beetroot', popular: 65, stock: 100 },
    { id: 34, name: 'كوسة', nameEn: 'Zucchini', category: 'خضار', categoryEn: 'Vegetables', emoji: '🥒', price: 18, oldPrice: null, offer: null, description: 'كوسة طازجة', descEn: 'Fresh zucchini', popular: 100, stock: 100 },
    { id: 35, name: 'باذنجان', nameEn: 'Eggplant', category: 'خضار', categoryEn: 'Vegetables', emoji: '🍆', price: 20, oldPrice: null, offer: null, description: 'باذنجان طازج', descEn: 'Fresh eggplant', popular: 80, stock: 100 },
    { id: 36, name: 'ثوم', nameEn: 'Garlic', category: 'خضار', categoryEn: 'Vegetables', emoji: '🧄', price: 25, oldPrice: null, offer: null, description: 'ثوم طازج', descEn: 'Fresh garlic', popular: 120, stock: 100 },
    { id: 37, name: 'بصل', nameEn: 'Onion', category: 'خضار', categoryEn: 'Vegetables', emoji: '🧅', price: 12, oldPrice: null, offer: null, description: 'بصل طازج', descEn: 'Fresh onion', popular: 150, stock: 100 },
    { id: 38, name: 'فجل', nameEn: 'Radish', category: 'خضار', categoryEn: 'Vegetables', emoji: '🌰', price: 10, oldPrice: null, offer: null, description: 'فجل طازج مقرمش', descEn: 'Fresh crunchy radish', popular: 60, stock: 100 },
    { id: 39, name: 'كرفس', nameEn: 'Celery', category: 'خضار', categoryEn: 'Vegetables', emoji: '🌿', price: 15, oldPrice: null, offer: null, description: 'كرفس طازج', descEn: 'Fresh celery', popular: 70, stock: 100 },
    { id: 40, name: 'بروكلي', nameEn: 'Broccoli', category: 'خضار', categoryEn: 'Vegetables', emoji: '🥦', price: 25, oldPrice: null, offer: null, description: 'بروكلي طازج غني بفيتامين C', descEn: 'Fresh Vitamin C rich broccoli', popular: 110, stock: 100 },
    { id: 41, name: 'قرنبيط', nameEn: 'Cauliflower', category: 'خضار', categoryEn: 'Vegetables', emoji: '🥦', price: 22, oldPrice: null, offer: null, description: 'قرنبيط طازج', descEn: 'Fresh cauliflower', popular: 90, stock: 100 },
    { id: 42, name: 'فطر', nameEn: 'Mushroom', category: 'خضار', categoryEn: 'Vegetables', emoji: '🍄', price: 35, oldPrice: null, offer: null, description: 'فطر طازج', descEn: 'Fresh mushroom', popular: 130, stock: 100 },
    { id: 43, name: 'ذرة', nameEn: 'Corn', category: 'خضار', categoryEn: 'Vegetables', emoji: '🌽', price: 12, oldPrice: null, offer: null, description: 'ذرة طازجة حلوة', descEn: 'Fresh sweet corn', popular: 140, stock: 100 },
    { id: 44, name: 'فاصوليا', nameEn: 'Green Beans', category: 'خضار', categoryEn: 'Vegetables', emoji: '🌱', price: 20, oldPrice: null, offer: null, description: 'فاصوليا طازجة', descEn: 'Fresh green beans', popular: 100, stock: 100 },
    { id: 45, name: 'بازلاء', nameEn: 'Peas', category: 'خضار', categoryEn: 'Vegetables', emoji: '🫛', price: 18, oldPrice: null, offer: null, description: 'بازلاء طازجة', descEn: 'Fresh peas', popular: 85, stock: 100 },
    { id: 46, name: 'قرع', nameEn: 'Pumpkin', category: 'خضار', categoryEn: 'Vegetables', emoji: '🎃', price: 15, oldPrice: null, offer: null, description: 'قرع طازج', descEn: 'Fresh pumpkin', popular: 75, stock: 100 },
    { id: 47, name: 'بطاطا حلوة', nameEn: 'Sweet Potato', category: 'خضار', categoryEn: 'Vegetables', emoji: '🍠', price: 20, oldPrice: null, offer: null, description: 'بطاطا حلوة طازجة', descEn: 'Fresh sweet potato', popular: 120, stock: 100 },
    { id: 48, name: 'زنجبيل', nameEn: 'Ginger', category: 'خضار', categoryEn: 'Vegetables', emoji: '🌱', price: 30, oldPrice: null, offer: null, description: 'زنجبيل طازج', descEn: 'Fresh ginger', popular: 95, stock: 100 },
    { id: 49, name: 'كراث', nameEn: 'Leek', category: 'خضار', categoryEn: 'Vegetables', emoji: '🌿', price: 18, oldPrice: null, offer: null, description: 'كراث طازج', descEn: 'Fresh leek', popular: 60, stock: 100 },
    { id: 50, name: 'جرجير', nameEn: 'Arugula', category: 'خضار', categoryEn: 'Vegetables', emoji: '🌿', price: 22, oldPrice: null, offer: null, description: 'جرجير طازج', descEn: 'Fresh arugula', popular: 80, stock: 100 }
];

// ============================================================
// 3. COUPONS
// ============================================================
const defaultCoupons = [
    { code: 'SAVE10', discount: 10, type: 'percentage', used: 0, maxUses: 100, applicableTo: 'all' },
    { code: 'SAVE20', discount: 20, type: 'percentage', used: 0, maxUses: 50, applicableTo: 'all' },
    { code: 'SAVE50', discount: 50, type: 'fixed', used: 0, maxUses: 20, applicableTo: 'all' },
    { code: 'WELCOME', discount: 15, type: 'percentage', used: 0, maxUses: 200, applicableTo: 'all' }
];

// ============================================================
// 4. TOAST
// ============================================================
function showToast(message, type = 'success', icon = '') {
    const container = document.getElementById('toastContainer');
    if (!container) {
        alert(message);
        return;
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const defaultIcon = icon ? icon : (type === 'success' ? '✅' : '⚠️');
    toast.innerHTML = `
        <span class="toast-icon">${defaultIcon}</span>
        <span class="toast-msg">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 3000);
}

// ============================================================
// 5. PRODUCTS FUNCTIONS
// ============================================================
function getProductName(p) { return currentLang === 'en' ? p.nameEn : p.name; }
function getProductCategory(p) { return currentLang === 'en' ? p.categoryEn : p.category; }
function getProductDesc(p) { return currentLang === 'en' ? p.descEn : p.description; }

function getProductsData() {
    try {
        let stored = localStorage.getItem('alwaha_products');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('⚠️ خطأ في قراءة المنتجات من localStorage، سيتم استخدام القيم الافتراضية');
    }
    localStorage.setItem('alwaha_products', JSON.stringify(defaultProducts));
    return defaultProducts;
}

function getCouponsData() {
    try {
        let stored = localStorage.getItem('alwaha_coupons');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('⚠️ خطأ في قراءة الكوبونات من localStorage، سيتم استخدام القيم الافتراضية');
    }
    localStorage.setItem('alwaha_coupons', JSON.stringify(defaultCoupons));
    return defaultCoupons;
}

// ============================================================
// 6. RENDER PRODUCTS
// ============================================================
function renderProducts(sort = currentSort, search = '') {
    const products = getProductsData();
    const fruitsGrid = document.getElementById('fruitsGrid');
    const vegGrid = document.getElementById('vegetablesGrid');
    const offersGrid = document.getElementById('offersGrid');

    if (!fruitsGrid || !vegGrid || !offersGrid) {
        console.warn('⚠️ Product grids not found');
        return;
    }

    let fruits = products.filter(p => p.category === 'فاكهة');
    let vegetables = products.filter(p => p.category === 'خضار');
    let offers = products.filter(p => p.offer !== null && p.offer !== '' || p.oldPrice !== null);

    if (search.trim()) {
        const s = search.trim().toLowerCase();
        fruits = fruits.filter(p => p.name.toLowerCase().includes(s) || p.nameEn.toLowerCase().includes(s));
        vegetables = vegetables.filter(p => p.name.toLowerCase().includes(s) || p.nameEn.toLowerCase().includes(s));
        offers = offers.filter(p => p.name.toLowerCase().includes(s) || p.nameEn.toLowerCase().includes(s));
    }

    const sortFn = (a, b) => {
        if (sort === 'price-asc') return a.price - b.price;
        if (sort === 'price-desc') return b.price - a.price;
        if (sort === 'popular') return b.popular - a.popular;
        return 0;
    };
    fruits.sort(sortFn);
    vegetables.sort(sortFn);
    offers.sort(sortFn);

    const renderGrid = (grid, items, isOffer = false) => {
        if (items.length === 0) {
            grid.innerHTML =
                `<div style="grid-column:1/-1;text-align:center;padding:10px;color:#5a7a5a;font-size:14px;">${currentLang === 'en' ? 'No products' : 'لا توجد منتجات'}</div>`;
            return;
        }
        grid.innerHTML = '';
        const priceLabel = currentLang === 'en' ? 'EGP/kg' : 'ج.م/كجم';
        const viewLabel = currentLang === 'en' ? 'View' : 'معاينة';
        items.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card' + (isOffer ? ' offer-product' : '');
            let offerHtml = p.offer ? `<span class="offer-badge">${p.offer}</span>` : '';
            let priceHtml = p.oldPrice ?
                `<span class="old-price">${p.oldPrice}</span> ${p.price} <small>${priceLabel}</small>` :
                `${p.price} <small>${priceLabel}</small>`;
            card.innerHTML = `
                ${offerHtml}
                <span class="product-emoji">${p.emoji}</span>
                <h3>${getProductName(p)}</h3>
                <span class="product-cat">${getProductCategory(p)}</span>
                <div class="price">${priceHtml}</div>
                <button class="btn-detail" data-id="${p.id}">${viewLabel}</button>
            `;
            grid.appendChild(card);
            card.querySelector('.btn-detail').addEventListener('click', function() {
                openProductModal(parseInt(this.dataset.id));
            });
        });
    };

    renderGrid(fruitsGrid, fruits);
    renderGrid(vegGrid, vegetables);
    renderGrid(offersGrid, offers, true);
}

// ============================================================
// 7. FILTERS
// ============================================================
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', function() {
        const targetId = this.dataset.target;
        const target = document.getElementById(targetId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        document.querySelectorAll('.category-card').forEach(c => c.style.borderColor = '');
        this.style.borderColor = 'var(--gold)';
    });
});

function filterProducts() {
    renderProducts(currentSort, document.getElementById('searchInput')?.value || '');
}

function applySort() {
    currentSort = document.getElementById('sortFilter')?.value || 'default';
    renderProducts(currentSort, document.getElementById('searchInput')?.value || '');
}

// ============================================================
// 8. SEARCH TOGGLE
// ============================================================
function toggleSearch() {
    const box = document.getElementById('searchToggle');
    if (!box) return;
    box.classList.toggle('active');
    const input = document.getElementById('searchInput');
    if (box.classList.contains('active')) {
        setTimeout(() => input?.focus(), 100);
    }
}

// ============================================================
// 9. PRODUCT MODAL
// ============================================================
let modalProductId = null;
let modalWeight = 1;
let shareProductData = null;

function openProductModal(id) {
    const products = getProductsData();
    const p = products.find(item => item.id === id);
    if (!p) return;
    modalProductId = p.id;
    shareProductData = p;
    const priceLabel = currentLang === 'en' ? 'EGP/kg' : 'ج.م / كجم';
    
    const modalEmoji = document.getElementById('modalEmoji');
    const modalName = document.getElementById('modalName');
    const modalPrice = document.getElementById('modalPrice');
    const modalDesc = document.getElementById('modalDesc');
    const modalOfferTag = document.getElementById('modalOfferTag');
    const modalWeightInput = document.getElementById('modalWeight');
    const modalAddBtn = document.getElementById('modalAddBtn');
    const productModal = document.getElementById('productModal');
    
    if (modalEmoji) modalEmoji.textContent = p.emoji;
    if (modalName) modalName.textContent = getProductName(p);
    
    let priceHtml = p.oldPrice ?
        `<span class="old-price">${p.oldPrice}</span> ${p.price} <small>${priceLabel}</small>` :
        `${p.price} <small>${priceLabel}</small>`;
    if (modalPrice) modalPrice.innerHTML = priceHtml;
    if (modalDesc) modalDesc.textContent = getProductDesc(p);
    
    if (modalOfferTag) {
        if (p.offer) {
            modalOfferTag.style.display = 'inline-block';
            modalOfferTag.textContent = `🏷️ ${p.offer}`;
        } else {
            modalOfferTag.style.display = 'none';
        }
    }
    
    if (modalWeightInput) modalWeightInput.value = 1;
    modalWeight = 1;
    document.getElementById('sharePopup')?.classList.remove('show');
    if (productModal) productModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (modalAddBtn) {
        modalAddBtn.innerHTML = `<i class="fas fa-plus-circle"></i> ${currentLang === 'en' ? 'Add' : 'إضافة'}`;
    }
}

function closeProductModal() {
    const productModal = document.getElementById('productModal');
    if (productModal) productModal.classList.remove('open');
    document.body.style.overflow = '';
    document.getElementById('sharePopup')?.classList.remove('show');
}

function changeModalWeight(delta) {
    const input = document.getElementById('modalWeight');
    if (!input) return;
    let val = parseFloat(input.value) || 1;
    val = Math.max(0.25, Math.round((val + delta) * 100) / 100);
    input.value = val;
    modalWeight = val;
}

// ============================================================
// 10. SHARE PRODUCT
// ============================================================
function toggleSharePopup() {
    document.getElementById('sharePopup')?.classList.toggle('show');
}

function shareProduct(platform) {
    if (!shareProductData) return;
    const p = shareProductData;
    const shopPhone = '01229156909';
    const shopName = currentLang === 'en' ? 'Al-Waha' : 'الواحة';
    const productName = getProductName(p);
    const productDesc = getProductDesc(p);
    const priceLabel = currentLang === 'en' ? 'EGP/kg' : 'ج.م/كجم';
    const siteUrl = window.location.origin + window.location.pathname;
    
    let priceText = `${p.price} ${priceLabel}`;
    if (p.oldPrice) {
        priceText = `${p.oldPrice} → ${p.price} ${priceLabel}`;
    }
    
    let message = `🍎 منتج رائع من متجر ${shopName}!\n\n`;
    message += `📦 المنتج: ${p.emoji} ${productName}\n`;
    message += `💰 السعر: ${priceText}\n`;
    message += `📝 الوصف: ${productDesc}\n\n`;
    if (p.offer) {
        message += `🏷️ عرض: ${p.offer}\n\n`;
    }
    message += `🛒 اطلبه الآن من متجر ${shopName} : ${siteUrl}\n`;
    message += `📱 تواصل للطلبات والاستفسار: ${shopPhone}`;

    let url = '';
    switch (platform) {
        case 'whatsapp':
            url = `https://wa.me/?text=${encodeURIComponent(message)}`;
            break;
        case 'copy':
            navigator.clipboard.writeText(message).then(() => {
                showToast(currentLang === 'en' ? 'Copied!' : 'تم النسخ!', 'success', '📋');
            }).catch(() => {
                const ta = document.createElement('textarea');
                ta.value = message;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                showToast(currentLang === 'en' ? 'Copied!' : 'تم النسخ!', 'success', '📋');
            });
            document.getElementById('sharePopup')?.classList.remove('show');
            return;
    }
    if (url) {
        window.open(url, '_blank');
    }
    document.getElementById('sharePopup')?.classList.remove('show');
}

// ============================================================
// 11. SHARE STORE
// ============================================================
function shareStore() {
    if (!currentUser) {
        showToast('⚠️ يجب تسجيل الدخول أولاً للمشاركة', 'error');
        openAuthModal();
        return;
    }
    
    const shopName = currentLang === 'en' ? 'Al-Waha' : 'الواحة';
    const siteUrl = window.location.origin + window.location.pathname;
    const referralLink = `${siteUrl}?ref=${currentUser.id}`;
    
    let message = `🌿 مرحباً! تعالوا واستمتعوا بأجود الخضروات والفاكهة الطازجة من متجر ${shopName}!\n\n`;
    message += `🛒 تسوق الآن من هنا:\n${referralLink}\n\n`;
    message += `🍎 خضروات وفاكهة طازجة 100%\n`;
    message += `🚚 توصيل سريع لجميع المناطق\n`;
    message += `💰 أسعار مميزة وعروض حصرية\n\n`;
    message += `📱 للتواصل والاستفسار: 01229156909`;
    
    if (navigator.share) {
        navigator.share({
            title: `متجر ${shopName} - خضروات وفاكهة طازجة`,
            text: message,
            url: referralLink
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(referralLink).then(() => {
            showToast('✅ تم نسخ رابط المشاركة! شاركه مع أصدقائك', 'success');
        }).catch(() => {
            showToast(`📋 رابط المشاركة: ${referralLink}`, 'info');
        });
    }
}

// ============================================================
// 12. CART FUNCTIONS
// ============================================================
function loadCart() {
    try {
        const saved = localStorage.getItem('alwaha_cart_v9');
        if (saved) {
            cart = JSON.parse(saved);
            if (!Array.isArray(cart)) cart = [];
        }
    } catch (e) { cart = []; }
}
loadCart();

function saveCart() {
    try {
        localStorage.setItem('alwaha_cart_v9', JSON.stringify(cart));
        if (currentUser) {
            saveCartToSupabase();
        }
    } catch (e) {
        console.warn('⚠️ خطأ في حفظ السلة محلياً:', e);
    }
}

async function saveCartToSupabase() {
    if (!currentUser) return;
    try {
        if (typeof supabaseClient === 'undefined') {
            console.warn('⚠️ Supabase غير متاح');
            return;
        }
        await supabaseClient
            .from('cart')
            .delete()
            .eq('user_id', currentUser.id);
        
        if (cart.length === 0) return;
        
        const cartItems = cart.map(item => ({
            user_id: currentUser.id,
            product_id: item.id,
            weight: item.weight || 1,
            qty: item.qty || 1
        }));
        
        const { error } = await supabaseClient.from('cart').insert(cartItems);
        if (error) throw error;
    } catch (error) {
        console.error('❌ خطأ في حفظ السلة في Supabase:', error);
    }
}

async function syncCartFromSupabase() {
    if (!currentUser) return;
    try {
        if (typeof supabaseClient === 'undefined') {
            console.warn('⚠️ Supabase غير متاح');
            return;
        }
        const { data, error } = await supabaseClient
            .from('cart')
            .select('*')
            .eq('user_id', currentUser.id);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            const products = getProductsData();
            const cloudCart = data.map(item => {
                const p = products.find(pr => pr.id === item.product_id);
                if (!p) return null;
                return {
                    ...p,
                    weight: item.weight || 1,
                    qty: item.qty || 1
                };
            }).filter(Boolean);
            
            if (cloudCart.length > 0) {
                if (cart.length > 0) {
                    const merged = [...cloudCart];
                    cart.forEach(localItem => {
                        const existing = merged.find(c => c.id === localItem.id);
                        if (existing) {
                            existing.qty += localItem.qty;
                            existing.weight = (existing.weight + localItem.weight) / 2;
                        } else {
                            merged.push(localItem);
                        }
                    });
                    cart = merged;
                } else {
                    cart = cloudCart;
                }
                saveCart();
                updateCartUI();
                console.log('✅ تم مزامنة السلة من Supabase');
            }
        }
    } catch (error) {
        console.error('❌ خطأ في مزامنة السلة من Supabase:', error);
    }
}

function addFromModal() {
    const products = getProductsData();
    const p = products.find(item => item.id === modalProductId);
    if (!p) return;

    const weight = parseFloat(document.getElementById('modalWeight')?.value) || 1;
    
    const existingIndex = cart.findIndex(item => item.id === p.id);

    if (existingIndex !== -1) {
        const existingItem = cart[existingIndex];
        const totalWeight = (existingItem.weight * existingItem.qty) + weight;
        existingItem.weight = totalWeight / (existingItem.qty + 1);
        existingItem.qty += 1;
    } else {
        cart.push({
            id: p.id,
            name: p.name,
            nameEn: p.nameEn,
            emoji: p.emoji,
            price: p.price,
            oldPrice: p.oldPrice || null,
            weight: weight,
            qty: 1
        });
    }

    saveCart();
    updateCartUI();

    const productName = currentLang === 'en' ? p.nameEn : p.name;
    const kgLabel = currentLang === 'en' ? 'kg' : 'كجم';
    showToast(`${currentLang === 'en' ? 'Added' : 'تم إضافة'} ${weight.toFixed(2)} ${kgLabel} ${productName}`, 'success', '🛒');

    const btn = document.getElementById('modalAddBtn');
    if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = `<i class="fas fa-check"></i> ${currentLang === 'en' ? 'Added!' : 'تمت الإضافة!'}`;
        btn.style.background = '#27ae60';
        btn.style.color = 'white';
        setTimeout(() => {
            btn.innerHTML = orig;
            btn.style.background = '';
            btn.style.color = '';
        }, 1200);
    }
}

// ============================================================
// 13. CART UI
// ============================================================
function updateCartUI() {
    const list = document.getElementById('cartItemsList');
    const fbadge = document.getElementById('floatingBadge');
    const totalSpan = document.getElementById('cartTotalPrice');
    const headerTotal = document.getElementById('cartHeaderTotal');
    const floatingCheckoutBtn = document.getElementById('floatingCheckout');

    let totalPrice = 0;
    const kgLabel = currentLang === 'en' ? 'kg' : 'كجم';
    const currency = currentLang === 'en' ? 'EGP' : 'ج.م';

    const grouped = {};
    cart.forEach(item => {
        const key = `${item.id}`;
        if (grouped[key]) {
            grouped[key].qty += item.qty;
            grouped[key].weight = (grouped[key].weight * (grouped[key].qty - item.qty) + item.weight * item.qty) / grouped[key].qty;
        } else {
            grouped[key] = { ...item };
        }
    });
    const groupedItems = Object.values(grouped);

    const uniqueItems = groupedItems.length;

    if (!list) return;

    if (groupedItems.length === 0) {
        list.innerHTML =
            `<div class="empty-cart-msg" id="emptyCartMsg"><i class="fas fa-shopping-cart"></i>${currentLang === 'en' ? 'Your cart is empty' : 'سلتك فارغة'}</div>`;
        if (fbadge) fbadge.textContent = '0';
        if (totalSpan) totalSpan.textContent = `0 ${currency}`;
        if (headerTotal) headerTotal.textContent = `0 ${currency}`;
        if (floatingCheckoutBtn) floatingCheckoutBtn.style.display = 'none';
        return;
    }

    let html = '';
    groupedItems.forEach(item => {
        const totalWeight = item.weight * item.qty;
        const itemTotal = item.price * totalWeight;
        totalPrice += itemTotal;
        const productName = currentLang === 'en' ? item.nameEn : item.name;
        let priceDisplay = `${itemTotal.toFixed(2)} ${currency}`;
        if (item.oldPrice) {
            const oldTotal = item.oldPrice * totalWeight;
            priceDisplay =
                `<span style="text-decoration:line-through;color:#999;font-size:13px;">${oldTotal.toFixed(2)}</span> ${itemTotal.toFixed(2)} ${currency}`;
        }
        html += `
            <div class="cart-item">
                <span class="ci-emoji">${item.emoji}</span>
                <div class="ci-info">
                    <div class="ci-name">${productName}</div>
                    <div class="ci-detail">${totalWeight.toFixed(2)} ${kgLabel}</div>
                </div>
                <div style="text-align:left;">
                    <div class="ci-price">${priceDisplay}</div>
                </div>
                <div class="ci-actions">
                    <button onclick="changeQty('${item.id}', -1)">−</button>
                    <span style="font-weight:700;min-width:14px;text-align:center;">${item.qty}</span>
                    <button onclick="changeQty('${item.id}', 1)">+</button>
                    <button class="remove-btn" onclick="removeItem('${item.id}')"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;
    });

    list.innerHTML = html;
    if (fbadge) fbadge.textContent = uniqueItems;
    if (totalSpan) totalSpan.textContent = totalPrice.toFixed(2) + ' ' + currency;
    if (headerTotal) headerTotal.textContent = totalPrice.toFixed(2) + ' ' + currency;

    if (floatingCheckoutBtn) floatingCheckoutBtn.style.display = 'flex';
}

function changeQty(key, delta) {
    const idx = cart.findIndex(i => i.id === parseInt(key));
    if (idx === -1) return;

    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) {
        const name = currentLang === 'en' ? cart[idx].nameEn : cart[idx].name;
        cart.splice(idx, 1);
        showToast(`${currentLang === 'en' ? 'Removed' : 'تم حذف'} ${name}`, 'error', '🗑️');
    } else {
        const name = currentLang === 'en' ? cart[idx].nameEn : cart[idx].name;
        const totalWeight = cart[idx].weight * cart[idx].qty;
        const kgLabel = currentLang === 'en' ? 'kg' : 'كجم';
        showToast(`${name}: ${totalWeight.toFixed(2)} ${kgLabel}`, 'success', '📦');
    }
    saveCart();
    updateCartUI();
}

function removeItem(key) {
    const idx = cart.findIndex(i => i.id === parseInt(key));
    if (idx === -1) return;
    const name = currentLang === 'en' ? cart[idx].nameEn : cart[idx].name;
    cart.splice(idx, 1);
    saveCart();
    updateCartUI();
    showToast(`${currentLang === 'en' ? 'Removed' : 'تم حذف'} ${name}`, 'error', '🗑️');
}

// ============================================================
// 14. TOGGLE CART
// ============================================================
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (!sidebar || !overlay) return;
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
}

// ============================================================
// 15. CHECKOUT
// ============================================================
function openCheckout() {
    if (cart.length === 0) {
        showToast(`${currentLang === 'en' ? 'Cart is empty!' : 'سلتك فارغة!'}`, 'error', '⚠️');
        return;
    }

    const grouped = {};
    cart.forEach(item => {
        const key = `${item.id}`;
        if (grouped[key]) {
            grouped[key].qty += item.qty;
            grouped[key].weight = (grouped[key].weight * (grouped[key].qty - item.qty) + item.weight * item.qty) / grouped[key].qty;
        } else {
            grouped[key] = { ...item };
        }
    });
    const groupedItems = Object.values(grouped);

    let summaryHtml = '';
    let total = 0;
    const currency = currentLang === 'en' ? 'EGP' : 'ج.م';
    const kgLabel = currentLang === 'en' ? 'kg' : 'كجم';
    groupedItems.forEach(item => {
        const totalWeight = item.weight * item.qty;
        const itemTotal = item.price * totalWeight;
        total += itemTotal;
        const productName = currentLang === 'en' ? item.nameEn : item.name;
        let priceDisplay = `${itemTotal.toFixed(2)} ${currency}`;
        if (item.oldPrice) {
            const oldTotal = item.oldPrice * totalWeight;
            priceDisplay =
                `<span style="text-decoration:line-through;color:#999;">${oldTotal.toFixed(2)}</span> ${itemTotal.toFixed(2)} ${currency}`;
        }
        summaryHtml +=
            `<div class="cs-item"><span>${item.emoji} ${productName} (${totalWeight.toFixed(2)} ${kgLabel})</span><span>${priceDisplay}</span></div>`;
    });
    
    const discountedTotal = getDiscountedTotal(total);
    if (appliedCoupon) {
        summaryHtml +=
            `<div class="cs-item" style="color:#27ae60;border-top:1px dashed #27ae60;padding-top:4px;margin-top:4px;">
                <span>💰 خصم ${appliedCoupon.type === 'percentage' ? appliedCoupon.discount + '%' : appliedCoupon.discount + ' ج.م'}</span>
                <span>- ${(total - discountedTotal).toFixed(2)} ${currency}</span>
            </div>`;
    }
    summaryHtml +=
        `<div class="cs-total"><span>${currentLang === 'en' ? 'Total' : 'الإجمالي'}</span><span>${discountedTotal.toFixed(2)} ${currency}</span></div>`;
    summaryHtml +=
        `<div class="cs-total-note">${currentLang === 'en' ? '* Total without delivery fee' : '* الإجمالي بدون قيمة التوصيل'}</div>`;
    const summaryEl = document.getElementById('checkoutSummary');
    if (summaryEl) summaryEl.innerHTML = summaryHtml;

    const savedPhone = localStorage.getItem('alwaha_phone');
    if (savedPhone) {
        const phoneInput = document.getElementById('custPhone');
        if (phoneInput) phoneInput.value = savedPhone;
    }
    const savedName = localStorage.getItem('alwaha_name');
    if (savedName) {
        const nameInput = document.getElementById('custName');
        if (nameInput) nameInput.value = savedName;
    }
    const savedAddress = localStorage.getItem('alwaha_address');
    if (savedAddress) {
        const addressInput = document.getElementById('custAddress');
        if (addressInput) addressInput.value = savedAddress;
    }

    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.classList.add('open');
    }
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) cartSidebar.classList.remove('open');
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartOverlay) cartOverlay.classList.remove('active');
    document.body.style.overflow = 'hidden';
    validateCheckoutForm();
    setMinDeliveryTime();
}

function closeCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) checkoutModal.classList.remove('open');
    document.body.style.overflow = '';
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) cartSidebar.classList.add('open');
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartOverlay) cartOverlay.classList.add('active');
}

function setMinDeliveryTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    const isoString = now.toISOString().slice(0, 16);
    const deliveryTime = document.getElementById('deliveryTime');
    if (deliveryTime) {
        deliveryTime.min = isoString;
        // إذا كان الوقت المحدد مفعل، اضبط القيمة
        const deliveryRadio = document.querySelector('input[name="delivery"]:checked');
        if (deliveryRadio && deliveryRadio.value === 'وقت محدد') {
            deliveryTime.value = isoString;
        }
    }
}

function validateCheckoutForm() {
    const nameInput = document.getElementById('custName');
    const phoneInput = document.getElementById('custPhone');
    const addressInput = document.getElementById('custAddress');
    const confirmBtn = document.getElementById('btnConfirmOrder');
    
    const nameVal = nameInput ? nameInput.value.trim() : '';
    const phoneVal = phoneInput ? phoneInput.value.trim() : '';
    const addressVal = addressInput ? addressInput.value.trim() : '';

    const deliveryRadio = document.querySelector('input[name="delivery"]:checked');
    const deliveryType = deliveryRadio ? deliveryRadio.value : 'اسرع وقت';
    const deliveryTimeInput = document.getElementById('deliveryTime');
    let isDeliveryTimeValid = true;
    if (deliveryType === 'وقت محدد') {
        isDeliveryTimeValid = deliveryTimeInput && deliveryTimeInput.value !== '';
    }

    const paymentRadio = document.querySelector('input[name="payment"]:checked');
    const isPaymentSelected = paymentRadio !== null;

    if (confirmBtn) {
        if (nameVal.length >= 3 && phoneVal.length >= 7 && addressVal.length >= 10 && isDeliveryTimeValid && isPaymentSelected) {
            confirmBtn.removeAttribute('disabled');
        } else {
            confirmBtn.setAttribute('disabled', 'true');
        }
    }
}

// ============================================================
// 16. COUPONS
// ============================================================
function getCouponsList() {
    try {
        let stored = localStorage.getItem('alwaha_coupons');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('⚠️ خطأ في قراءة الكوبونات');
    }
    localStorage.setItem('alwaha_coupons', JSON.stringify(defaultCoupons));
    return defaultCoupons;
}

function applyCoupon() {
    const input = document.getElementById('couponCode');
    const msg = document.getElementById('couponMessage');
    if (!input || !msg) return;
    
    const code = input.value.trim().toUpperCase();
    const couponsList = getCouponsList();

    if (!code) {
        msg.textContent = '⚠️ الرجاء إدخال كود الخصم';
        msg.style.color = '#e74c3c';
        return;
    }

    const found = couponsList.find(c => c.code === code);
    if (found) {
        appliedCoupon = found;
        msg.textContent = `✅ تم تطبيق كود "${code}" بنجاح! خصم ${found.discount}${found.type === 'percentage' ? '%' : ' ج.م'}`;
        msg.style.color = '#27ae60';
        input.style.borderColor = '#27ae60';
        updateCheckoutTotal();
    } else {
        appliedCoupon = null;
        msg.textContent = '❌ كود غير صحيح أو منتهي الصلاحية';
        msg.style.color = '#e74c3c';
        input.style.borderColor = '#e74c3c';
        updateCheckoutTotal();
    }
}

function getDiscountedTotal(total) {
    if (!appliedCoupon) return total;
    if (appliedCoupon.type === 'percentage') {
        return total - (total * appliedCoupon.discount / 100);
    } else {
        return Math.max(0, total - appliedCoupon.discount);
    }
}

function updateCheckoutTotal() {
    let total = 0;
    const grouped = {};
    cart.forEach(item => {
        const key = `${item.id}`;
        if (grouped[key]) {
            grouped[key].qty += item.qty;
        } else {
            grouped[key] = { ...item };
        }
    });
    const groupedItems = Object.values(grouped);
    groupedItems.forEach(item => {
        total += item.price * item.weight * item.qty;
    });
    const discountedTotal = getDiscountedTotal(total);
    const currency = currentLang === 'en' ? 'EGP' : 'ج.م';
    const totalSpan = document.querySelector('.cs-total span:last-child');
    if (totalSpan) {
        totalSpan.textContent = discountedTotal.toFixed(2) + ' ' + currency;
    }
}

// ============================================================
// 17. CONFIRM ORDER
// ============================================================
function buildWhatsAppMessage(order) {
    const shopName = currentLang === 'en' ? 'Al-Waha' : 'الواحة';
    const currency = currentLang === 'en' ? 'EGP' : 'ج.م';
    const kgLabel = currentLang === 'en' ? 'kg' : 'كجم';
    const siteUrl = window.location.origin + window.location.pathname;
    
    let msg = `🌿 *طلب جديد من متجر ${shopName}* 🛒\n`;
    msg += `───────────────────\n`;
    msg += `🛍 *المنتجات المطلوبة:*\n`;
    order.items.forEach(item => {
        msg += `• ${item.emoji} *${item.name}*: ${item.weight.toFixed(2)} ${kgLabel} - ${item.total.toFixed(2)} ${currency}\n`;
    });
    msg += `───────────────────\n`;
    msg += `💰 *الإجمالي:* ${order.total.toFixed(2)} ${currency}\n`;
    if (order.coupon) {
        msg += `💸 *الخصم:* -${(order.total - order.discountedTotal).toFixed(2)} ${currency}\n`;
        msg += `🛒 *الإجمالي بعد الخصم:* ${order.discountedTotal.toFixed(2)} ${currency}\n`;
    }
    msg += `───────────────────\n`;
    msg += `👤 *معلومات العميل:*\n`;
    msg += `• *الاسم:* ${order.customer}\n`;
    msg += `• *الجوال:* +${order.phone}\n`;
    msg += `📍 *العنوان:* ${order.address}\n`;
    if (order.notes) msg += `📝 *ملاحظات:* ${order.notes}\n`;
    msg += `───────────────────\n`;
    msg += `⏱️ *وقت التوصيل:* ${order.delivery}\n`;
    if (order.deliveryTime) {
        const formattedTime = new Date(order.deliveryTime).toLocaleString(currentLang === 'en' ? 'en-US' : 'ar-EG');
        msg += `📅 *الميعاد:* ${formattedTime}\n`;
    }
    msg += `💳 *طريقة الدفع:* ${order.payment}\n`;
    if (order.payment.includes('إنستا') || order.payment.includes('Insta') || order.payment.includes('محفظة') || order.payment.includes('Wallet')) {
        msg += `\n⚠️ *ملاحظة هامة للدفع الإلكتروني:*\n`;
        msg += `يرجى إرسال مبلغ الطلب إلى الرقم التالي:\n`;
        msg += `📞 *01005777923*\n`;
        msg += `مع ضرورة إرسال لقطة شاشة (Screenshot) للتحويل هنا لتأكيد الطلب وبدء الشحن.\n`;
    }
    msg += `───────────────────\n`;
    msg += `🌐 *رابط المتجر:* ${siteUrl}\n`;
    msg += `🌸 *نشكرك على اختيارك متجر الواحة - طازج وصحي دائماً!*`;
    
    return msg;
}

async function confirmOrder() {
    if (cart.length === 0) {
        showToast('سلتك فارغة!', 'error');
        return;
    }

    const name = document.getElementById('custName')?.value?.trim() || 'عميل';
    const countryCode = document.getElementById('countryCode')?.value || '20';
    let phoneInput = document.getElementById('custPhone')?.value?.trim() || '';
    const address = document.getElementById('custAddress')?.value?.trim() || 'لم يحدد';
    const notes = document.getElementById('custNotes')?.value?.trim() || '';
    const paymentRadio = document.querySelector('input[name="payment"]:checked');
    const payment = paymentRadio ? paymentRadio.value : 'كاش عند التوصيل';
    const deliveryRadio = document.querySelector('input[name="delivery"]:checked');
    const delivery = deliveryRadio ? deliveryRadio.value : 'اسرع وقت';
    const deliveryTime = document.getElementById('deliveryTime')?.value || '';

    if (!phoneInput) {
        showToast('أدخل رقم الجوال', 'error');
        document.getElementById('custPhone')?.focus();
        return;
    }

    let cleanPhone = phoneInput.replace(/[\s\-\(\)]/g, '');
    let fullPhone = cleanPhone.startsWith('0') ? countryCode + cleanPhone.substring(1) : countryCode + cleanPhone;

    let total = 0;
    const grouped = {};
    cart.forEach(item => {
        const key = `${item.id}`;
        if (grouped[key]) {
            grouped[key].qty += item.qty;
        } else {
            grouped[key] = { ...item };
        }
    });
    const groupedItems = Object.values(grouped);
    groupedItems.forEach(item => {
        total += item.price * item.weight * item.qty;
    });
    const discountedTotal = getDiscountedTotal(total);

    const orderData = {
        customer: name,
        phone: fullPhone,
        address: address,
        items: groupedItems.map(item => ({
            name: item.name,
            nameEn: item.nameEn,
            emoji: item.emoji,
            weight: item.weight * item.qty,
            price: item.price,
            oldPrice: item.oldPrice,
            total: item.price * item.weight * item.qty
        })),
        total: total,
        discountedTotal: discountedTotal,
        coupon: appliedCoupon?.code || null,
        payment: payment,
        delivery: delivery,
        deliveryTime: deliveryTime,
        notes: notes,
        status: 'جديد',
        date: new Date().toISOString(),
        dateAr: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    try {
        if (typeof supabaseClient !== 'undefined' && currentUser) {
            const { error } = await supabaseClient
                .from('orders')
                .insert([{
                    user_id: currentUser.id,
                    customer: orderData.customer,
                    phone: orderData.phone,
                    address: orderData.address,
                    items: orderData.items,
                    total: orderData.total,
                    discounted_total: orderData.discountedTotal,
                    coupon_code: orderData.coupon,
                    payment_method: orderData.payment,
                    delivery_type: orderData.delivery,
                    delivery_time: orderData.deliveryTime || null,
                    notes: orderData.notes,
                    status: orderData.status,
                    created_at: orderData.date
                }]);
            if (error) throw error;
        }
        
        let orders = JSON.parse(localStorage.getItem('alwaha_orders') || '[]');
        orders.unshift({ ...orderData, id: 'ORD-' + Date.now().toString().slice(-8) });
        localStorage.setItem('alwaha_orders', JSON.stringify(orders));

        await handleReferral(orderData);

        const shopNumber = '201229156909';
        const msg = buildWhatsAppMessage(orderData);
        const whatsappUrl = `https://wa.me/${shopNumber}?text=${encodeURIComponent(msg)}`;
        
        cart = [];
        appliedCoupon = null;
        const couponInput = document.getElementById('couponCode');
        if (couponInput) couponInput.value = '';
        const couponMsg = document.getElementById('couponMessage');
        if (couponMsg) couponMsg.textContent = '';
        saveCart();
        updateCartUI();
        
        const checkoutModal = document.getElementById('checkoutModal');
        if (checkoutModal) checkoutModal.classList.remove('open');
        document.body.style.overflow = '';
        
        showToast('تم تأكيد طلبك! 🎉', 'success');
        setTimeout(() => { window.open(whatsappUrl, '_blank'); }, 600);
        
    } catch (error) {
        console.error('❌ خطأ في حفظ الطلب:', error);
        showToast('حدث خطأ في حفظ الطلب', 'error');
    }
}

// ============================================================
// 18. REFERRAL SYSTEM
// ============================================================
async function handleReferral(orderData) {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const referrerId = urlParams.get('ref');
        
        if (!referrerId) return;
        if (!currentUser) return;
        if (referrerId === currentUser.id) return;
        
        const orders = JSON.parse(localStorage.getItem('alwaha_orders') || '[]');
        const userOrders = orders.filter(o => o.phone === orderData.phone || o.customer === orderData.customer);
        
        if (userOrders.length > 1) return;
        
        if (typeof supabaseClient !== 'undefined') {
            const { data: referrerData, error: referrerError } = await supabaseClient
                .from('users')
                .select('*')
                .eq('id', referrerId)
                .single();
            
            if (referrerError) throw referrerError;
            
            if (referrerData) {
                const newPoints = (referrerData.referral_points || 0) + 1;
                const newReferrals = (referrerData.referral_count || 0) + 1;
                
                await supabaseClient
                    .from('users')
                    .update({
                        referral_points: newPoints,
                        referral_count: newReferrals
                    })
                    .eq('id', referrerId);
                
                let users = JSON.parse(localStorage.getItem('alwaha_users') || '[]');
                const userIndex = users.findIndex(u => u.id === referrerId);
                if (userIndex !== -1) {
                    users[userIndex].referral_points = newPoints;
                    users[userIndex].referral_count = newReferrals;
                    localStorage.setItem('alwaha_users', JSON.stringify(users));
                }
                
                console.log(`✅ تم إضافة نقطة للمحيل ${referrerId}`);
                showToast('🎉 تم إضافة نقطة إحالة للمستخدم الذي دعاك!', 'success');
            }
        }
    } catch (error) {
        console.error('❌ خطأ في معالجة الإحالة:', error);
    }
}

// ============================================================
// 19. THEME
// ============================================================
let currentTheme = 'light';

function toggleTheme() {
    const html = document.documentElement;
    const checkbox = document.getElementById('themeCheckbox');
    if (currentTheme === 'light') {
        html.setAttribute('data-theme', 'dark');
        currentTheme = 'dark';
        if (checkbox) checkbox.checked = true;
        const bgStatic = document.getElementById('bg-static');
        if (bgStatic) bgStatic.style.opacity = '0.02';
        showToast(`${currentLang === 'en' ? 'Dark mode' : 'الوضع الليلي'}`, 'success', '🌙');
    } else {
        html.removeAttribute('data-theme');
        currentTheme = 'light';
        if (checkbox) checkbox.checked = false;
        const bgStatic = document.getElementById('bg-static');
        if (bgStatic) bgStatic.style.opacity = '0.03';
        showToast(`${currentLang === 'en' ? 'Light mode' : 'الوضع النهاري'}`, 'success', '☀️');
    }
    localStorage.setItem('alwaha_theme', currentTheme);
}

// ============================================================
// 20. LANGUAGE
// ============================================================
function toggleLang() {
    const html = document.documentElement;
    if (currentLang === 'ar') {
        html.setAttribute('lang', 'en');
        currentLang = 'en';
        updateLanguage('en');
        showToast('English', 'success', '🌍');
    } else {
        html.setAttribute('lang', 'ar');
        currentLang = 'ar';
        updateLanguage('ar');
        showToast('العربية', 'success', '🌍');
    }
    localStorage.setItem('alwaha_lang', currentLang);
    renderProducts(currentSort, document.getElementById('searchInput')?.value || '');
    updateCartUI();
    updateUIForLoggedInUser();
    if (modalProductId) {
        const products = getProductsData();
        const p = products.find(item => item.id === modalProductId);
        if (p) {
            const priceLabel = currentLang === 'en' ? 'EGP/kg' : 'ج.م / كجم';
            const modalName = document.getElementById('modalName');
            if (modalName) modalName.textContent = getProductName(p);
            const modalPrice = document.getElementById('modalPrice');
            if (modalPrice) {
                let priceHtml = p.oldPrice ?
                    `<span class="old-price">${p.oldPrice}</span> ${p.price} <small>${priceLabel}</small>` :
                    `${p.price} <small>${priceLabel}</small>`;
                modalPrice.innerHTML = priceHtml;
            }
            const modalDesc = document.getElementById('modalDesc');
            if (modalDesc) modalDesc.textContent = getProductDesc(p);
            const modalAddBtn = document.getElementById('modalAddBtn');
            if (modalAddBtn) {
                modalAddBtn.innerHTML = `<i class="fas fa-plus-circle"></i> ${currentLang === 'en' ? 'Add' : 'إضافة'}`;
            }
        }
    }
}

function updateLanguage(lang) {
    const isEn = lang === 'en';
    const logoText = document.querySelector('.header .logo .logo-text');
    if (logoText) logoText.innerHTML = isEn ? 'Al-Waha 🌱' : 'الواحة 🌱';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = isEn ? 'Search...' : 'ابحث...';
    const heroTitle = document.querySelector('.hero .hero-title');
    if (heroTitle) heroTitle.innerHTML = isEn ? 'Al-Waha Store' : 'متجر الواحة';
    const heroSubtitle = document.querySelector('.hero .hero-subtitle');
    if (heroSubtitle) heroSubtitle.innerHTML = isEn ? 'Fresh fruits & vegetables from nature' : 'خضروات وفاكهة طازجة من قلب الطبيعة';
    const floatingCheckoutText = document.getElementById('floatingCheckoutText');
    if (floatingCheckoutText) floatingCheckoutText.textContent = isEn ? 'Checkout' : 'شراء';

    const categoriesTitle = document.getElementById('categoriesTitle');
    if (categoriesTitle) categoriesTitle.innerHTML = `<i class="fas fa-th-large"></i> ${isEn ? 'Categories' : 'الأقسام'}`;
    const catFruitTitle = document.getElementById('catFruitTitle');
    if (catFruitTitle) catFruitTitle.textContent = isEn ? 'Fruits' : 'فاكهة';
    const catVegTitle = document.getElementById('catVegTitle');
    if (catVegTitle) catVegTitle.textContent = isEn ? 'Vegetables' : 'خضروات';
    const catOffersTitle = document.getElementById('catOffersTitle');
    if (catOffersTitle) catOffersTitle.textContent = isEn ? 'Offers' : 'عروض';

    const productsTitle = document.getElementById('productsTitle');
    if (productsTitle) productsTitle.innerHTML = `<i class="fas fa-box"></i> ${isEn ? 'Our Products' : 'منتجاتنا'}`;
    const fruitsSubTitle = document.getElementById('fruitsSubTitle');
    if (fruitsSubTitle) fruitsSubTitle.innerHTML = `<i class="fas fa-apple-alt"></i> ${isEn ? 'Fruits' : 'الفاكهة'}`;
    const vegSubTitle = document.getElementById('vegSubTitle');
    if (vegSubTitle) vegSubTitle.innerHTML = `<i class="fas fa-carrot"></i> ${isEn ? 'Vegetables' : 'الخضروات'}`;
    const offersSubTitle = document.getElementById('offersSubTitle');
    if (offersSubTitle) offersSubTitle.innerHTML = `<i class="fas fa-tag"></i> ${isEn ? 'Offers & Discounts' : 'العروض والخصومات'}`;

    const sortLabel = document.getElementById('sortLabel');
    if (sortLabel) sortLabel.textContent = isEn ? 
