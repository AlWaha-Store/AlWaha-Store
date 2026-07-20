// ============================================================
// admin-script.js - لوحة التحكم
// ============================================================

// ============================================================
// 1. AUTHENTICATION
// ============================================================
const ADMIN_PASSWORD = 'QQZ#154p';

if (!sessionStorage.getItem('admin_logged_in')) {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
} else {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    initAdmin();
}

function login(e) {
    e.preventDefault();
    const password = document.getElementById('loginPassword').value;
    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('admin_logged_in', 'true');
        location.reload();
    } else {
        alert('كلمة المرور غير صحيحة!');
    }
}

function logout() {
    sessionStorage.removeItem('admin_logged_in');
    location.reload();
}

// ============================================================
// 2. COUPONS
// ============================================================
function getCoupons() {
    try {
        return JSON.parse(localStorage.getItem('alwaha_coupons') || '[]');
    } catch { return []; }
}

function saveCoupons(coupons) {
    localStorage.setItem('alwaha_coupons', JSON.stringify(coupons));
}

function renderCouponsTable() {
    const coupons = getCoupons();
    const tbody = document.getElementById('couponsList');
    
    if (coupons.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;">لا توجد كوبونات</td></tr>';
        return;
    }
    
    tbody.innerHTML = coupons.map((c, i) => `
        <tr>
            <td><span class="coupon-code">${c.code}</span></td>
            <td>${c.discount}${c.type === 'percentage' ? '%' : ' ج.م'}</td>
            <td>${c.type === 'percentage' ? 'نسبة مئوية' : 'قيمة ثابتة'}</td>
            <td>${c.used || 0}</td>
            <td><span class="badge badge-success">نشط</span></td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteCoupon(${i})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function openAddCoupon() {
    document.getElementById('couponModalTitle').textContent = 'إضافة كوبون جديد';
    document.getElementById('editCouponIndex').value = '';
    document.getElementById('couponForm').reset();
    document.getElementById('couponModal').classList.add('open');
}

function saveCoupon(e) {
    e.preventDefault();
    const code = document.getElementById('couponCodeInput').value.trim().toUpperCase();
    const discount = parseFloat(document.getElementById('couponDiscount').value);
    const type = document.getElementById('couponType').value;
    const index = document.getElementById('editCouponIndex').value;
    
    if (!code || !discount) {
        alert('الرجاء إدخال جميع البيانات');
        return;
    }
    
    const coupons = getCoupons();
    
    if (index === '') {
        if (coupons.find(c => c.code === code)) {
            alert('هذا الكود موجود بالفعل');
            return;
        }
        coupons.push({ code, discount, type, used: 0 });
    } else {
        coupons[parseInt(index)] = { code, discount, type, used: coupons[parseInt(index)].used || 0 };
    }
    
    saveCoupons(coupons);
    renderCouponsTable();
    updateDashboard();
    closeModal('couponModal');
    showToast('تم حفظ الكوبون بنجاح', 'success');
}

function deleteCoupon(index) {
    if (!confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return;
    const coupons = getCoupons();
    coupons.splice(index, 1);
    saveCoupons(coupons);
    renderCouponsTable();
    updateDashboard();
    showToast('تم حذف الكوبون', 'success');
}

// ============================================================
// 3. DATA
// ============================================================
function getOrders() {
    try {
        return JSON.parse(localStorage.getItem('alwaha_orders') || '[]');
    } catch { return []; }
}

function saveOrders(orders) {
    localStorage.setItem('alwaha_orders', JSON.stringify(orders));
}

function getProducts() {
    try {
        return JSON.parse(localStorage.getItem('alwaha_products') || '[]');
    } catch { return []; }
}

function saveProducts(products) {
    localStorage.setItem('alwaha_products', JSON.stringify(products));
}

// ============================================================
// 4. DASHBOARD
// ============================================================
function updateDashboard() {
    const orders = getOrders();
    const products = getProducts();
    const coupons = getCoupons();
    
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalRevenue').textContent = 
        orders.reduce((sum, o) => sum + (o.discountedTotal || o.total || 0), 0).toFixed(2) + ' ج.م';
    document.getElementById('totalProducts').textContent = products.length || 0;
    document.getElementById('totalOffers').textContent = products.filter(p => p.offerPrice).length || 0;
    document.getElementById('totalCoupons').textContent = coupons.length || 0;
    
    const recentOrders = orders.slice(0, 5);
    const tbody = document.getElementById('recentOrders');
    if (recentOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;">لا توجد طلبات حتى الآن</td></tr>';
    } else {
        tbody.innerHTML = recentOrders.map((o, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${o.customer || 'عميل'}</td>
                <td>${(o.discountedTotal || o.total || 0).toFixed(2)} ج.م</td>
                <td><span class="badge ${getStatusBadge(o.status || 'جديد')}">${o.status || 'جديد'}</span></td>
                <td>${o.dateAr || o.date || '--'}</td>
                <td><button class="btn btn-primary btn-sm" onclick="viewOrder(${orders.indexOf(o)})">عرض</button></td>
            </tr>
        `).join('');
    }
}

