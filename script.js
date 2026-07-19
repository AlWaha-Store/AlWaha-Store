// ============================================================
// script.js - متجر الواحة - منطق المتجر بالكامل
// ============================================================

// ============================================================
// 1. PRODUCTS DATA - قائمة المنتجات
// ============================================================
const productsData = [
    // ===== فاكهة =====
    { id: 1, name: 'تفاح', nameEn: 'Apple', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍎', price: 25,
        desc: 'تفاح طازج من مزارعنا', descEn: 'Fresh apples from our farms', popular: 120, offer: null },
    { id: 2, name: 'برتقال', nameEn: 'Orange', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍊', price: 20,
        desc: 'برتقال عصير طازج', descEn: 'Fresh juice oranges', popular: 95, offer: null },
    { id: 3, name: 'موز', nameEn: 'Banana', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍌', price: 28,
        desc: 'موز طازج من المزرعة', descEn: 'Fresh bananas from the farm', popular: 150, offer: null },
    { id: 4, name: 'مانجو', nameEn: 'Mango', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🥭', price: 30,
        oldPrice: 35, desc: 'مانجو طازج - عرض خاص', descEn: 'Fresh mango - Special offer', popular: 200,
        offer: 'عرض 5 كجم بسعر 150 ج.م' },
    { id: 5, name: 'أناناس', nameEn: 'Pineapple', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍍', price: 40,
        desc: 'أناناس طازج من الفلبين', descEn: 'Fresh pineapple from Philippines', popular: 60, offer: null },
    { id: 6, name: 'فراولة', nameEn: 'Strawberry', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍓', price: 35,
        oldPrice: 45, desc: 'فراولة طازجة - عرض خاص', descEn: 'Fresh strawberries - Special offer', popular: 180,
        offer: 'خصم 20%' },
    { id: 7, name: 'عنب', nameEn: 'Grapes', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍇', price: 38,
        desc: 'عنب أسود حلو', descEn: 'Sweet black grapes', popular: 110, offer: null },
    { id: 8, name: 'رمان', nameEn: 'Pomegranate', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍎', price: 32,
        desc: 'رمان أحمر شهي', descEn: 'Delicious red pomegranate', popular: 75, offer: null },
    // ===== خضروات =====
    { id: 9, name: 'طماطم', nameEn: 'Tomato', category: 'خضار', categoryEn: 'Vegetables', emoji: '🍅', price: 15,
        oldPrice: 20, desc: 'طماطم طازجة - عرض خاص', descEn: 'Fresh tomatoes - Special offer', popular: 190,
        offer: 'خصم 25%' },
    { id: 10, name: 'خيار', nameEn: 'Cucumber', category: 'خضار', categoryEn: 'Vegetables', emoji: '🥒', price: 15,
        desc: 'خيار طازج مقرمش', descEn: 'Fresh crunchy cucumber', popular: 140, offer: null },
    { id: 11, name: 'فلفل', nameEn: 'Pepper', category: 'خضار', categoryEn: 'Vegetables', emoji: '🫑', price: 30,
        desc: 'فلفل ألوان طازج', descEn: 'Fresh colorful peppers', popular: 90, offer: null },
    { id: 12, name: 'خس', nameEn: 'Lettuce', category: 'خضار', categoryEn: 'Vegetables', emoji: '🥬', price: 10,
        oldPrice: 12, desc: 'خس طازج - عرض خاص', descEn: 'Fresh lettuce - Special offer', popular: 130,
        offer: 'عرض 5 كجم بسعر 50 ج.م' },
    { id: 13, name: 'سبانخ', nameEn: 'Spinach', category: 'خضار', categoryEn: 'Vegetables', emoji: '🌿', price: 14,
        desc: 'سبانخ غني بالحديد', descEn: 'Iron-rich spinach', popular: 85, offer: null },
    { id: 14, name: 'جزر', nameEn: 'Carrot', category: 'خضار', categoryEn: 'Vegetables', emoji: '🥕', price: 18,
        desc: 'جزر طازج غني بفيتامين أ', descEn: 'Fresh vitamin A rich carrots', popular: 160, offer: null },
    { id: 15, name: 'بطاطس', nameEn: 'Potato', category: 'خضار', categoryEn: 'Vegetables', emoji: '🥔', price: 16,
        oldPrice: 22, desc: 'بطاطس طازجة - 5 كجم بسعر خاص', descEn: 'Fresh potatoes - 5kg special price', popular: 220,
        offer: '5 كجم بسعر 80 ج.م' },
    { id: 16, name: 'بنجر', nameEn: 'Beetroot', category: 'خضار', categoryEn: 'Vegetables', emoji: '🍠', price: 20,
        desc: 'بنجر أحمر غني بالحديد', descEn: 'Iron-rich red beetroot', popular: 65, offer: null },
];

// ============================================================
// 2. CART - السلة
// ============================================================
let cart = [];
let currentLang = 'ar';
let currentSort = 'default';

function loadCart() {
    try {
        const saved = localStorage.getItem('alwaha_cart_v9');
        if (saved) {
            cart = JSON.parse(saved);
            if (!Array.isArray(cart)) cart = [];
        }
    } catch (e) { cart = []; }
}

function saveCart() {
    try {
        localStorage.setItem('alwaha_cart_v9', JSON.stringify(cart));
    } catch (e) {}
}
loadCart();

