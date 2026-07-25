
// ============================================================
// MAIN APPLICATION - التطبيق الرئيسي
// ============================================================

// ============================================================
// GLOBAL VARIABLES
// ============================================================

let currentLang = 'ar';
let currentSort = 'default';
let appliedCoupon = null;

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Al-Waha Store initialized');
    
    // 1. Initialize Auth
    Auth.init();
    
    // 2. Load Products
    Products.render('default', '');
    
    // 3. Load Cart
    Cart.loadLocal();
    Cart.updateUI();
    
    // 4. Start Countdown
    startCountdown();
    
    // 5. Background Static
    initBackgroundStatic();
    
    // 6. Load Settings
    loadSavedSettings();
    
    // 7. Set min delivery time
    Orders.setMinDeliveryTime();
    
    // 8. Setup event listeners
    setupEventListeners();
    
    // 9. Admin access
    setupAdminAccess();
});

// ============================================================
// BACKGROUND STATIC
// ============================================================

function initBackgroundStatic() {
    const bgStatic = document.getElementById('bg-static');
    if (bgStatic) {
        const emojis = ['🍎', '🥑', '🍋', '🥦', '🍊', '🥬', '🍇', '🥕', '🍓', '🌿', 
                        '🍍', '🥒', '🍌', '🥭', '🍅', '🥔', '🍈', '🥝', '🫑', '🍠', 
                        '🧅', '🧄', '🫒', '🌶️', '🍑', '🍒', '🍉', '🍐', '🥥', '🌽'];
        const rotations = [-14, -12, -10, -8, -6, -4, -2, 2, 4, 6, 8, 10, 12, 14];
        bgStatic.innerHTML = emojis.map((emoji, i) => {
            const rot = rotations[i % rotations.length] + (Math.random() * 6 - 3);
            return `<span style="--rot: ${rot}deg;">${emoji}</span>`;
        }).join('');
    }
}

// ============================================================
// COUNTDOWN
// ============================================================

let countdownInterval;

function startCountdown() {
    let hours = 12, minutes = 30, seconds = 45;
    const cdEl = document.getElementById('countdown');
    if (!cdEl) return;
    
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        
        const h = String(hours).padStart(2, '0');
        const m = String(minutes).padStart(2, '0');
        const s = String(seconds).padStart(2, '0');
        
        const hourLabel = currentLang === 'en' ? 'Hours' : 'ساعات';
        const minLabel = currentLang === 'en' ? 'Minutes' : 'دقائق';
        const secLabel = currentLang === 'en' ? 'Seconds' : 'ثواني';
        
        cdEl.innerHTML = `
            <div class="cd-item"><span>${hourLabel}</span> ${h}</div>
            <div class="cd-item"><span>${minLabel}</span> ${m}</div>
            <div class="cd-item"><span>${secLabel}</span> ${s}</div>
        `;
    }, 1000);
}

// ============================================================
// LOAD SAVED SETTINGS
// ============================================================

function loadSavedSettings() {
    // Theme
    const savedTheme = localStorage.getItem('alwaha_theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        const checkbox = document.getElementById('themeCheckbox');
        if (checkbox) checkbox.checked = true;
    }
    
    // Language
    const savedLang = localStorage.getItem('alwaha_lang');
    if (savedLang === 'en') {
        document.documentElement.setAttribute('lang', 'en');
        currentLang = 'en';
        updateLanguage('en');
    }
}

// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {
    // Category cards
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
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => filterProducts(), 200);
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const productModal = document.getElementById('productModal');
            if (productModal && productModal.classList.contains('open')) UI.closeProductModal();
            
            const checkoutModal = document.getElementById('checkoutModal');
            if (checkoutModal && checkoutModal.classList.contains('open')) Orders.closeCheckout();
            
            const cartSidebar = document.getElementById('cartSidebar');
            if (cartSidebar && cartSidebar.classList.contains('open')) toggleCart();
            
            const profileModal = document.getElementById('profileModal');
            if (profileModal && profileModal.classList.contains('open')) closeProfileModal();
        }
    });
    
    // Payment & Delivery selection
    document.querySelectorAll('.payment-options label').forEach(label => {
        label.addEventListener('click', function(e) {
            e.stopPropagation();
            document.querySelectorAll('.payment-options label').forEach(l => l.classList.remove('selected'));
            this.classList.add('selected');
            const radio = this.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
            Orders.validateForm();
        });
    });

    document.querySelectorAll('#deliveryOptions label').forEach(label => {
        label.addEventListener('click', function(e) {
            e.stopPropagation();
            document.querySelectorAll('#deliveryOptions label').forEach(l => l.classList.remove('selected'));
            this.classList.add('selected');
            const radio = this.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
            
            const deliveryTimeInput = document.getElementById('deliveryTimeInput');
            const deliveryTime = document.getElementById('deliveryTime');
            if (radio && radio.value === 'وقت محدد') {
                deliveryTimeInput.classList.add('show');
                deliveryTime.required = true;
                Orders.setMinDeliveryTime();
            } else {
                deliveryTimeInput.classList.remove('show');
                deliveryTime.required = false;
                deliveryTime.value = '';
            }
            Orders.validateForm();
        });
    });

    // Default selections
    const defaultPayment = document.querySelector('.payment-options label:first-child');
    if (defaultPayment) {
        defaultPayment.classList.add('selected');
        const radio = defaultPayment.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
    }

    const defaultDelivery = document.querySelector('#deliveryOptions label:first-child');
    if (defaultDelivery) {
        defaultDelivery.classList.add('selected');
        const radio = defaultDelivery.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
    }
    
    // Theme toggle
    const themeCheckbox = document.getElementById('themeCheckbox');
    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', function() {
            toggleTheme();
        });
    }
}

// ============================================================
// ADMIN ACCESS
// ============================================================

function setupAdminAccess() {
    let logoClickCount = 0;
    let clickTimer = null;
    
    const logoTrigger = document.getElementById('logoTrigger');
    if (logoTrigger) {
        logoTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            logoClickCount++;
            
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                logoClickCount = 0;
            }, 3000);

            if (logoClickCount >= 5) {
                const password = prompt('🔐 أدخل كلمة مرور لوحة التحكم:');
                if (password === 'QQZ#154p') {
                    window.location.href = 'admin.html';
                } else if (password !== null) {
                    showToast('❌ كلمة المرور غير صحيحة!', 'error', '⚠️');
                }
                logoClickCount = 0;
            }
        });
    }
}

// ============================================================
// TOGGLE FUNCTIONS
// ============================================================

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (!sidebar || !overlay) return;
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
}

function toggleSearch() {
    const box = document.getElementById('searchToggle');
    if (!box) return;
    box.classList.toggle('active');
    const input = document.getElementById('searchInput');
    if (box.classList.contains('active')) {
        setTimeout(() => input?.focus(), 100);
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const checkbox = document.getElementById('themeCheckbox');
    const isDark = html.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
        html.removeAttribute('data-theme');
        if (checkbox) checkbox.checked = false;
        showToast(`${currentLang === 'en' ? 'Light mode' : 'الوضع النهاري'}`, 'success', '☀️');
    } else {
        html.setAttribute('data-theme', 'dark');
        if (checkbox) checkbox.checked = true;
        showToast(`${currentLang === 'en' ? 'Dark mode' : 'الوضع الليلي'}`, 'success', '🌙');
    }
    localStorage.setItem('alwaha_theme', isDark ? 'light' : 'dark');
}

function filterProducts() {
    Products.render(currentSort, document.getElementById('searchInput')?.value || '');
}

