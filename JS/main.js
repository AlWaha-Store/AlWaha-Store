// ============================================================
// MAIN APPLICATION - التطبيق الرئيسي
// ============================================================

// ============================================================
// GLOBAL VARIABLES
// ============================================================

var currentLang = 'ar';
var currentSort = 'default';
var appliedCoupon = null;

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Al-Waha Store initializing...');
    
    try {
        // 1. Load Products Data
        Products.loadData();
        console.log('📦 Products loaded:', Products.getData().length);
        
        // 2. Render Products
        Products.render('default', '');
        
        // 3. Initialize Auth
        Auth.init();
        
        // 4. Load Cart
        Cart.loadLocal();
        Cart.updateUI();
        
        // 5. Start Countdown
        startCountdown();
        
        // 6. Background Static
        initBackgroundStatic();
        
        // 7. Load Settings
        loadSavedSettings();
        
        // 8. Set min delivery time
        Orders.setMinDeliveryTime();
        
        // 9. Setup event listeners
        setupEventListeners();
        
        // 10. Admin access
        setupAdminAccess();
        
        console.log('✅ All modules initialized successfully');
        
    } catch (error) {
        console.error('❌ Initialization error:', error);
        showToast('⚠️ حدث خطأ في تهيئة التطبيق', 'error');
    }
});

// ============================================================
// BACKGROUND STATIC
// ============================================================

function initBackgroundStatic() {
    const bgStatic = getElement('bg-static');
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
    const cdEl = getElement('countdown');
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
        const checkbox = getElement('themeCheckbox');
        if (checkbox) checkbox.checked = true;
    }
    
    // Language
    const savedLang = localStorage.getItem('alwaha_lang');
    if (savedLang === 'en') {
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
            const target = getElement(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            document.querySelectorAll('.category-card').forEach(c => c.style.borderColor = '');
            this.style.borderColor = 'var(--gold)';
        });
    });
    
    // Search input
    const searchInput = getElement('searchInput');
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
            const productModal = getElement('productModal');
            if (productModal && productModal.classList.contains('open')) closeProductModal();
            
            const checkoutModal = getElement('checkoutModal');
            if (checkoutModal && checkoutModal.classList.contains('open')) closeCheckout();
            
            const cartSidebar = getElement('cartSidebar');
            if (cartSidebar && cartSidebar.classList.contains('open')) toggleCart();
            
            const profileModal = getElement('profileModal');
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
            
            const deliveryTimeInput = getElement('deliveryTimeInput');
            const deliveryTime = getElement('deliveryTime');
            if (radio && radio.value === 'وقت محدد') {
                if (deliveryTimeInput) deliveryTimeInput.classList.add('show');
                if (deliveryTime) {
                    deliveryTime.required = true;
                    Orders.setMinDeliveryTime();
                }
            } else {
                if (deliveryTimeInput) deliveryTimeInput.classList.remove('show');
                if (deliveryTime) {
                    deliveryTime.required = false;
                    deliveryTime.value = '';
                }
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
    const themeCheckbox = getElement('themeCheckbox');
    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', function() {
            toggleTheme();
        });
    }
    
    // Form validation on input
    const formInputs = ['custName', 'custPhone', 'custAddress', 'deliveryTime'];
    formInputs.forEach(id => {
        const el = getElement(id);
        if (el) {
            el.addEventListener('input', Orders.validateForm);
        }
    });
}

// ============================================================
// ADMIN ACCESS
// ============================================================

function setupAdminAccess() {
    let logoClickCount = 0;
    let clickTimer = null;
    
    const logoTrigger = getElement('logoTrigger');
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
                    showToast('❌ كلمة المرور غير صحيحة!', 'error');
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
    const sidebar = getElement('cartSidebar');
    const overlay = getElement('cartOverlay');
    if (!sidebar || !overlay) return;
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
}