// ============================================================
// 3. TOAST - الإشعارات
// ============================================================
function showToast(message, type = 'success', icon = '') {
    const container = document.getElementById('toastContainer');
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
// 4. RENDER - عرض المنتجات
// ============================================================
function getProductName(p) { return currentLang === 'en' ? p.nameEn : p.name; }
function getProductCategory(p) { return currentLang === 'en' ? p.categoryEn : p.category; }
function getProductDesc(p) { return currentLang === 'en' ? p.descEn : p.desc; }

function renderProducts(sort = currentSort, search = '') {
    const fruitsGrid = document.getElementById('fruitsGrid');
    const vegGrid = document.getElementById('vegetablesGrid');
    const offersGrid = document.getElementById('offersGrid');

    let fruits = productsData.filter(p => p.category === 'فاكهة');
    let vegetables = productsData.filter(p => p.category === 'خضار');
    let offers = productsData.filter(p => p.offer !== null);

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
            let offerHtml = '';
            if (p.offer) {
                offerHtml = `<span class="offer-badge">عرض</span>`;
            }
            let priceHtml = '';
            if (p.oldPrice) {
                priceHtml =
                    `<span class="old-price">${p.oldPrice}</span> ${p.price} <small>${priceLabel}</small>`;
            } else {
                priceHtml = `${p.price} <small>${priceLabel}</small>`;
            }
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
                openProductModal(p.id);
            });
        });
    };

    renderGrid(fruitsGrid, fruits);
    renderGrid(vegGrid, vegetables);
    renderGrid(offersGrid, offers, true);
}

// ============================================================
// 5. FILTERS - التصفية والبحث
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
    renderProducts(currentSort, document.getElementById('searchInput').value);
}

function applySort() {
    currentSort = document.getElementById('sortFilter').value;
    renderProducts(currentSort, document.getElementById('searchInput').value);
}

// ============================================================
// 6. PRODUCT MODAL - نافذة المنتج
// ============================================================
let modalProductId = null;
let modalWeight = 1;
let shareProductData = null;

function openProductModal(id) {
    const p = productsData.find(item => item.id === id);
    if (!p) return;
    modalProductId = p.id;
    shareProductData = p;
    const priceLabel = currentLang === 'en' ? 'EGP/kg' : 'ج.م / كجم';
    
    document.getElementById('modalEmoji').textContent = p.emoji;
    document.getElementById('modalName').textContent = getProductName(p);
    
    let priceHtml = '';
    if (p.oldPrice) {
        priceHtml =
            `<span class="old-price">${p.oldPrice}</span> ${p.price} <small>${priceLabel}</small>`;
    } else {
        priceHtml = `${p.price} <small>${priceLabel}</small>`;
    }
    document.getElementById('modalPrice').innerHTML = priceHtml;
    document.getElementById('modalDesc').textContent = getProductDesc(p);
    
    const offerTag = document.getElementById('modalOfferTag');
    if (p.offer) {
        offerTag.style.display = 'inline-block';
        offerTag.textContent = `🏷️ ${p.offer}`;
    } else {
        offerTag.style.display = 'none';
    }
    
    document.getElementById('modalWeight').value = 1;
    modalWeight = 1;
    document.getElementById('sharePopup').classList.remove('show');
    document.getElementById('productModal').classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('modalAddBtn').innerHTML =
        `<i class="fas fa-plus-circle"></i> ${currentLang === 'en' ? 'Add' : 'إضافة'}`;
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('open');
    document.body.style.overflow = '';
    document.getElementById('sharePopup').classList.remove('show');
}

function changeModalWeight(delta) {
    const input = document.getElementById('modalWeight');
    let val = parseFloat(input.value) || 1;
    val = Math.max(0.25, Math.round((val + delta) * 100) / 100);
    input.value = val;
    modalWeight = val;
}

document.getElementById('modalWeight').addEventListener('change', function() {
    let val = parseFloat(this.value) || 1;
    val = Math.max(0.25, Math.round(val * 100) / 100);
    this.value = val;
    modalWeight = val;
});

document.getElementById('productModal').addEventListener('click', function(e) {
    if (e.target === this) closeProductModal();
});

// ============================================================
// 7. SHARE - المشاركة
// ============================================================
function toggleSharePopup() {
    document.getElementById('sharePopup').classList.toggle('show');
}

function shareProduct(platform) {
    if (!shareProductData) return;
    const p = shareProductData;
    const shopPhone = '01229156909';
    const shopName = currentLang === 'en' ? 'Al-Waha' : 'الواحة';
    const productName = getProductName(p);
    const productDesc = getProductDesc(p);
    const priceLabel = currentLang === 'en' ? 'EGP/kg' : 'ج.م/كجم';
    const siteUrl = window.location.href;
    
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
            document.getElementById('sharePopup').classList.remove('show');
            return;
    }
    if (url) {
        window.open(url, '_blank');
    }
    document.getElementById('sharePopup').classList.remove('show');
}

document.addEventListener('click', function(e) {
    const popup = document.getElementById('sharePopup');
    const btn = document.querySelector('.btn-share');
    if (popup && !popup.contains(e.target) && !btn.contains(e.target)) {
        popup.classList.remove('show');
    }
});