function applySort() {
    currentSort = document.getElementById('sortFilter')?.value || 'default';
    Products.render(currentSort, document.getElementById('searchInput')?.value || '');
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// LANGUAGE
// ============================================================

function toggleLang() {
    if (currentLang === 'ar') {
        document.documentElement.setAttribute('lang', 'en');
        currentLang = 'en';
        updateLanguage('en');
        showToast('English', 'success', '🌍');
    } else {
        document.documentElement.setAttribute('lang', 'ar');
        currentLang = 'ar';
        updateLanguage('ar');
        showToast('العربية', 'success', '🌍');
    }
    localStorage.setItem('alwaha_lang', currentLang);
    Products.render(currentSort, document.getElementById('searchInput')?.value || '');
    Cart.updateUI();
}

function updateLanguage(lang) {
    const isEn = lang === 'en';
    
    // Header
    const logoText = document.querySelector('.header .logo .logo-text');
    if (logoText) logoText.innerHTML = isEn ? 'Al-Waha 🌱' : 'الواحة 🌱';
    
    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = isEn ? 'Search...' : 'ابحث...';
    
    // Hero
    const heroTitle = document.querySelector('.hero .hero-title');
    if (heroTitle) heroTitle.innerHTML = isEn ? 'Al-Waha Store' : 'متجر الواحة';
    const heroSubtitle = document.querySelector('.hero .hero-subtitle');
    if (heroSubtitle) heroSubtitle.innerHTML = isEn ? 'Fresh fruits & vegetables from nature' : 'خضروات وفاكهة طازجة من قلب الطبيعة';
    
    // Floating checkout
    const floatingCheckoutText = document.getElementById('floatingCheckoutText');
    if (floatingCheckoutText) floatingCheckoutText.textContent = isEn ? 'Checkout' : 'شراء';

    // Categories
    const categoriesTitle = document.getElementById('categoriesTitle');
    if (categoriesTitle) categoriesTitle.innerHTML = `<i class="fas fa-th-large"></i> ${isEn ? 'Categories' : 'الأقسام'}`;
    document.getElementById('catFruitTitle').textContent = isEn ? 'Fruits' : 'فاكهة';
    document.getElementById('catVegTitle').textContent = isEn ? 'Vegetables' : 'خضروات';
    document.getElementById('catOffersTitle').textContent = isEn ? 'Offers' : 'عروض';

    // Products
    document.getElementById('productsTitle').innerHTML = `<i class="fas fa-box"></i> ${isEn ? 'Our Products' : 'منتجاتنا'}`;
    document.getElementById('fruitsSubTitle').innerHTML = `<i class="fas fa-apple-alt"></i> ${isEn ? 'Fruits' : 'الفاكهة'}`;
    document.getElementById('vegSubTitle').innerHTML = `<i class="fas fa-carrot"></i> ${isEn ? 'Vegetables' : 'الخضروات'}`;
    document.getElementById('offersSubTitle').innerHTML = `<i class="fas fa-tag"></i> ${isEn ? 'Offers & Discounts' : 'العروض والخصومات'}`;

    // Sort
    document.getElementById('sortLabel').textContent = isEn ? 'Sort:' : 'ترتيب:';
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        const options = sortFilter.options;
        if (options[0]) options[0].textContent = isEn ? 'Default' : 'الافتراضي';
        if (options[1]) options[1].textContent = isEn ? 'Price (Low to High)' : 'السعر (من الأقل)';
        if (options[2]) options[2].textContent = isEn ? 'Price (High to Low)' : 'السعر (من الأعلى)';
        if (options[3]) options[3].textContent = isEn ? 'Most Popular' : 'الأكثر طلباً';
    }

    // Offers
    document.getElementById('offersTitle').innerHTML = `<i class="fas fa-tag"></i> ${isEn ? "Today's Offers" : 'عروض اليوم'}`;
    document.getElementById('offersDesc').textContent = isEn ? '20% off on all seasonal fruits' : 'خصم 20% على جميع الفواكه الموسمية';
    
    // Countdown
    const cdItems = document.querySelectorAll('.countdown .cd-item span');
    if (cdItems.length >= 3) {
        cdItems[0].textContent = isEn ? 'Hours' : 'ساعات';
        cdItems[1].textContent = isEn ? 'Minutes' : 'دقائق';
        cdItems[2].textContent = isEn ? 'Seconds' : 'ثواني';
    }

    // Contact
    document.getElementById('contactTitle').innerHTML = `<i class="fas fa-phone"></i> ${isEn ? 'Contact Us' : 'تواصل معنا'}`;
    document.getElementById('contactSub').textContent = isEn ? "We're here to help" : 'نحن هنا لخدمتك';

    // Cart
    const cartTotalHeader = document.getElementById('cartTotalHeader');
    if (cartTotalHeader) {
        const totalPrice = document.getElementById('cartTotalPrice');
        cartTotalHeader.innerHTML = `
            <span id="cartHeaderTotal">${totalPrice ? totalPrice.textContent : '0 ج.م'}</span>
            <small>${isEn ? 'Total without delivery fee' : 'المجموع بدون قيمة التوصيل'}</small>
        `;
    }
    document.querySelector('.cart-header .btn-checkout-small').innerHTML = `<i class="fas fa-credit-card"></i> ${isEn ? 'Checkout' : 'شراء'}`;
    document.getElementById('labelTotal').textContent = isEn ? 'Total' : 'المجموع';
    document.querySelector('.cart-total-note').textContent = isEn ? '* Total without delivery fee' : '* المجموع بدون قيمة التوصيل';

    // Checkout
    document.getElementById('checkoutTitle').innerHTML = `<i class="fas fa-clipboard-check"></i> ${isEn ? 'Confirm Order' : 'تأكيد الطلب'}`;
    document.getElementById('checkoutSub').textContent = isEn ? 'Fill in your details' : 'املأ بياناتك لإتمام الطلب';

    // Labels
    document.getElementById('labelCustName').innerHTML = `${isEn ? 'Full Name' : 'الاسم الكامل'} <span class="required">*</span>`;
    document.getElementById('labelCustPhone').innerHTML = `${isEn ? 'Phone Number' : 'رقم الجوال'} <span class="required">*</span>`;
    document.getElementById('labelCustAddress').innerHTML = `${isEn ? 'Address Details' : 'معلومات المكان'} <span class="required">*</span>`;
    document.getElementById('labelCustNotes').textContent = isEn ? 'Notes' : 'ملاحظات';
    document.getElementById('labelDeliveryTime').innerHTML = `${isEn ? 'Delivery Time' : 'وقت التوصيل'} <span class="required">*</span>`;
    document.getElementById('labelPaymentMethod').innerHTML = `${isEn ? 'Payment Method' : 'طريقة الدفع'} <span class="required">*</span>`;

    // Delivery options
    const deliveryLabels = document.querySelectorAll('#deliveryOptions label');
    if (deliveryLabels.length >= 2) {
        deliveryLabels[0].innerHTML = `
            <input type="radio" name="delivery" value="اسرع وقت" checked /> 
            <i class="fas fa-clock"></i> ${isEn ? 'Fastest time' : 'أسرع وقت'}
        `;
        deliveryLabels[1].innerHTML = `
            <input type="radio" name="delivery" value="وقت محدد" /> 
            <i class="fas fa-calendar-alt"></i> ${isEn ? 'Specific time' : 'وقت محدد'}
        `;
    }

    document.querySelector('.delivery-note').innerHTML = `
        <i class="fas fa-info-circle"></i> 
        ${isEn ? 'Delivery fee ranges from 15 EGP to 30 EGP depending on distance' : 'قيمة التوصيل تتراوح بين 15ج إلى 30ج حسب المسافة'}
    `;

    document.getElementById('btnConfirmOrder').innerHTML = `<i class="fas fa-check-circle"></i> ${isEn ? 'Confirm Order' : 'تأكيد الشراء'}`;
    document.getElementById('btnCancelOrder').textContent = isEn ? 'Cancel' : 'إلغاء';

    // Modal
    document.getElementById('labelWeight').textContent = isEn ? 'Weight (kg):' : 'الوزن (كجم):';
    document.getElementById('modalAddBtn').innerHTML = `<i class="fas fa-plus-circle"></i> ${isEn ? 'Add' : 'إضافة'}`;

    // Share
    const shareLinks = document.querySelectorAll('.share-popup a');
    if (shareLinks.length >= 2) {
        shareLinks[0].innerHTML = `<i class="fab fa-whatsapp"></i> ${isEn ? 'WhatsApp' : 'واتساب'}`;
        shareLinks[1].innerHTML = `<i class="fas fa-copy"></i> ${isEn ? 'Copy' : 'نسخ'}`;
    }

    // Payment
    const paymentLabels = document.querySelectorAll('.payment-options label');
    if (paymentLabels.length >= 3) {
        paymentLabels[0].innerHTML = `
            <input type="radio" name="payment" value="كاش عند التوصيل" checked /> 
            <i class="fas fa-money-bill-wave"></i> ${isEn ? 'Cash on delivery' : 'كاش عند التوصيل'}
        `;
        paymentLabels[1].innerHTML = `
            <input type="radio" name="payment" value="إنستا باي" /> 
            <i class="fas fa-mobile-alt"></i> ${isEn ? 'InstaPay' : 'إنستا باي'}
        `;
        paymentLabels[2].innerHTML = `
            <input type="radio" name="payment" value="محفظة إلكترونية" /> 
            <i class="fas fa-wallet"></i> ${isEn ? 'e-Wallet' : 'محفظة إلكترونية'}
        `;
    }

    document.querySelector('.phone-hint').innerHTML = `
        <i class="fas fa-info-circle"></i> 
        ${isEn ? 'Prefer to write number without leading zero' : 'يُفضل كتابة الرقم بدون الصفر الأول'}
    `;

    document.getElementById('couponLabel').textContent = isEn ? 'Have a coupon?' : 'هل لديك كوبون خصم؟';
    document.getElementById('couponCode').placeholder = isEn ? 'Enter code' : 'أدخل الكود';
    document.querySelector('.coupon-row .coupon-btn').textContent = isEn ? 'Apply' : 'تطبيق';
}