function getStatusBadge(status) {
    const map = {
        'جديد': 'badge-info',
        'قيد التجهيز': 'badge-warning',
        'تم التوصيل': 'badge-success',
        'ملغي': 'badge-danger'
    };
    return map[status] || 'badge-info';
}

// ============================================================
// 5. ORDERS
// ============================================================
function renderOrders(filter = 'all') {
    const orders = getOrders();
    const filtered = filter === 'all' ? orders : orders.filter(o => (o.status || 'جديد') === filter);
    const tbody = document.getElementById('allOrders');
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:#999;">لا توجد طلبات</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map((o, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${o.customer || 'عميل'}</td>
            <td>${o.items ? o.items.length : 0} منتج</td>
            <td>${(o.total || 0).toFixed(2)} ج.م</td>
            <td>${(o.discount || 0).toFixed(2)} ج.م</td>
            <td>${(o.discountedTotal || o.total || 0).toFixed(2)} ج.م</td>
            <td>${o.coupon || '--'}</td>
            <td>
                <select onchange="updateOrderStatus(${orders.indexOf(o)}, this.value)" style="padding:4px 8px;border-radius:30px;border:1px solid rgba(26,92,58,0.08);font-family:'Tajawal',sans-serif;font-size:12px;background:rgba(255,255,255,0.4);">
                    <option value="جديد" ${(o.status || 'جديد') === 'جديد' ? 'selected' : ''}>جديد</option>
                    <option value="قيد التجهيز" ${o.status === 'قيد التجهيز' ? 'selected' : ''}>قيد التجهيز</option>
                    <option value="تم التوصيل" ${o.status === 'تم التوصيل' ? 'selected' : ''}>تم التوصيل</option>
                    <option value="ملغي" ${o.status === 'ملغي' ? 'selected' : ''}>ملغي</option>
                </select>
            </td>
            <td>${o.dateAr || o.date || '--'}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="viewOrder(${orders.indexOf(o)})"><i class="fas fa-eye"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deleteOrder(${orders.indexOf(o)})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function filterOrders() {
    const filter = document.getElementById('orderFilter').value;
    renderOrders(filter);
}

function updateOrderStatus(index, status) {
    const orders = getOrders();
    if (orders[index]) {
        orders[index].status = status;
        saveOrders(orders);
        renderOrders(document.getElementById('orderFilter').value);
        updateDashboard();
        showToast('تم تحديث حالة الطلب', 'success');
    }
}

function deleteOrder(index) {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    const orders = getOrders();
    orders.splice(index, 1);
    saveOrders(orders);
    renderOrders(document.getElementById('orderFilter').value);
    updateDashboard();
    showToast('تم حذف الطلب', 'success');
}

function viewOrder(index) {
    const orders = getOrders();
    const order = orders[index];
    if (!order) return;
    
    const modal = document.getElementById('orderModal');
    const details = document.getElementById('orderDetails');
    
    details.innerHTML = `
        <div style="margin-bottom:8px;"><strong>رقم الطلب:</strong> ${order.id || '--'}</div>
        <div style="margin-bottom:8px;"><strong>العميل:</strong> ${order.customer || 'غير معروف'}</div>
        <div style="margin-bottom:8px;"><strong>الهاتف:</strong> ${order.phone || 'غير معروف'}</div>
        <div style="margin-bottom:8px;"><strong>العنوان:</strong> ${order.address || 'غير معروف'}</div>
        <div style="margin-bottom:8px;"><strong>المنتجات:</strong></div>
        <ul style="padding-right:20px;margin-bottom:8px;">
            ${order.items ? order.items.map(item => `<li>${item.emoji || '📦'} ${item.name || 'منتج'} - ${item.weight || 0} كجم - ${(item.total || 0).toFixed(2)} ج.م</li>`).join('') : 'لا توجد منتجات'}
        </ul>
        <div style="margin-bottom:4px;"><strong>المجموع:</strong> ${(order.total || 0).toFixed(2)} ج.م</div>
        ${order.discount ? `<div style="margin-bottom:4px;color:#27ae60;"><strong>الخصم:</strong> -${(order.discount || 0).toFixed(2)} ج.م</div>` : ''}
        ${order.coupon ? `<div style="margin-bottom:4px;"><strong>كوبون:</strong> ${order.coupon}</div>` : ''}
        <div style="margin-bottom:8px;font-weight:700;font-size:18px;color:#1A5C3A;"><strong>الإجمالي بعد الخصم:</strong> ${(order.discountedTotal || order.total || 0).toFixed(2)} ج.م</div>
        <div style="margin-bottom:4px;"><strong>طريقة الدفع:</strong> ${order.payment || '--'}</div>
        <div style="margin-bottom:4px;"><strong>وقت التوصيل:</strong> ${order.delivery || '--'}</div>
        ${order.deliveryTime ? `<div style="margin-bottom:4px;"><strong>الموعد:</strong> ${new Date(order.deliveryTime).toLocaleString('ar-EG')}</div>` : ''}
        <div style="margin-bottom:4px;"><strong>الحالة:</strong> <span class="badge ${getStatusBadge(order.status || 'جديد')}">${order.status || 'جديد'}</span></div>
        <div style="margin-bottom:4px;"><strong>التاريخ:</strong> ${order.dateAr || order.date || '--'}</div>
        ${order.notes ? `<div style="margin-top:8px;"><strong>ملاحظات:</strong> ${order.notes}</div>` : ''}
    `;
    
    modal.classList.add('open');
}

function exportOrders() {
    const orders = getOrders();
    const csv = [
        ['#', 'العميل', 'الهاتف', 'المجموع', 'الخصم', 'الإجمالي', 'كوبون', 'الحالة', 'التاريخ'],
        ...orders.map((o, i) => [
            i + 1,
            o.customer || '',
            o.phone || '',
            (o.total || 0).toFixed(2),
            (o.discount || 0).toFixed(2),
            (o.discountedTotal || o.total || 0).toFixed(2),
            o.coupon || '',
            o.status || 'جديد',
            o.dateAr || o.date || ''
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
}

// ============================================================
// 6. PRODUCTS
// ============================================================
function renderProductsTable() {
    const products = getProducts();
    const tbody = document.getElementById('productsList');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;">لا توجد منتجات</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map((p, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${p.emoji || '🍎'} ${p.name}</td>
            <td>${p.category || 'غير مصنف'}</td>
            <td>${p.price || 0} ج.م</td>
            <td>${p.offerPrice ? '<span class="badge badge-success">عرض</span>' : '<span class="badge badge-info">عادي</span>'}</td>
            <td>${p.stock || 100}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editProduct(${i})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${i})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function openAddProduct() {
    document.getElementById('productModalTitle').textContent = 'إضافة منتج جديد';
    document.getElementById('editProductId').value = '';
    document.getElementById('productForm').reset();
    document.getElementById('productModal').classList.add('open');
}

function editProduct(index) {
    const products = getProducts();
    const p = products[index];
    if (!p) return;
    
    document.getElementById('productModalTitle').textContent = 'تعديل المنتج';
    document.getElementById('editProductId').value = index;
    document.getElementById('productName').value = p.name || '';
    document.getElementById('productPrice').value = p.price || '';
    document.getElementById('productCategory').value = p.category || 'فاكهة';
    document.getElementById('productEmoji').value = p.emoji || '🍎';
    document.getElementById('productDesc').value = p.desc || '';
    document.getElementById('productOfferPrice').value = p.offerPrice || '';
    document.getElementById('productOfferText').value = p.offerText || '';
    document.getElementById('productStock').value = p.stock || 100;
    document.getElementById('productModal').classList.add('open');
}

function saveProduct(e) {
    e.preventDefault();
    const index = document.getElementById('editProductId').value;
    const products = getProducts();
    
    const product = {
        name: document.getElementById('productName').value.trim(),
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        emoji: document.getElementById('productEmoji').value.trim() || '🍎',
        desc: document.getElementById('productDesc').value.trim(),
        offerPrice: parseFloat(document.getElementById('productOfferPrice').value) || null,
        offerText: document.getElementById('productOfferText').value.trim() || null,
        stock: parseInt(document.getElementById('productStock').value) || 100,
        sales: 0
    };
    
    if (index === '') {
        product.id = Date.now();
        products.push(product);
    } else {
        const idx = parseInt(index);
        product.id = products[idx].id || Date.now();
        products[idx] = product;
    }
    
    saveProducts(products);
    renderProductsTable();
    updateDashboard();
    closeModal('productModal');
    showToast('تم حفظ المنتج بنجاح', 'success');
}

function deleteProduct(index) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    const products = getProducts();
    products.splice(index, 1);
    saveProducts(products);
    renderProductsTable();
    updateDashboard();
    showToast('تم حذف المنتج', 'success');
}

function exportProducts() {
    const products = getProducts();
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `products_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
}

// ============================================================
// 7. OFFERS
// ============================================================
function renderOffersTable() {
    const products = getProducts();
    const offers = products.filter(p => p.offerPrice && p.offerPrice < p.price);
    const tbody = document.getElementById('offersList');
    
    if (offers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;">لا توجد عروض</td></tr>';
        return;
    }
    
    tbody.innerHTML = offers.map((p, i) => `
        <tr>
            <td>${p.emoji || '🍎'} ${p.name}</td>
            <td>${p.price || 0} ج.م</td>
            <td>${p.offerPrice || 0} ج.م</td>
            <td>${((p.price - p.offerPrice) / p.price * 100).toFixed(0)}%</td>
            <td><span class="badge badge-success">نشط</span></td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editProduct(${products.indexOf(p)})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm" onclick="removeOffer(${products.indexOf(p)})"><i class="fas fa-times"></i></button>
            </td>
        </tr>
    `).join('');
}

function removeOffer(index) {
    if (!confirm('هل أنت متأكد من إزالة العرض؟')) return;
    const products = getProducts();
    products[index].offerPrice = null;
    products[index].offerText = null;
    saveProducts(products);
    renderOffersTable();
    showToast('تم إزالة العرض', 'success');
}

function openAddOffer() {
    openAddProduct();
    document.getElementById('productOfferPrice').focus();
}

// ============================================================
// 8. SETTINGS
// ============================================================
function saveSettings(e) {
    e.preventDefault();
    const settings = {
        shopName: document.getElementById('shopName').value,
        shopDesc: document.getElementById('shopDesc').value,
        shopPhone: document.getElementById('shopPhone').value,
        shopWhatsapp: document.getElementById('shopWhatsapp').value,
        primaryColor: document.getElementById('primaryColor').value,
        goldColor: document.getElementById('goldColor').value,
        deliveryFee: parseFloat(document.getElementById('deliveryFee').value) || 15,
        freeDeliveryMin: parseFloat(document.getElementById('freeDeliveryMin').value) || 200,
        welcomeMessage: document.getElementById('welcomeMessage').value
    };
    
    localStorage.setItem('alwaha_settings', JSON.stringify(settings));
    showToast('تم حفظ الإعدادات بنجاح', 'success');
}

function loadSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem('alwaha_settings'));
        if (settings) {
            document.getElementById('shopName').value = settings.shopName || 'الواحة';
            document.getElementById('shopDesc').value = settings.shopDesc || 'خضروات وفاكهة طازجة';
            document.getElementById('shopPhone').value = settings.shopPhone || '01229156909';
            document.getElementById('shopWhatsapp').value = settings.shopWhatsapp || '201229156909';
            document.getElementById('primaryColor').value = settings.primaryColor || '#1A5C3A';
            document.getElementById('goldColor').value = settings.goldColor || '#D4AF37';
            document.getElementById('deliveryFee').value = settings.deliveryFee || 15;
            document.getElementById('freeDeliveryMin').value = settings.freeDeliveryMin || 200;
            document.getElementById('welcomeMessage').value = settings.welcomeMessage || 'مرحباً بكم في متجر الواحة';
        }
    } catch {}
}

function resetSettings() {
    if (!confirm('هل أنت متأكد من استعادة الإعدادات الافتراضية؟')) return;
    localStorage.removeItem('alwaha_settings');
    loadSettings();
    showToast('تم استعادة الإعدادات الافتراضية', 'success');
}

function backupData() {
    const data = {
        products: getProducts(),
        orders: getOrders(),
        coupons: getCoupons(),
        settings: JSON.parse(localStorage.getItem('alwaha_settings') || '{}'),
        date: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `backup_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    showToast('تم إنشاء النسخة الاحتياطية', 'success');
}

// ============================================================
// 9. FIREBASE SYNC - دوال المزامنة مع Firebase
// ============================================================
async function loadProductsFromFirebase() {
    try {
        if (typeof db === 'undefined') {
            showToast('Firebase غير متصل', 'error');
            return;
        }
        const snapshot = await db.collection('products').get();
        const products = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
        localStorage.setItem('alwaha_products', JSON.stringify(products));
        renderProductsTable();
        updateDashboard();
        showToast('تم جلب المنتجات من Firebase ✅', 'success');
    } catch (error) {
        console.error('خطأ في جلب المنتجات:', error);
        showToast('خطأ في جلب المنتجات من Firebase', 'error');
    }
}

async function loadOrdersFromFirebase() {
    try {
        if (typeof db === 'undefined') {
            showToast('Firebase غير متصل', 'error');
            return;
        }
        const snapshot = await db.collection('orders')
            .orderBy('createdAt', 'desc')
            .get();
        const orders = [];
        snapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        localStorage.setItem('alwaha_orders', JSON.stringify(orders));
        renderOrders(document.getElementById('orderFilter')?.value || 'all');
        updateDashboard();
        showToast('تم جلب الطلبات من Firebase ✅', 'success');
    } catch (error) {
        console.error('خطأ في جلب الطلبات:', error);
        showToast('خطأ في جلب الطلبات من Firebase', 'error');
    }
}

async function loadCouponsFromFirebase() {
    try {
        if (typeof db === 'undefined') {
            showToast('Firebase غير متصل', 'error');
            return;
        }
        const snapshot = await db.collection('coupons').get();
        const coupons = [];
        snapshot.forEach(doc => {
            coupons.push({ id: doc.id, ...doc.data() });
        });
        localStorage.setItem('alwaha_coupons', JSON.stringify(coupons));
        renderCouponsTable();
        updateDashboard();
        showToast('تم جلب الكوبونات من Firebase ✅', 'success');
    } catch (error) {
        console.error('خطأ في جلب الكوبونات:', error);
        showToast('خطأ في جلب الكوبونات من Firebase', 'error');
    }
}

function addSyncButton() {
    const header = document.querySelector('.main-content .header');
    if (header) {
        const btn = document.createElement('button');
        btn.innerHTML = '<i class="fas fa-sync"></i> مزامنة';
        btn.className = 'btn btn-gold';
        btn.style.marginRight = '10px';
        btn.style.padding = '8px 16px';
        btn.style.fontSize = '14px';
        btn.onclick = async function() {
            if (typeof db === 'undefined') {
                showToast('⚠️ Firebase غير متصل، تأكد من الإعدادات', 'error');
                return;
            }
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري...';
            this.disabled = true;
            await loadProductsFromFirebase();
            await loadOrdersFromFirebase();
            await loadCouponsFromFirebase();
            this.innerHTML = '<i class="fas fa-sync"></i> مزامنة';
            this.disabled = false;
            showToast('تمت المزامنة بنجاح ✅', 'success');
        };
        const adminInfo = header.querySelector('.admin-info');
        if (adminInfo) {
            adminInfo.prepend(btn);
        }
    }
}

// ============================================================
// 10. MODALS
// ============================================================
function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

document.querySelectorAll('.modal-overlay').forEach(el => {
    el.addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('open');
    });
});

// ============================================================
// 11. TABS
// ============================================================
document.querySelectorAll('.menu-item[data-tab]').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
        this.classList.add('active');
        
        const tab = this.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.getElementById(`tab-${tab}`).classList.add('active');
        
        document.getElementById('pageTitle').textContent = {
            'dashboard': 'لوحة التحكم',
            'orders': 'الطلبات',
            'products': 'المنتجات',
            'offers': 'العروض',
            'coupons': 'الكوبونات',
            'settings': 'الإعدادات'
        }[tab] || 'لوحة التحكم';
    });
});