// ============================================================
// 8. ADD TO CART - إضافة للسلة
// ============================================================
function addFromModal() {
    const p = productsData.find(item => item.id === modalProductId);
    if (!p) return;

    const weight = parseFloat(document.getElementById('modalWeight').value) || 1;
    
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

// ============================================================
// 9. CART UI - واجهة السلة
// ============================================================
function updateCartUI() {
    const list = document.getElementById('cartItemsList');
    const fbadge = document.getElementById('floatingBadge');
    const totalSpan = document.getElementById('cartTotalPrice');
    const headerTotal = document.getElementById('cartHeaderTotal');
    const floatingCheckoutBtn = document.getElementById('floatingCheckout');

    let totalItems = 0;
    let totalPrice = 0;
    const kgLabel = currentLang === 'en' ? 'kg' : 'كجم';
    const currency = currentLang === 'en' ? 'EGP' : 'ج.م';

    const grouped = {};
    cart.forEach(item => {
        const key = `${item.id}`;
        if (grouped[key]) {
            grouped[key].qty += item.qty;
            grouped[key].weight = (grouped[key].weight * (grouped[key].qty - item.qty) + item.weight * item
            .qty) / grouped[key].qty;
        } else {
            grouped[key] = { ...item };
        }
    });
    const groupedItems = Object.values(grouped);

    const uniqueItems = groupedItems.length;

    if (groupedItems.length === 0) {
        list.innerHTML =
            `<div class="empty-cart-msg" id="emptyCartMsg"><i class="fas fa-shopping-cart"></i>${currentLang === 'en' ? 'Your cart is empty' : 'سلتك فارغة'}</div>`;
        if (fbadge) fbadge.textContent = '0';
        totalSpan.textContent = `0 ${currency}`;
        if (headerTotal) headerTotal.textContent = `0 ${currency}`;
        if (floatingCheckoutBtn) floatingCheckoutBtn.style.display = 'none';
        return;
    }

    let html = '';
    groupedItems.forEach(item => {
        const totalWeight = item.weight * item.qty;
        const itemTotal = item.price * totalWeight;
        totalItems += item.qty;
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
    totalSpan.textContent = totalPrice.toFixed(2) + ' ' + currency;
    if (headerTotal) headerTotal.textContent = totalPrice.toFixed(2) + ' ' + currency;

    if (floatingCheckoutBtn) floatingCheckoutBtn.style.display = 'flex';
}

// ============================================================
// 10. CART OPERATIONS - عمليات السلة
// ============================================================
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
// 11. TOGGLE CART - فتح/غلق السلة
// ============================================================
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
}

// ============================================================
// 12. CHECKOUT - الدفع
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
            grouped[key].weight = (grouped[key].weight * (grouped[key].qty - item.qty) + item.weight * item
            .qty) / grouped[key].qty;
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
    summaryHtml +=
        `<div class="cs-total"><span>${currentLang === 'en' ? 'Total' : 'الإجمالي'}</span><span>${total.toFixed(2)} ${currency}</span></div>`;
    summaryHtml +=
        `<div class="cs-total-note">${currentLang === 'en' ? '* Total without delivery fee' : '* الإجمالي بدون قيمة التوصيل'}</div>`;
    document.getElementById('checkoutSummary').innerHTML = summaryHtml;

    const savedPhone = localStorage.getItem('alwaha_phone');
    if (savedPhone) document.getElementById('custPhone').value = savedPhone;
    const savedName = localStorage.getItem('alwaha_name');
    if (savedName) document.getElementById('custName').value = savedName;
    const savedAddress = localStorage.getItem('alwaha_address');
    if (savedAddress) document.getElementById('custAddress').value = savedAddress;

    document.getElementById('checkoutModal').classList.add('open');
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('active');
    document.body.style.overflow = 'hidden';
    validateCheckoutForm();
    setMinDeliveryTime();
}

function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('open');
    document.body.style.overflow = '';
    document.getElementById('cartSidebar').classList.add('open');
    document.getElementById('cartOverlay').classList.add('active');
}

function setMinDeliveryTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    const isoString = now.toISOString().slice(0, 16);
    document.getElementById('deliveryTime').min = isoString;
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

    if (nameVal.length >= 3 && phoneVal.length >= 7 && addressVal.length >= 10 && isDeliveryTimeValid) {
        confirmBtn.removeAttribute('disabled');
    } else {
        confirmBtn.setAttribute('disabled', 'true');
    }
}

document.querySelectorAll('.payment-options label').forEach(label => {
    label.addEventListener('click', function() {
        document.querySelectorAll('.payment-options label').forEach(l => l.classList.remove('selected'));
        this.classList.add('selected');
        this.querySelector('input[type="radio"]').checked = true;
        validateCheckoutForm();
    });
});

document.querySelectorAll('#deliveryOptions label').forEach(label => {
    label.addEventListener('click', function() {
        document.querySelectorAll('#deliveryOptions label').forEach(l => l.classList.remove('selected'));
        this.classList.add('selected');
        this.querySelector('input[type="radio"]').checked = true;
        const timeInput = document.getElementById('deliveryTimeInput');
        if (this.dataset.delivery === 'وقت محدد') {
            timeInput.classList.add('show');
            setMinDeliveryTime();
        } else {
            timeInput.classList.remove('show');
        }
        validateCheckoutForm();
    });
});

document.getElementById('checkoutModal').addEventListener('click', function(e) {
    if (e.target === this) closeCheckout();
});