// ============================================================
// TOAST
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
// GLOBAL EXPORTS (للتوافق مع HTML)
// ============================================================

window.toggleLang = toggleLang;
window.filterProducts = filterProducts;
window.applySort = applySort;
window.toggleCart = toggleCart;
window.toggleSearch = toggleSearch;
window.toggleTheme = toggleTheme;
window.scrollToTop = scrollToTop;
window.showToast = showToast;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleForgotPassword = handleForgotPassword;
window.handleGoogleLogin = handleGoogleLogin;
window.closeProfileModal = closeProfileModal;
window.copyShareLink = copyShareLink;
window.saveProfile = saveProfile;

// ============================================================
// AUTH MODAL FUNCTIONS (للتوافق مع HTML)
// ============================================================

function openAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.classList.add('open');
        document.body.style.overflow = 'hidden';
        switchAuthTab('login');
    }
}

function closeAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tabs button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.toggle('active', form.id === (tab === 'login' ? 'loginForm' : 'signupForm'));
    });
    const loginError = document.getElementById('loginError');
    if (loginError) loginError.classList.remove('show');
    const signupError = document.getElementById('signupError');
    if (signupError) signupError.classList.remove('show');
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail')?.value || '';
    const password = document.getElementById('loginPassword')?.value || '';
    Auth.loginWithEmail(email, password);
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName')?.value || '';
    const email = document.getElementById('signupEmail')?.value || '';
    const password = document.getElementById('signupPassword')?.value || '';
    Auth.signupWithEmail(email, password, name);
}