function toggleSearch() {
    const box = getElement('searchToggle');
    if (!box) return;
    box.classList.toggle('active');
    const input = getElement('searchInput');
    if (box.classList.contains('active')) {
        setTimeout(() => input?.focus(), 100);
    }
}

function toggleSideMenu() {
    const overlay = getElement('sideMenuOverlay');
    const menu = getElement('sideMenu');
    if (!overlay || !menu) return;
    overlay.classList.toggle('open');
    menu.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
}

function toggleTheme() {
    const html = document.documentElement;
    const checkbox = getElement('themeCheckbox');
    const isDark = html.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
        html.removeAttribute('data-theme');
        if (checkbox) checkbox.checked = false;
        showToast(
            currentLang === 'en' ? 'Light mode' : 'الوضع النهاري',
            'success',
            '☀️'
        );
    } else {
        html.setAttribute('data-theme', 'dark');
        if (checkbox) checkbox.checked = true;
        showToast(
            currentLang === 'en' ? 'Dark mode' : 'الوضع الليلي',
            'success',
            '🌙'
        );
    }
    localStorage.setItem('alwaha_theme', isDark ? 'light' : 'dark');
}

function filterProducts() {
    const searchInput = getElement('searchInput');
    Products.render(currentSort, searchInput?.value || '');
}

function applySort() {
    currentSort = getValue('sortFilter') || 'default';
    const searchInput = getElement('searchInput');
    Products.render(currentSort, searchInput?.value || '');
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
    Products.render(currentSort, getValue('searchInput') || '');
    Cart.updateUI();
}