// ============================================================
// 13. CONFIRM ORDER - تأكيد الطلب
// ============================================================
function confirmOrder() {
    if (cart.length === 0) {
        showToast(`${currentLang === 'en' ? 'Cart is empty!' : 'سلتك فارغة!'}`, 'error', '⚠️');
        return;
    }

    const name = document.getElementById('custName')?.value?.trim() || (currentLang === 'en' ? 'Customer' : 'عميل');
    const countryCode = document.getElementById('countryCode')?.value || '20';
    let phoneInput = document.getElementById('custPhone')?.value?.trim() || '';
    const address = document.getElementById('custAddress')?.value?.trim() || (currentLang === 'en' ? 'Not specified' : 'لم يحدد');
    const notes = document.getElementById('custNotes')?.value?.trim() || '';
    const paymentRadio = document.querySelector('input[name="payment"]:checked');
    const payment = paymentRadio ? paymentRadio.value : (currentLang === 'en' ? 'Cash on delivery' : 'كاش عند التوصيل');
    const deliveryRadio = document.querySelector('input[name="delivery"]:checked');
    let delivery = deliveryRadio ? deliveryRadio.value : (currentLang === 'en' ? 'Fastest time' : 'اسرع وقت');
    const deliveryTime = document.getElementById('deliveryTime')?.value || '';

    if (!phoneInput) {
        showToast(`${currentLang === 'en' ? 'Enter phone number' : 'أدخل رقم الجوال'}`, 'error', '⚠️');
        document.getElementById('custPhone')?.focus();
        return;
    }

    let cleanPhone = phoneInput.replace(/[\s\-\(\)]/g, '');
    let fullPhone;
    if (cleanPhone.startsWith('0')) {
        fullPhone = countryCode + cleanPhone.substring(1);
    } else {
        fullPhone = countryCode + cleanPhone;
    }

    try {
        localStorage.setItem('alwaha_phone', fullPhone);
        localStorage.setItem('alwaha_name', name);
        localStorage.setItem('alwaha_address', address);
    } catch (e) {}

    const shopName = currentLang === 'en' ? 'Al-Waha' : 'الواحة';
    const currency = currentLang === 'en' ? 'EGP' : 'ج.م';
    const kgLabel = currentLang === 'en' ? 'kg' : 'كجم';

    const grouped = {};
    cart.forEach(item => {
        const key = `${item.id}`;
        if (grouped[key]) {
            grouped[key].qty += item.qty;
            grouped[key].weight = (grouped[key].weight * (grouped[key].qty - item.qty) + item.weight * item
            .qty) / grouped[key].qty;
        } else {
            grouped[key] = { ...item };
        }
    });
    const groupedItems = Object.values(grouped);

    let msg = `🌿 *طلب جديد من متجر ${shopName}* 🛒\n`;
    msg += `───────────────────\n`;
    msg += `🛍 *المنتجات المطلوبة:*\n`;
    let total = 0;
    groupedItems.forEach(item => {
        const totalWeight = item.weight * item.qty;
        const itemTotal = item.price * totalWeight;
        total += itemTotal;
        const productName = currentLang === 'en' ? item.nameEn : item.name;
        msg += `• ${item.emoji} *${productName}*:\n`;
        msg += `   - الوزن: ${totalWeight.toFixed(2)} ${kgLabel}\n`;
        if (item.oldPrice) {
            const oldTotal = item.oldPrice * totalWeight;
            msg += `   - السعر: ${oldTotal.toFixed(2)} → ${itemTotal.toFixed(2)} ${currency} (عرض خاص)\n`;
        } else {
            msg += `   - السعر: ${itemTotal.toFixed(2)} ${currency}\n`;
        }
        msg += `\n`;
    });
    msg += `───────────────────\n`;
    msg += `💰 *الإجمالي:* ${total.toFixed(2)} ${currency}\n`;
    msg += `🚚 *قيمة التوصيل:* حسب المسافة (تتراوح بين 15ج إلى 30ج)\n`;
    msg += `───────────────────\n`;
    msg += `👤 *معلومات العميل الشخصية:*\n`;
    msg += `• *الاسم:* ${name}\n`;
    msg += `• *الجوال:* +${fullPhone}\n`;
    msg += `───────────────────\n`;
    msg += `📍 *معلومات العنوان بالتفصيل:*\n`;
    msg += `${address}\n`;
    if (notes) {
        msg += `───────────────────\n`;
        msg += `📝 *ملاحظات التوصيل:* ${notes}\n`;
    }
    msg += `───────────────────\n`;
    msg += `⏱️ *وقت التوصيل المختار:* ${delivery === 'وقت محدد' ? 'وقت محدد' : 'أسرع وقت الممكن'}`;
    if (delivery === 'وقت محدد' && deliveryTime) {
        const formattedTime = new Date(deliveryTime).toLocaleString(currentLang === 'en' ? 'en-US' : 'ar-EG');
        msg += `\n📅 *الميعاد:* ${formattedTime}`;
    }
    msg += `\n───────────────────\n`;
    msg += `💳 *طريقة الدفع:* ${payment}\n`;
    if (payment.includes('إنستا') || payment.includes('Insta') || payment.includes('محفظة') || payment.includes('Wallet')) {
        msg += `\n⚠️ *ملاحظة هامة للدفع الإلكتروني:*\n`;
        msg += `يرجى إرسال مبلغ الطلب إلى الرقم التالي:\n`;
        msg += `📞 *01005777923*\n`;
        msg += `مع ضرورة إرسال لقطة شاشة (Screenshot) للتحويل هنا لتأكيد الطلب وبدء الشحن.\n`;
    }
    msg += `───────────────────\n`;
    msg += `🌸 *نشكرك على اختيارك متجر الواحة - طازج وصحي دائماً!*`;

    const shopNumber = '201229156909';
    const whatsappUrl = `https://wa.me/${shopNumber}?text=${encodeURIComponent(msg)}`;

    cart = [];
    saveCart();
    updateCartUI();

    const checkoutModal = document.getElementById('checkoutModal');
    const cartOverlay = document.getElementById('cartOverlay');
    if (checkoutModal) checkoutModal.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('active');
    document.body.style.overflow = '';

    showToast(`${currentLang === 'en' ? 'Order confirmed!' : 'تم تأكيد طلبك!'}`, 'success', '🎉');
    setTimeout(() => { window.open(whatsappUrl, '_blank'); }, 600);
}

