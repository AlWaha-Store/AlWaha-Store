// ============================================================
// admin-script.js - لوحة التحكم - متجر الواحة
// ============================================================

// ============================================================
// 1. AUTHENTICATION - تسجيل الدخول
// ============================================================
const ADMIN_PASSWORD = 'admin123'; // كلمة المرور الافتراضية

// التحقق من تسجيل الدخول
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
// 2. DATA - قراءة البيانات من LocalStorage
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

function getCustomers() {
    try {
        return JSON.parse(localStorage.getItem('alwaha_customers') || '[]');
    } catch { return []; }
}

function saveCustomers(customers) {
    localStorage.setItem('alwaha_customers', JSON.stringify(customers));
}

// ============================================================
// 3. DASHBOARD - لوحة التحكم
// ============================================================
function updateDashboard() {
    const orders = getOrders();
    const products = getProducts();
    const customers = getCustomers();
    
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalRevenue').textContent = 
        orders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2) + ' ج.م';
    document.getElementById('totalCustomers').textContent = customers.length || 0;
    document.getElementById('totalProducts').textContent = products.length || 0;
    document.getElementById('totalOffers').textContent = products.filter(p => p.offerPrice).length || 0;
    document.getElementById('totalVisits').textContent = Math.floor(Math.random() * 50) + 10;
    
    // أحدث الطلبات
    const recentOrders = orders.slice(-5).reverse();
    const tbody = document.getElementById('recentOrders');
    if (recentOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;">لا توجد طلبات حتى الآن</td></tr>';
    } else {
        tbody.innerHTML = recentOrders.map((o, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${o.customer || 'عميل'}</td>
                <td>${o.total || 0} ج.م</td>
                <td><span class="badge ${getStatusBadge(o.status || 'جديد')}">${o.status || 'جديد'}</span></td>
                <td>${o.date || '--'}</td>
                <td><button class="btn btn-primary btn-sm" onclick="viewOrder(${orders.indexOf(o)})">عرض</button></td>
            </tr>
        `).join('');
    }
    
    // المنتجات الأكثر مبيعاً
    const topProducts = products.sort((a, b) => (b.sales || 0) - (a.sales || 0)).slice(0, 5);
    const topTbody = document.getElementById('topProducts');
    if (topProducts.length === 0) {
        topTbody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:#999;">لا توجد بيانات</td></tr>';
    } else {
        topTbody.innerHTML = topProducts.map(p => `
            <tr><td>${p.emoji || '🍎'} ${p.name}</td><td>${p.sales || 0}</td></tr>
        `).join('');
    }
    
    // أحدث العملاء
    const recentCustomers = customers.slice(-5).reverse();
    const custTbody = document.getElementById('recentCustomers');
    if (recentCustomers.length === 0) {
        custTbody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:#999;">لا يوجد عملاء</td></tr>';
    } else {
        custTbody.innerHTML = recentCustomers.map(c => `
            <tr><td>${c.name || 'غير معروف'}</td><td>${c.phone || '--'}</td></tr>
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
// 4. ORDERS - إدارة الطلبات
// ============================================================
function renderOrders(filter = 'all') {
    const orders = getOrders();
    const filtered = filter === 'all' ? orders : orders.filter(o => (o.status || 'جديد') === filter);
    const tbody = document.getElementById('allOrders');
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;">لا توجد طلبات</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map((o, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${o.customer || 'عميل'}</td>
            <td>${o.items ? o.items.length : 0} منتج</td>
            <td>${o.total || 0} ج.م</td>
            <td>
                <select onchange="updateOrderStatus(${orders.indexOf(o)}, this.value)" style="padding:4px 8px;border-radius:30px;border:1px solid #e9ecef;font-family:'Tajawal',sans-serif;font-size:12px;">
                    <option value="جديد" ${(o.status || 'جديد') === 'جديد' ? 'selected' : ''}>جديد</option>
                    <option value="قيد التجهيز" ${o.status === 'قيد التجهيز' ? 'selected' : ''}>قيد التجهيز</option>
                    <option value="تم التوصيل" ${o.status === 'تم التوصيل' ? 'selected' : ''}>تم التوصيل</option>
                    <option value="ملغي" ${o.status === 'ملغي' ? 'selected' : ''}>ملغي</option>
                </select>
            </td>
            <td>${o.date || '--'}</td>
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
        <div style="margin-bottom:10px;"><strong>العميل:</strong> ${order.customer || 'غير معروف'}</div>
        <div style="margin-bottom:10px;"><strong>الهاتف:</strong> ${order.phone || 'غير معروف'}</div>
        <div style="margin-bottom:10px;"><strong>العنوان:</strong> ${order.address || 'غير معروف'}</div>
        <div style="margin-bottom:10px;"><strong>المنتجات:</strong></div>
        <ul style="padding-right:20px;margin-bottom:10px;">
            ${order.items ? order.items.map(item => `<li>${item.name || 'منتج'} - ${item.weight || 0} كجم - ${item.price || 0} ج.م</li>`).join('') : 'لا توجد منتجات'}
        </ul>
        <div style="font-weight:700;font-size:18px;color:#1A5C3A;"><strong>الإجمالي:</strong> ${order.total || 0} ج.م</div>
        <div style="margin-top:10px;"><strong>الحالة:</strong> <span class="badge ${getStatusBadge(order.status || 'جديد')}">${order.status || 'جديد'}</span></div>
        <div style="margin-top:10px;"><strong>التاريخ:</strong> ${order.date || '--'}</div>
        ${order.notes ? `<div style="margin-top:10px;"><strong>ملاحظات:</strong> ${order.notes}</div>` : ''}
    `;
    
    modal.classList.add('open');
}

function printOrder() {
    window.print();
}

function exportOrders() {
    const orders = getOrders();
    const csv = [
        ['#', 'العميل', 'الهاتف', 'المبلغ', 'الحالة', 'التاريخ'],
        ...orders.map((o, i) => [
            i + 1,
            o.customer || '',
            o.phone || '',
            o.total || 0,
            o.status || 'جديد',
            o.date || ''
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
}

function exportOrdersPDF() {
    alert('جاري تحضير ملف PDF... (سيتم توفيره قريباً)');
}

// ============================================================
// 5. PRODUCTS - إدارة المنتجات
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

function importProducts() {
    alert('سيتم فتح نافذة لاستيراد ملف JSON');
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
// 6. OFFERS - إدارة العروض
// ============================================================
function renderOffersTable() {
    const products = getProducts();
    const offers = products.filter(p => p.offerPrice && p.offerPrice < p.price);
    const tbody = document.getElementById('offersList');
    
    if (offers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;">لا توجد عروض</td></tr>';
        return;
    }
    
    tbody.innerHTML = offers.map((p, i) => `
        <tr>
            <td>${p.emoji || '🍎'} ${p.name}</td>
            <td>${p.price || 0} ج.م</td>
            <td>${p.offerPrice || 0} ج.م</td>
            <td>${((p.price - p.offerPrice) / p.price * 100).toFixed(0)}%</td>
            <td>${p.offerDuration || 'غير محدد'}</td>
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
// 7. CUSTOMERS - إدارة العملاء
// ============================================================
function renderCustomersTable() {
    const customers = getCustomers();
    const tbody = document.getElementById('customersList');
    const orders = getOrders();
    
    // تحديث بيانات العملاء من الطلبات
    customers.forEach(c => {
        const customerOrders = orders.filter(o => o.phone === c.phone || o.customer === c.name);
        c.orders = customerOrders.length;
        c.total = customerOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        c.lastOrder = customerOrders.length > 0 ? customerOrders[customerOrders.length - 1].date : '--';
    });
    
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;">لا يوجد عملاء</td></tr>';
        return;
    }
    
    tbody.innerHTML = customers.map((c, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${c.name || 'غير معروف'}</td>
            <td>${c.phone || '--'}</td>
            <td>${c.orders || 0}</td>
            <td>${c.total || 0} ج.م</td>
            <td>${c.lastOrder || '--'}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="viewCustomer(${i})"><i class="fas fa-eye"></i></button>
            </td>
        </tr>
    `).join('');
}

function viewCustomer(index) {
    const customers = getCustomers();
    const c = customers[index];
    if (!c) return;
    
    const modal = document.getElementById('customerModal');
    const details = document.getElementById('customerDetails');
    
    details.innerHTML = `
        <div style="margin-bottom:10px;"><strong>الاسم:</strong> ${c.name || 'غير معروف'}</div>
        <div style="margin-bottom:10px;"><strong>الهاتف:</strong> ${c.phone || 'غير معروف'}</div>
        <div style="margin-bottom:10px;"><strong>عدد الطلبات:</strong> ${c.orders || 0}</div>
        <div style="margin-bottom:10px;"><strong>إجمالي المشتريات:</strong> ${c.total || 0} ج.م</div>
        <div style="margin-bottom:10px;"><strong>آخر طلب:</strong> ${c.lastOrder || '--'}</div>
    `;
    
    modal.classList.add('open');
}

function exportCustomers() {
    const customers = getCustomers();
    const csv = [
        ['#', 'الاسم', 'الهاتف', 'عدد الطلبات', 'إجمالي المشتريات'],
        ...customers.map((c, i) => [
            i + 1,
            c.name || '',
            c.phone || '',
            c.orders || 0,
            c.total || 0
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `customers_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
}

// ============================================================
// 8. ANALYTICS - التحليلات
// ============================================================
function updateAnalytics() {
    const orders = getOrders();
    const total = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const avg = orders.length > 0 ? total / orders.length : 0;
    document.getElementById('avgOrder').textContent = avg.toFixed(2) + ' ج.م';
    
    // محاكاة معدل النمو
    document.getElementById('growthRate').textContent = (Math.random() * 20 + 5).toFixed(1) + '%';
    document.getElementById('returnRate').textContent = (Math.random() * 30 + 20).toFixed(1) + '%';
    
    // المبيعات الشهرية
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const monthlyData = months.slice(0, 6).map((m, i) => ({
        month: m,
        orders: Math.floor(Math.random() * 20 + 5),
        revenue: Math.floor(Math.random() * 500 + 200)
    }));
    
    const tbody = document.getElementById('monthlySales');
    tbody.innerHTML = monthlyData.map((d, i) => `
        <tr>
            <td>${d.month}</td>
            <td>${d.orders}</td>
            <td>${d.revenue} ج.م</td>
            <td>${i > 0 ? ((d.revenue - monthlyData[i-1].revenue) / monthlyData[i-1].revenue * 100).toFixed(1) + '%' : '--'}</td>
        </tr>
    `).join('');
}

// ============================================================
// 9. SETTINGS - الإعدادات
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
        customers: getCustomers(),
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
// 10. MODALS - النوافذ المنبثقة
// ============================================================
function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

// إغلاق المودال عند الضغط على الخلفية
document.querySelectorAll('.modal-overlay').forEach(el => {
    el.addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('open');
    });
});

// ============================================================
// 11. TABS - التبويبات
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
            'customers': 'العملاء',
            'analytics': 'التحليلات',
            'settings': 'الإعدادات'
        }[tab] || 'لوحة التحكم';
    });
});

// ============================================================
// 12. TOAST - الإشعارات
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
// 13. INIT - التهيئة
// ============================================================
function initAdmin() {
    // إضافة أنماط إضافية للتويست
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
    renderCustomersTable();
    updateAnalytics();
    loadSettings();
} 