// ============================================================
// 12. TOAST
// ============================================================
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 20px; left: 20px; 
        background: ${type === 'success' ? '#1A5C3A' : '#dc3545'}; 
        color: white; padding: 12px 24px; 
        border-radius: 12px; font-weight: 600; 
        box-shadow: 0 4px 20px rgba(0,0,0,0.15); 
        z-index: 9999; font-family: 'Tajawal', sans-serif;
        animation: slideInRight 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = '0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================================
// 13. INIT
// ============================================================
function initAdmin() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(40px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    updateDashboard();
    renderOrders();
    renderProductsTable();
    renderOffersTable();
    renderCouponsTable();
    loadSettings();
    
    // إضافة زر المزامنة بعد تحميل الصفحة
    setTimeout(addSyncButton, 1000);
}

// تصدير الدوال للاستخدام العام
window.logout = logout;
window.login = login;
window.openAddProduct = openAddProduct;
window.saveProduct = saveProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.exportProducts = exportProducts;
window.openAddOffer = openAddOffer;
window.removeOffer = removeOffer;
window.openAddCoupon = openAddCoupon;
window.saveCoupon = saveCoupon;
window.deleteCoupon = deleteCoupon;
window.filterOrders = filterOrders;
window.updateOrderStatus = updateOrderStatus;
window.deleteOrder = deleteOrder;
window.viewOrder = viewOrder;
window.exportOrders = exportOrders;
window.closeModal = closeModal;
window.saveSettings = saveSettings;
window.resetSettings = resetSettings;
window.backupData = backupData;
window.loadProductsFromFirebase = loadProductsFromFirebase;
window.loadOrdersFromFirebase = loadOrdersFromFirebase;
window.loadCouponsFromFirebase = loadCouponsFromFirebase; 