// ============================================================
// 14. THEME - الوضع الليلي/النهاري
// ============================================================
let currentTheme = 'light';

function toggleTheme() {
    const html = document.documentElement;
    const icon = document.getElementById('themeIcon');
    if (currentTheme === 'light') {
        html.setAttribute('data-theme', 'dark');
        currentTheme = 'dark';
        icon.className = 'fas fa-sun';
        document.getElementById('bg-static').style.opacity = '0.05';
        showToast(`${currentLang === 'en' ? 'Dark mode' : 'الوضع الليلي'}`, 'success', '🌙');
    } else {
        html.removeAttribute('data-theme');
        currentTheme = 'light';
        icon.className = 'fas fa-moon';
        document.getElementById('bg-static').style.opacity = '0.1';
        showToast(`${currentLang === 'en' ? 'Light mode' : 'الوضع النهاري'}`, 'success', '☀️');
    }
    localStorage.setItem('alwaha_theme', currentTheme);
}

const savedTheme = localStorage.getItem('alwaha_theme');
if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    currentTheme = 'dark';
    document.getElementById('themeIcon').className = 'fas fa-sun';
    document.getElementById('bg-static').style.opacity = '0.05';
}

// ============================================================
// 15. LANGUAGE - الترجمة
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
    renderProducts(currentSort, document.getElementById('searchInput').value);
    updateCartUI();
    if (modalProductId) {
        const p = productsData.find(item => item.id === modalProductId);
        if (p) {
            const priceLabel = currentLang === 'en' ? 'EGP/kg' : 'ج.م / كجم';
            document.getElementById('modalName').textContent = getProductName(p);
            let priceHtml = '';
            if (p.oldPrice) {
                priceHtml =
                    `<span class="old-price">${p.oldPrice}</span> ${p.price} <small>${priceLabel}</small>`;
            } else {
                priceHtml = `${p.price} <small>${priceLabel}</small>`;
            }
            document.getElementById('modalPrice').innerHTML = priceHtml;
            document.getElementById('modalDesc').textContent = getProductDesc(p);
            document.getElementById('modalAddBtn').innerHTML =
                `<i class="fas fa-plus-circle"></i> ${currentLang === 'en' ? 'Add' : 'إضافة'}`;
        }
    }
}