function updateLanguage(lang) {
    const isEn = lang === 'en';
    
    // Header
    const logoText = document.querySelector('.header .logo .logo-text');
    if (logoText) logoText.innerHTML = isEn ? 'Al-Waha 🌱' : 'الواحة 🌱';
    
    // Search
    const searchInput = getElement('searchInput');
    if (searchInput) searchInput.placeholder = isEn ? 'Search...' : 'ابحث...';
    
    // Hero
    const heroTitle = document.querySelector('.hero .hero-title');
    if (heroTitle) heroTitle.innerHTML = isEn ? 'Al-Waha Store' : 'متجر الواحة';
    
    const heroSubtitle = document.querySelector('.hero .hero-subtitle');
    if (heroSubtitle) heroSubtitle.innerHTML = isEn ? 'Fresh fruits & vegetables from nature' : 'خضروات وفاكهة طازجة من قلب الطبيعة';
    
    // Floating checkout
    const floatingCheckoutText = getElement('floatingCheckoutText');
    if (floatingCheckoutText) floatingCheckoutText.textContent = isEn ? 'Checkout' : 'شراء';

    // Categories
    const categoriesTitle = getElement('categoriesTitle');
    if (categoriesTitle) categoriesTitle.innerHTML = `<i class="fas fa-th-large"></i> ${isEn ? 'Categories' : 'الأقسام'}`;
    
    const catFruit = getElement('catFruitTitle');
    if (catFruit) catFruit.textContent = isEn ? 'Fruits' : 'فاكهة';
    
    const catVeg = getElement('catVegTitle');
    if (catVeg) catVeg.textContent = isEn ? 'Vegetables' : 'خضروات';
    
    const catOffers = getElement('catOffersTitle');
    if (catOffers) catOffers.textContent = isEn ? 'Offers' : 'عروض';

    // Products
    const productsTitle = getElement('productsTitle');
    if (productsTitle) productsTitle.innerHTML = `<i class="fas fa-box"></i> ${isEn ? 'Our Products' : 'منتجاتنا'}`;
    
    const fruitsSub = getElement('fruitsSubTitle');
    if (fruitsSub) fruitsSub.innerHTML = `<i class="fas fa-apple-alt"></i> ${isEn ? 'Fruits' : 'الفاكهة'}`;
    
    const vegSub = getElement('vegSubTitle');
    if (vegSub) vegSub.innerHTML = `<i class="fas fa-carrot"></i> ${isEn ? 'Vegetables' : 'الخضروات'}`;
    
    const offersSub = getElement('offersSubTitle');
    if (offersSub) offersSub.innerHTML = `<i class="fas fa-tag"></i> ${isEn ? 'Offers & Discounts' : 'العروض والخصومات'}`;

    // Sort
    const sortLabel = getElement('sortLabel');
    if (sortLabel) sortLabel.textContent = isEn ? 'Sort:' : 'ترتيب:';
    
    const sortFilter = getElement('sortFilter');
    if (sortFilter) {
        const options = sortFilter.options;
        if (options[0]) options[0].textContent = isEn ? 'Default' : 'الافتراضي';
        if (options[1]) options[1].textContent = isEn ? 'Price (Low to High)' : 'السعر (من الأقل)';
        if (options[2]) options[2].textContent = isEn ? 'Price (High to Low)' : 'السعر (من الأعلى)';
        if (options[3]) options[3].textContent = isEn ? 'Most Popular' : 'الأكثر طلباً';
    }

    // Offers
    const offersTitle = getElement('offersTitle');
    if (offersTitle) offersTitle.innerHTML = `<i class="fas fa-tag"></i> ${isEn ? "Today's Offers" : 'عروض اليوم'}`;
    
    const offersDesc = getElement('offersDesc');
    if (offersDesc) offersDesc.textContent = isEn ? '20% off on all seasonal fruits' : 'خصم 20% على جميع الفواكه الموسمية';
    
    // Countdown
    const cdItems = document.querySelectorAll('.countdown .cd-item span');
    if (cdItems.length >= 3) {
        cdItems[0].textContent = isEn ? 'Hours' : 'ساعات';
        cdItems[1].textContent = isEn ? 'Minutes' : 'دقائق';
        cdItems[2].textContent = isEn ? 'Seconds' : 'ثواني';
    }

    // Contact
    const contactTitle = getElement('contactTitle');
    if (contactTitle) contactTitle.innerHTML = `<i class="fas fa-phone"></i> ${isEn ? 'Contact Us' : 'تواصل معنا'}`;
    
    const contactSub = getElement('contactSub');
    if (contactSub) contactSub.textContent = isEn ? "We're here to help" : 'نحن هنا لخدمتك';

    // Cart
    const cartTotalHeader = getElement('cartTotalHeader');
    if (cartTotalHeader) {
        const totalPrice = getElement('cartTotalPrice');
        cartTotalHeader.innerHTML = `
            <span id="cartHeaderTotal">${totalPrice ? totalPrice.textContent : '0 ج.م'}</span>
            <small>${isEn ? 'Total without delivery fee' : 'المجموع بدون قيمة التوصيل'}</small>
        `;
    }
    
    const checkoutSmall = document.querySelector('.cart-header .btn-checkout-small');
    if (checkoutSmall) checkoutSmall.innerHTML = `<i class="fas fa-credit-card"></i> ${isEn ? 'Checkout' : 'شراء'}`;
    
    const labelTotal = getElement('labelTotal');
    if (labelTotal) labelTotal.textContent = isEn ? 'Total' : 'المجموع';
    
    const totalNote = document.querySelector('.cart-total-note');
    if (totalNote) totalNote.textContent = isEn ? '* Total without delivery fee' : '* المجموع بدون قيمة التوصيل';

    // Checkout
    const checkoutTitle = getElement('checkoutTitle');
    if (checkoutTitle) checkoutTitle.innerHTML = `<i class="fas fa-clipboard-check"></i> ${isEn ? 'Confirm Order' : 'تأكيد الطلب'}`;
    
    const checkoutSub = getElement('checkoutSub');
    if (checkoutSub) checkoutSub.textContent = isEn ? 'Fill in your details' : 'املأ بياناتك لإتمام الطلب';

    // Labels
    const labelCustName = getElement('labelCustName');
    if (labelCustName) labelCustName.innerHTML = `${isEn ? 'Full Name' : 'الاسم الكامل'} <span class="required">*</span>`;
    
    const labelCustPhone = getElement('labelCustPhone');
    if (labelCustPhone) labelCustPhone.innerHTML = `${isEn ? 'Phone Number' : 'رقم الجوال'} <span class="required">*</span>`;
    
    const labelCustAddress = getElement('labelCustAddress');
    if (labelCustAddress) labelCustAddress.innerHTML = `${isEn ? 'Address Details' : 'معلومات المكان'} <span class="required">*</span>`;
    
    const labelCustNotes = getElement('labelCustNotes');
    if (labelCustNotes) labelCustNotes.textContent = isEn ? 'Notes' : 'ملاحظات';
    
    const labelDeliveryTime = getElement('labelDeliveryTime');
    if (labelDeliveryTime) labelDeliveryTime.innerHTML = `${isEn ? 'Delivery Time' : 'وقت التوصيل'} <span class="required">*</span>`;
    
    const labelPaymentMethod = getElement('labelPaymentMethod');
    if (labelPaymentMethod) labelPaymentMethod.innerHTML = `${isEn ? 'Payment Method' : 'طريقة الدفع'} <span class="required">*</span>`;

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

    const deliveryNote = document.querySelector('.delivery-note');
    if (deliveryNote) {
        deliveryNote.innerHTML = `
            <i class="fas fa-info-circle"></i> 
            ${isEn ? 'Delivery fee ranges from 15 EGP to 30 EGP depending on distance' : 'قيمة التوصيل تتراوح بين 15ج إلى 30ج حسب المسافة'}
        `;
    }

    const btnConfirm = getElement('btnConfirmOrder');
    if (btnConfirm) btnConfirm.innerHTML = `<i class="fas fa-check-circle"></i> ${isEn ? 'Confirm Order' : 'تأكيد الشراء'}`;
    
    const btnCancel = getElement('btnCancelOrder');
    if (btnCancel) btnCancel.textContent = isEn ? 'Cancel' : 'إلغاء';

    // Modal
    const labelWeight = getElement('labelWeight');
    if (labelWeight) labelWeight.textContent = isEn ? 'Weight (kg):' : 'الوزن (كجم):';
    
    const modalAddBtn = getElement('modalAddBtn');
    if (modalAddBtn) modalAddBtn.innerHTML = `<i class="fas fa-plus-circle"></i> ${isEn ? 'Add' : 'إضافة'}`;

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

    const phoneHint = document.querySelector('.phone-hint');
    if (phoneHint) {
        phoneHint.innerHTML = `
            <i class="fas fa-info-circle"></i> 
            ${isEn ? 'Prefer to write number without leading zero' : 'يُفضل كتابة الرقم بدون الصفر الأول'}
        `;
    }

    const couponLabel = getElement('couponLabel');
    if (couponLabel) couponLabel.textContent = isEn ? 'Have a coupon?' : 'هل لديك كوبون خصم؟';
    
    const couponCode = getElement('couponCode');
    if (couponCode) couponCode.placeholder = isEn ? 'Enter code' : 'أدخل الكود';
    
    const couponBtn = document.querySelector('.coupon-row .coupon-btn');
    if (couponBtn) couponBtn.textContent = isEn ? 'Apply' : 'تطبيق';
}