function handleForgotPassword() {
    const email = document.getElementById('loginEmail')?.value || '';
    Auth.resetPassword(email);
}

function handleGoogleLogin() {
    Auth.loginWithGoogle();
}

// ============================================================
// PROFILE FUNCTIONS (للتوافق مع HTML)
// ============================================================

function closeProfileModal() {
    const profileModal = document.getElementById('profileModal');
    if (profileModal) {
        profileModal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function copyShareLink() {
    Referral.copyShareLink();
}

function saveProfile() {
    const name = document.getElementById('profileDisplayName')?.value?.trim();
    const phone = document.getElementById('profilePhone')?.value?.trim();
    const address = document.getElementById('profileAddress')?.value?.trim();
    
    if (!name) {
        showToast('⚠️ الاسم مطلوب', 'error');
        return;
    }
    
    const user = Auth.getUser();
    if (!user) {
        showToast('⚠️ يجب تسجيل الدخول أولاً', 'error');
        return;
    }
    
    try {
        if (typeof supabaseClient !== 'undefined') {
            supabaseClient
                .from('users')
                .update({
                    display_name: name,
                    phone: phone || '',
                    address: address || ''
                })
                .eq('id', user.id)
                .then(({ error }) => {
                    if (error) throw error;
                    
                    const userData = Auth.getUserData();
                    if (userData) {
                        userData.display_name = name;
                        userData.phone = phone || '';
                        userData.address = address || '';
                    }
                    
                    localStorage.setItem('alwaha_name', name);
                    localStorage.setItem('alwaha_phone', phone || '');
                    localStorage.setItem('alwaha_address', address || '');
                    
                    UI.updateForLoggedInUser();
                    showToast('✅ تم حفظ التغييرات', 'success');
                    closeProfileModal();
                })
                .catch(error => {
                    console.error('❌ Error saving profile:', error);
                    showToast('حدث خطأ في الحفظ', 'error');
                });
        } else {
            const userData = Auth.getUserData();
            if (userData) {
                userData.display_name = name;
                userData.phone = phone || '';
                userData.address = address || '';
            }
            
            localStorage.setItem('alwaha_name', name);
            localStorage.setItem('alwaha_phone', phone || '');
            localStorage.setItem('alwaha_address', address || '');
            
            UI.updateForLoggedInUser();
            showToast('✅ تم حفظ التغييرات', 'success');
            closeProfileModal();
        }
    } catch (error) {
        console.error('❌ Error saving profile:', error);
        showToast('حدث خطأ في الحفظ', 'error');
    }
}

// ============================================================
// SCROLL TO TOP BUTTON
// ============================================================

window.addEventListener('scroll', function() {
    const btn = document.getElementById('backToTop');
    if (btn) btn.classList.toggle('show', window.scrollY > 400);
});

console.log('✅ All modules loaded successfully'); 