function updateLanguage(lang) {
    const isEn = lang === 'en';
    document.querySelector('.header .logo .arabic').innerHTML = isEn ? 'Al-Waha 🌱' : 'الواحة 🌱';
    document.getElementById('searchInput').placeholder = isEn ? 'Search...' : 'ابحث...';
    document.querySelector('.hero .hero-title').innerHTML = isEn ? 'Al-Waha Store' : 'متجر الواحة';
    document.querySelector('.hero .hero-subtitle').innerHTML = isEn ? 'Fresh fruits & vegetables from nature' : 'خضروات وفاكهة طازجة من قلب الطبيعة';
    document.getElementById('floatingCheckoutText').textContent = isEn ? 'Checkout' : 'شراء';

    document.getElementById('categoriesTitle').innerHTML = `<i class="fas fa-th-large"></i> ${isEn ? 'Categories' : 'الأقسام'}`;
    document.getElementById('catFruitTitle').textContent = isEn ? 'Fruits' : 'فاكهة';
    document.getElementById('catVegTitle').textContent = isEn ? 'Vegetables' : 'خضروات';
    document.getElementById('catOffersTitle').textContent = isEn ? 'Offers' : 'عروض';
    document.getElementById('catKitchenTitle').textContent = isEn ? 'Smart Kitchen' : 'المطبخ الذكي';

    document.getElementById('productsTitle').innerHTML = `<i class="fas fa-box"></i> ${isEn ? 'Our Products' : 'منتجاتنا'}`;
    document.getElementById('fruitsSubTitle').innerHTML = `<i class="fas fa-apple-alt"></i> ${isEn ? 'Fruits' : 'الفاكهة'}`;
    document.getElementById('vegSubTitle').innerHTML = `<i class="fas fa-carrot"></i> ${isEn ? 'Vegetables' : 'الخضروات'}`;
    document.getElementById('offersSubTitle').innerHTML = `<i class="fas fa-tag"></i> ${isEn ? 'Offers & Discounts' : 'العروض والخصومات'}`;

    document.getElementById('sortLabel').textContent = isEn ? 'Sort:' : 'ترتيب:';
    document.querySelector('#sortFilter option[value="default"]').textContent = isEn ? 'Default' : 'الافتراضي';
    document.querySelector('#sortFilter option[value="price-asc"]').textContent = isEn ? 'Price (Low to High)' : 'السعر (من الأقل)';
    document.querySelector('#sortFilter option[value="price-desc"]').textContent = isEn ? 'Price (High to Low)' : 'السعر (من الأعلى)';
    document.querySelector('#sortFilter option[value="popular"]').textContent = isEn ? 'Most Popular' : 'الأكثر طلباً';

    document.getElementById('offersTitle').innerHTML = `<i class="fas fa-tag"></i> ${isEn ? "Today's Offers" : 'عروض اليوم'}`;
    document.getElementById('offersDesc').textContent = isEn ? '20% off on all seasonal fruits' : 'خصم 20% على جميع الفواكه الموسمية';
    document.querySelectorAll('.countdown .cd-item span')[0].textContent = isEn ? 'Hours' : 'ساعات';
    document.querySelectorAll('.countdown .cd-item span')[1].textContent = isEn ? 'Minutes' : 'دقائق';
    document.querySelectorAll('.countdown .cd-item span')[2].textContent = isEn ? 'Seconds' : 'ثواني';

    document.getElementById('contactTitle').innerHTML = `<i class="fas fa-phone"></i> ${isEn ? 'Contact Us' : 'تواصل معنا'}`;
    document.getElementById('contactSub').textContent = isEn ? "We're here to help" : 'نحن هنا لخدمتك';

    document.getElementById('kitchenTitle').innerHTML = `<i class="fas fa-utensils"></i> ${isEn ? 'Smart Kitchen' : 'المطبخ الذكي'}`;
    document.getElementById('kitchenSub').textContent = isEn ? 'Select products and get recipes' : 'اختر المنتجات التي لديك وسنقترح لك وصفات مناسبة';
    document.getElementById('findRecipesBtn').innerHTML = `<i class="fas fa-search"></i> ${isEn ? 'Find Recipes' : 'ابحث عن وصفات'}`;

    document.getElementById('cartTotalHeader').innerHTML = 
        `<span id="cartHeaderTotal">${document.getElementById('cartTotalPrice').textContent}</span>
        <small>${isEn ? 'Total without delivery fee' : 'المجموع بدون قيمة التوصيل'}</small>`;
    document.querySelector('.cart-header .btn-checkout-small').innerHTML = `<i class="fas fa-credit-card"></i> ${isEn ? 'Checkout' : 'شراء'}`;
    document.getElementById('labelTotal').textContent = isEn ? 'Total' : 'المجموع';
    
    const emptyMsg = document.getElementById('emptyCartMsg');
    if(emptyMsg) {
        emptyMsg.innerHTML = `<i class="fas fa-shopping-cart"></i>${isEn ? 'Your cart is empty' : 'سلتك فارغة'}`;
    }
    const totalNote = document.querySelector('.cart-total-note');
    if(totalNote) {
        totalNote.textContent = isEn ? '* Total without delivery fee' : '* المجموع بدون قيمة التوصيل';
    }

    document.getElementById('checkoutTitle').innerHTML = `<i class="fas fa-clipboard-check"></i> ${isEn ? 'Confirm Order' : 'تأكيد الطلب'}`;
    document.getElementById('checkoutSub').textContent = isEn ? 'Fill in your details' : 'املأ بياناتك لإتمام الطلب';

    document.getElementById('labelCustName').innerHTML = `${isEn ? 'Full Name' : 'الاسم الكامل'} <span class="required">*</span>`;
    document.getElementById('labelCustPhone').innerHTML = `${isEn ? 'Phone Number' : 'رقم الجوال'} <span class="required">*</span>`;
    document.getElementById('labelCustAddress').innerHTML = `${isEn ? 'Address Details' : 'معلومات المكان'} <span class="required">*</span>`;
    document.getElementById('labelCustNotes').innerHTML = `${isEn ? 'Notes' : 'ملاحظات'}`;
    document.getElementById('labelDeliveryTime').innerHTML = `${isEn ? 'Delivery Time' : 'وقت التوصيل'} <span class="required">*</span>`;
    document.getElementById('labelPaymentMethod').innerHTML = `${isEn ? 'Payment Method' : 'طريقة الدفع'} <span class="required">*</span>`;

    document.querySelectorAll('#deliveryOptions label')[0].innerHTML =
        `<input type="radio" name="delivery" value="اسرع وقت" checked /> <i class="fas fa-clock"></i> ${isEn ? 'Fastest time' : 'أسرع وقت'}`;
    document.querySelectorAll('#deliveryOptions label')[1].innerHTML =
        `<input type="radio" name="delivery" value="وقت محدد" /> <i class="fas fa-calendar-alt"></i> ${isEn ? 'Specific time' : 'وقت محدد'}`;

    const deliveryNote = document.querySelector('.delivery-note');
    if (deliveryNote) {
        deliveryNote.innerHTML = `<i class="fas fa-info-circle"></i> ${isEn ? 'Delivery fee ranges from 15 EGP to 30 EGP depending on distance' : 'قيمة التوصيل تتراوح بين 15ج إلى 30ج حسب المسافة'}`;
    }

    document.getElementById('btnConfirmOrder').innerHTML = `<i class="fas fa-check-circle"></i> ${isEn ? 'Confirm Order' : 'تأكيد الشراء'}`;
    document.getElementById('btnCancelOrder').textContent = isEn ? 'Cancel' : 'إلغاء';

    document.getElementById('labelWeight').textContent = isEn ? 'Weight (kg):' : 'الوزن (كجم):';
    const addBtn = document.getElementById('modalAddBtn');
    if (addBtn) addBtn.innerHTML = `<i class="fas fa-plus-circle"></i> ${isEn ? 'Add' : 'إضافة'}`;

    document.querySelectorAll('.share-popup a')[0].innerHTML = `<i class="fab fa-whatsapp"></i> ${isEn ? 'WhatsApp' : 'واتساب'}`;
    document.querySelectorAll('.share-popup a')[1].innerHTML = `<i class="fas fa-copy"></i> ${isEn ? 'Copy' : 'نسخ'}`;

    const paymentLabels = document.querySelectorAll('.payment-options label');
    if (paymentLabels.length >= 3) {
        paymentLabels[0].innerHTML =
            `<input type="radio" name="payment" value="كاش عند التوصيل" checked /> <i class="fas fa-money-bill-wave"></i> ${isEn ? 'Cash on delivery' : 'كاش عند التوصيل'}`;
        paymentLabels[1].innerHTML =
            `<input type="radio" name="payment" value="إنستا باي" /> <i class="fas fa-mobile-alt"></i> ${isEn ? 'InstaPay' : 'إنستا باي'}`;
        paymentLabels[2].innerHTML =
            `<input type="radio" name="payment" value="محفظة إلكترونية" /> <i class="fas fa-wallet"></i> ${isEn ? 'e-Wallet' : 'محفظة إلكترونية'}`;
    }

    document.querySelector('.phone-hint').innerHTML =
        `<i class="fas fa-info-circle"></i> ${isEn ? 'Prefer to write number without leading zero' : 'يُفضل كتابة الرقم بدون الصفر الأول'}`;

    document.querySelector('.theme-toggle').title = isEn ? 'Toggle theme' : 'تبديل المظهر';
    document.querySelector('.lang-toggle').title = isEn ? 'Toggle language' : 'تبديل اللغة';
}