// ============================================================
// AUTH MODAL FUNCTIONS
// ============================================================

function openAuthModal() {
    const authModal = getElement('authModal');
    if (authModal) {
        authModal.classList.add('open');
        document.body.style.overflow = 'hidden';
        switchAuthTab('login');
    }
}

function closeAuthModal() {
    const authModal = getElement('authModal');
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
    
    const loginError = getElement('loginError');
    if (loginError) loginError.classList.remove('show');
    
    const signupError = getElement('signupError');
    if (signupError) signupError.classList.remove('show');
}

function handleLogin(e) {
    e.preventDefault();
    const email = getValue('loginEmail');
    const password = getValue('loginPassword');
    Auth.loginWithEmail(email, password);
}

function handleSignup(e) {
    e.preventDefault();
    const name = getValue('signupName');
    const email = getValue('signupEmail');
    const password = getValue('signupPassword');
    Auth.signupWithEmail(email, password, name);
}

function handleForgotPassword() {
    const email = getValue('loginEmail');
    Auth.resetPassword(email);
}

function handleGoogleLogin() {
    Auth.loginWithGoogle();
}

// ============================================================
// PROFILE FUNCTIONS
// ============================================================

function closeProfileModal() {
    const profileModal = getElement('profileModal');
    if (profileModal) {
        profileModal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function copyShareLink() {
    Referral.copyShareLink();
}

function saveProfile() {
    const name = getValue('profileDisplayName').trim();
    const phone = getValue('profilePhone').trim();
    const address = getValue('profileAddress').trim();
    
    if (!name) {
        showToast(
            currentLang === 'en' ? '⚠️ Name is required' : '⚠️ الاسم مطلوب',
            'error'
        );
        return;
    }
    
    const user = Auth.getUser();
    if (!user) {
        showToast(
            currentLang === 'en' ? '⚠️ Please login first' : '⚠️ يجب تسجيل الدخول أولاً',
            'error'
        );
        return;
    }
    
    try {
        if (isSupabaseAvailable()) {
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
                    showToast(
                        currentLang === 'en' ? '✅ Saved successfully' : '✅ تم حفظ التغييرات',
                        'success'
                    );
                    closeProfileModal();
                })
                .catch(error => {
                    console.error('❌ Error saving profile:', error);
                    showToast(
                        currentLang === 'en' ? 'Error saving' : 'حدث خطأ في الحفظ',
                        'error'
                    );
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
            showToast(
                currentLang === 'en' ? '✅ Saved successfully' : '✅ تم حفظ التغييرات',
                'success'
            );
            closeProfileModal();
        }
    } catch (error) {
        console.error('❌ Error saving profile:', error);
        showToast(
            currentLang === 'en' ? 'Error saving' : 'حدث خطأ في الحفظ',
            'error'
        );
    }
}

function shareStore() {
    Referral.shareStore();
}

function shareProduct(platform) {
    UI.shareProduct(platform);
}

function toggleSharePopup() {
    UI.toggleSharePopup();
}

function addFromModal() {
    Cart.addFromModal();
}

function openCheckout() {
    Orders.openCheckout();
}

function closeCheckout() {
    Orders.closeCheckout();
}

function confirmOrder() {
    Orders.confirmOrder();
}

function applyCoupon() {
    Orders.applyCoupon();
}

function changeModalWeight(delta) {
    UI.changeModalWeight(delta);
}

function openProductModal(id) {
    UI.openProductModal(id);
}

function closeProductModal() {
    UI.closeProductModal();
}

function validateCheckoutForm() {
    Orders.validateForm();
}

// ============================================================
// SCROLL TO TOP BUTTON
// ============================================================

window.addEventListener('scroll', function() {
    const btn = getElement('backToTop');
    if (btn) btn.classList.toggle('show', window.scrollY > 400);
});

// ============================================================
// EXPORT ALL FUNCTIONS
// ============================================================

window.toggleLang = toggleLang;
window.filterProducts = filterProducts;
window.applySort = applySort;
window.toggleCart = toggleCart;
window.toggleSearch = toggleSearch;
window.toggleSideMenu = toggleSideMenu;
window.toggleTheme = toggleTheme;
window.scrollToTop = scrollToTop;
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
window.shareStore = shareStore;
window.shareProduct = shareProduct;
window.addFromModal = addFromModal;
window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.confirmOrder = confirmOrder;
window.applyCoupon = applyCoupon;
window.toggleSharePopup = toggleSharePopup;
window.changeModalWeight = changeModalWeight;
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.validateCheckoutForm = validateCheckoutForm;

console.log('✅ All functions exported successfully');
console.log('📦 Current products count:', Products.getData().length); 