const savedLang = localStorage.getItem('alwaha_lang');
if (savedLang === 'en') {
    toggleLang();
}

// ============================================================
// 16. SMART KITCHEN - المطبخ الذكي
// ============================================================
function renderKitchenProducts() {
    const container = document.getElementById('kitchenProducts');
    container.innerHTML = '';
    
    productsData.forEach(p => {
        const label = document.createElement('label');
        label.className = 'kitchen-item';
        label.dataset.id = p.id;
        label.innerHTML = `
            <input type="checkbox" value="${p.id}" />
            ${p.emoji} ${p.name}
        `;
        label.addEventListener('click', function(e) {
            const checkbox = this.querySelector('input');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('selected', checkbox.checked);
        });
        container.appendChild(label);
    });
}

function selectAllKitchen() {
    document.querySelectorAll('#kitchenProducts .kitchen-item input').forEach(cb => {
        cb.checked = true;
        cb.closest('.kitchen-item').classList.add('selected');
    });
}

function deselectAllKitchen() {
    document.querySelectorAll('#kitchenProducts .kitchen-item input').forEach(cb => {
        cb.checked = false;
        cb.closest('.kitchen-item').classList.remove('selected');
    });
}

function loadCartProducts() {
    document.querySelectorAll('#kitchenProducts .kitchen-item input').forEach(cb => {
        cb.checked = false;
        cb.closest('.kitchen-item').classList.remove('selected');
    });
    
    const cartIds = cart.map(item => item.id);
    document.querySelectorAll('#kitchenProducts .kitchen-item input').forEach(cb => {
        if (cartIds.includes(parseInt(cb.value))) {
            cb.checked = true;
            cb.closest('.kitchen-item').classList.add('selected');
        }
    });
}

function findRecipes() {
    const selected = document.querySelectorAll('#kitchenProducts .kitchen-item input:checked');
    const selectedNames = Array.from(selected).map(cb => {
        const label = cb.closest('.kitchen-item');
        return label.textContent.trim().replace(/^[^\s]+\s/, '');
    });
    
    if (selectedNames.length === 0) {
        showToast('اختر منتجات أولاً!', 'error', '⚠️');
        return;
    }
    
    const container = document.getElementById('recipesResults');
    container.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:30px;color:#5a7a5a;">
            <i class="fas fa-utensils" style="font-size:40px;display:block;margin-bottom:10px;color:var(--gold);"></i>
            جاري البحث عن وصفات مناسبة...<br>
            <span style="font-size:13px;">المنتجات المختارة: ${selectedNames.join('، ')}</span>
        </div>
    `;
    
    setTimeout(() => {
        const recipes = [
            {
                name: 'سلطة خضار طازجة',
                emoji: '🥗',
                ingredients: ['طماطم', 'خيار', 'خس', 'فلفل', 'ليمون', 'زيت زيتون'],
                steps: ['اغسل جميع الخضروات', 'قطع الخضروات إلى مكعبات', 'اخلط مع الليمون والزيت'],
                difficulty: 'سهل',
                time: '15 دقيقة',
                tips: 'أضف زيتون أسود للنكهة'
            },
            {
                name: 'شوربة خضار مغذية',
                emoji: '🍲',
                ingredients: ['جزر', 'بطاطس', 'كوسة', 'بصل', 'طماطم', 'ثوم'],
                steps: ['قطع الخضروات', 'احمس البصل والثوم', 'أضف الخضروات والماء', 'اتركها تغلي 20 دقيقة'],
                difficulty: 'متوسط',
                time: '40 دقيقة',
                tips: 'يمكن هرس الشوربة للقوام الكريمي'
            }
        ];
        
        renderRecipes(recipes, selectedNames);
    }, 1500);
}

function renderRecipes(recipes, selectedProducts) {
    const container = document.getElementById('recipesResults');
    
    if (!recipes || recipes.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:30px;color:#5a7a5a;">
                <i class="fas fa-utensils" style="font-size:40px;display:block;margin-bottom:10px;color:var(--gold);"></i>
                لا توجد وصفات مطابقة للمنتجات المختارة
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    recipes.forEach((recipe, index) => {
        const searchQuery = encodeURIComponent(`طريقة عمل ${recipe.name}`);
        const videoUrl1 = `https://www.youtube.com/results?search_query=${searchQuery}`;
        const videoUrl2 = `https://www.youtube.com/results?search_query=${searchQuery}+منزلية`;

        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.style.animation = `modalIn 0.3s ease ${index * 0.1}s both`;
        
        card.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span class="recipe-emoji">${recipe.emoji || '🍳'}</span>
                <div style="flex:1;">
                    <h4>${recipe.name}</h4>
                    <div style="display:flex;gap:12px;flex-wrap:wrap;font-size:12px;color:#5a7a5a;margin-top:2px;">
                        <span>⏱️ ${recipe.time || 'غير محدد'}</span>
                        <span>📊 ${recipe.difficulty || 'متوسط'}</span>
                    </div>
                </div>
            </div>
            
            <div class="recipe-ingredients" style="margin-top:8px;">
                <strong>المكونات:</strong>
                <ul style="margin:4px 0 0 15px;padding-right:15px;list-style-type:disc;">
                    ${recipe.ingredients ? recipe.ingredients.map(ing => `<li style="font-size:13px;margin-bottom:2px;">${ing}</li>`).join('') : 'لا توجد مكونات محددة'}
                </ul>
            </div>
            
            <div class="recipe-steps" style="margin-top:8px;">
                <strong>طريقة التحضير:</strong>
                <ol style="margin:4px 0 0 20px;padding-right:20px;list-style-type:decimal;font-size:13px;line-height:1.8;">
                    ${recipe.steps ? recipe.steps.map(step => `<li>${step}</li>`).join('') : 'لا توجد خطوات محددة'}
                </ol>
            </div>
            
            ${recipe.tips ? `
                <div style="margin-top:8px;padding:8px 12px;background:rgba(212,175,55,0.08);border-radius:8px;border-right:3px solid var(--gold);font-size:13px;">
                    💡 <strong>نصيحة:</strong> ${recipe.tips}
                </div>
            ` : ''}
            
            <div class="recipe-videos" style="margin-top:10px;">
                <a href="${videoUrl1}" target="_blank" class="youtube1" style="flex:1;min-width:100px;padding:6px 12px;border-radius:30px;background:#ff0000;color:white;text-decoration:none;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;transition:var(--transition);font-family:'Tajawal',sans-serif;">
                    <i class="fab fa-youtube"></i> فيديو 1
                </a>
                <a href="${videoUrl2}" target="_blank" class="youtube2" style="flex:1;min-width:100px;padding:6px 12px;border-radius:30px;background:#c4302b;color:white;text-decoration:none;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;transition:var(--transition);font-family:'Tajawal',sans-serif;">
                    <i class="fab fa-youtube"></i> فيديو 2
                </a>
            </div>
        `;
        container.appendChild(card);
    });
}

// ============================================================
// 17. SCROLL TO TOP - الرجوع للأعلى
// ============================================================
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('scroll', function() {
    const btn = document.getElementById('backToTop');
    btn.classList.toggle('show', window.scrollY > 400);
});

// ============================================================
// 18. COUNTDOWN - العد التنازلي
// ============================================================
let countdownInterval;

function startCountdown() {
    let hours = 12, minutes = 30, seconds = 45;
    const cdEl = document.getElementById('countdown');
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
// 19. ADMIN LINK - فتح لوحة التحكم
// ============================================================
let logoClickCount = 0;

function handleLogoClick() {
    logoClickCount++;
    if (logoClickCount >= 5) {
        window.location.href = 'admin.html';
        logoClickCount = 0;
    }
    setTimeout(() => { logoClickCount = 0; }, 3000);
}

// ============================================================
// 20. INIT - التهيئة
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    renderProducts('default', '');
    updateCartUI();
    renderKitchenProducts();
    startCountdown();

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (document.getElementById('productModal').classList.contains('open')) closeProductModal();
            if (document.getElementById('checkoutModal').classList.contains('open')) closeCheckout();
            if (document.getElementById('cartSidebar').classList.contains('open')) toggleCart();
        }
    });

    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => filterProducts(), 200);
    });
    
    setMinDeliveryTime();
}); 