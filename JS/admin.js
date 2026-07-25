// ============================================================
// ADMIN SCRIPT - لوحة التحكم الكاملة
// ============================================================

// ============================================================
// CONFIG
// ============================================================

const ADMIN_PASSWORD = 'QQZ#154p';

// ============================================================
// AUTH
// ============================================================

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
// DATA FUNCTIONS
// ============================================================

function getData(key, defaultVal = []) {
    try {
        const data = localStorage.getItem(key);
        if (data) {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : defaultVal;
        }
    } catch (e) {
        console.warn(`⚠️ Error reading ${key}`);
    }
    return defaultVal;
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// ============================================================
// DASHBOARD
// ============================================================

function updateDashboard() {
    const orders = getData('alwaha_orders');
    const products = getData('alwaha_products');
    const coupons = getData('alwaha_coupons');
    const users = getData('alwaha_users');
    const customers = getData('alwaha_customers');
    
    const totalRevenue = orders.reduce((sum, o) => sum + (o.discountedTotal || o.total || 0), 0);
    const offersCount = products.filter(p => p.offerPrice && p.offerPrice < p.price).length;
    const pendingOrders = orders.filter(o => o.status !== 'تم التسليم' && o.status !== 'ملغي').length;
    
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalRevenue').textContent = totalRevenue.toFixed(2) + ' ج.م';
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('totalProducts').textContent = products.length || 0;
    document.getElementById('totalOffers').textContent = offersCount || 0;
    document.getElementById('totalUsers').textContent = users.length || 0;
    
    document.getElementById('dashCount').textContent = orders.length;
    document.getElementById('ordersCount').textContent = orders.length;
    document.getElementById('pendingCount').textContent = pendingOrders;
    document.getElementById('productsCount').textContent = products.length;
    document.getElementById('offersCount').textContent = offersCount;
    document.getElementById('couponsCount').textContent = coupons.length;
    document.getElementById('usersCount').textContent = users.length;
    document.getElementById('customersCount').textContent = customers.length || 0;
    
    // Recent orders
    const recentOrders = orders.slice(0, 5);
    const tbody = document.getElementById('recentOrders');
    if (recentOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#666;">لا توجد طلبات</td></tr>';
    } else {
        tbody.innerHTML = recentOrders.map((o, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${o.customer || 'عميل'}</td>
                <td>${(o.discountedTotal || o.total || 0).toFixed(2)} ج.م</td>
                <td><span class="badge ${getStatusBadge(o.status || 'جديد')}">${o.status || 'جديد'}</span></td>
                <td>${o.dateAr || o.date || '--'}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="viewOrder(${orders.indexOf(o)})">عرض</button>
                    <button class="btn btn-success btn-sm" onclick="completeOrder(${orders.indexOf(o)})">تم</button>
                </td>
            </tr>
        `).join('');
    }
}

function getStatusBadge(status) {
    const map = {
        'جديد': 'badge-info',
        'قيد التجهيز': 'badge-warning',
        'تم التوصيل': 'badge-success',
        'تم التسليم': 'badge-success',
        'ملغي': 'badge-danger'
    };
    return map[status] || 'badge-info';
}

// ============================================================
// ORDERS
// ============================================================

function renderOrders(filter = 'all') {
    const orders = getData('alwaha_orders');
    const filtered = filter === 'all' ? orders : orders.filter(o => (o.status || 'جديد') === filter);
    const tbody = document.getElementById('allOrders');
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:#666;">لا توجد طلبات</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map((o, i) => {
        const orderIndex = orders.indexOf(o);
        return `
        <tr>
            <td>${i + 1}</td>
            <td>${o.customer || 'عميل'}</td>
            <td>${o.phone || '--'}</td>
            <td>${o.items ? o.items.length : 0} منتج</td>
            <td>${(o.total || 0).toFixed(2)} ج.م</td>
            <td>${(o.discountedTotal || o.total || 0).toFixed(2)} ج.م</td>
            <td>${o.coupon || '--'}</td>
            <td>
                <select onchange="updateOrderStatus(${orderIndex}, this.value)" style="padding:4px 8px;border-radius:30px;font-size:12px;background:rgba(255,255,255,0.02);color:#c8c8c8;border:1px solid rgba(212,175,55,0.05);">
                    <option value="جديد" ${(o.status || 'جديد') === 'جديد' ? 'selected' : ''}>جديد</option>
                    <option value="قيد التجهيز" ${o.status === 'قيد التجهيز' ? 'selected' : ''}>قيد التجهيز</option>
                    <option value="تم التوصيل" ${o.status === 'تم التوصيل' ? 'selected' : ''}>تم التوصيل</option>
                    <option value="تم التسليم" ${o.status === 'تم التسليم' ? 'selected' : ''}>تم التسليم</option>
                    <option value="ملغي" ${o.status === 'ملغي' ? 'selected' : ''}>ملغي</option>
                </select>
            </td>
            <td>${o.dateAr || o.date || '--'}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="viewOrder(${orderIndex})"><i class="fas fa-eye"></i></button>
                <button class="btn btn-success btn-sm" onclick="completeOrder(${orderIndex})"><i class="fas fa-check"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deleteOrder(${orderIndex})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `}).join('');
}

function completeOrder(index) {
    if (!confirm('هل أنت متأكد من إكمال هذا الطلب؟')) return;
    
    const orders = getData('alwaha_orders');
    if (!orders[index]) return;
    
    orders[index].status = 'تم التسليم';
    saveData('alwaha_orders', orders);
    
    const order = orders[index];
    if (order.user_id) {
        const users = getData('alwaha_users');
        const userIndex = users.findIndex(u => u.id === order.user_id);
        if (userIndex !== -1) {
            users[userIndex].referral_points = (users[userIndex].referral_points || 0) + 1;
            saveData('alwaha_users', users);
            
            if (typeof supabaseClient !== 'undefined') {
                supabaseClient
                    .from('users')
                    .update({ referral_points: users[userIndex].referral_points })
                    .eq('id', order.user_id)
                    .then(({ error }) => {
                        if (error) console.error('Error updating user points:', error);
                    });
            }
        }
    }
    
    renderOrders(document.getElementById('orderFilter')?.value || 'all');
    updateDashboard();
    showToast('✅ تم إكمال الطلب وإضافة النقاط', 'success');
}

function updateOrderStatus(index, status) {
    const orders = getData('alwaha_orders');
    if (orders[index]) {
        orders[index].status = status;
        saveData('alwaha_orders', orders);
        renderOrders(document.getElementById('orderFilter')?.value || 'all');
        updateDashboard();
        showToast('تم تحديث حالة الطلب', 'success');
    }
}

function deleteOrder(index) {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    const orders = getData('alwaha_orders');
    orders.splice(index, 1);
    saveData('alwaha_orders', orders);
    renderOrders(document.getElementById('orderFilter')?.value || 'all');
    updateDashboard();
    showToast('تم حذف الطلب', 'success');
}

function viewOrder(index) {
    const orders = getData('alwaha_orders');
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
            ${order.items ? order.items.map(item => 
                `<li>${item.emoji || '📦'} ${item.name || 'منتج'} - ${item.weight || 0} كجم - ${(item.total || 0).toFixed(2)} ج.م</li>`
            ).join('') : 'لا توجد منتجات'}
        </ul>
        <div style="margin-bottom:4px;"><strong>المجموع:</strong> ${(order.total || 0).toFixed(2)} ج.م</div>
        ${order.discount ? `<div style="margin-bottom:4px;color:#27ae60;"><strong>الخصم:</strong> -${(order.discount || 0).toFixed(2)} ج.م</div>` : ''}
        ${order.coupon ? `<div style="margin-bottom:4px;"><strong>كوبون:</strong> ${order.coupon}</div>` : ''}
        <div style="margin-bottom:8px;font-weight:700;font-size:18px;color:var(--admin-gold);">
            <strong>الإجمالي بعد الخصم:</strong> ${(order.discountedTotal || order.total || 0).toFixed(2)} ج.م
        </div>
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
    const orders = getData('alwaha_orders');
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
// PRODUCTS
// ============================================================

function renderProductsTable() {
    const products = getData('alwaha_products');
    const tbody = document.getElementById('productsList');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#666;">لا توجد منتجات</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map((p, i) => {
        const isOffer = p.offerPrice && p.offerPrice < p.price;
        return `
        <tr>
            <td>${i + 1}</td>
            <td>${p.emoji || '🍎'} ${p.name}</td>
            <td>${p.category || 'غير مصنف'}</td>
            <td>${p.price || 0} ج.م</td>
            <td>${isOffer ? '<span class="badge badge-success">عرض</span>' : '<span class="badge badge-info">عادي</span>'}</td>
            <td>${p.stock || 100}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editProduct(${i})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${i})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `}).join('');
}

function openAddProduct() {
    document.getElementById('productModalTitle').textContent = 'إضافة منتج جديد';
    document.getElementById('editProductId').value = '';
    document.getElementById('productForm').reset();
    document.getElementById('productModal').classList.add('open');
}

function editProduct(index) {
    const products = getData('alwaha_products');
    const p = products[index];
    if (!p) return;
    
    document.getElementById('productModalTitle').textContent = 'تعديل المنتج';
    document.getElementById('editProductId').value = index;
    document.getElementById('productName').value = p.name || '';
    document.getElementById('productPrice').value = p.price || '';
    document.getElementById('productCategory').value = p.category || 'فاكهة';
    document.getElementById('productEmoji').value = p.emoji || '🍎';
    document.getElementById('productDesc').value = p.description || p.desc || '';
    document.getElementById('productOfferPrice').value = p.offerPrice || '';
    document.getElementById('productOfferText').value = p.offerText || p.offer || '';
    document.getElementById('productStock').value = p.stock || 100;
    document.getElementById('productModal').classList.add('open');
}

function saveProduct(e) {
    e.preventDefault();
    const index = document.getElementById('editProductId').value;
    const products = getData('alwaha_products');
    
    const product = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        name: document.getElementById('productName').value.trim(),
        nameEn: document.getElementById('productName').value.trim(),
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        categoryEn: document.getElementById('productCategory').value === 'فاكهة' ? 'Fruits' : 'Vegetables',
        emoji: document.getElementById('productEmoji').value.trim() || '🍎',
        description: document.getElementById('productDesc').value.trim(),
        descEn: document.getElementById('productDesc').value.trim(),
        offerPrice: parseFloat(document.getElementById('productOfferPrice').value) || null,
        offerText: document.getElementById('productOfferText').value.trim() || null,
        stock: parseInt(document.getElementById('productStock').value) || 100,
        popular: 0,
        oldPrice: null,
        offer: document.getElementById('productOfferText').value.trim() || null
    };
    
    if (product.offerPrice) {
        product.oldPrice = product.price;
        product.price = product.offerPrice;
        product.offer = product.offerText || 'عرض خاص';
    }
    
    if (index === '') {
        products.push(product);
    } else {
        const idx = parseInt(index);
        product.id = products[idx].id || product.id;
        products[idx] = product;
    }
    
    saveData('alwaha_products', products);
    renderProductsTable();
    updateDashboard();
    closeModal('productModal');
    showToast('تم حفظ المنتج بنجاح', 'success');
}

function deleteProduct(index) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    const products = getData('alwaha_products');
    products.splice(index, 1);
    saveData('alwaha_products', products);
    renderProductsTable();
    updateDashboard();
    showToast('تم حذف المنتج', 'success');
}

function exportProducts() {
    const products = getData('alwaha_products');
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `products_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
}

// ============================================================
// OFFERS
// ============================================================

function renderOffersTable() {
    const products = getData('alwaha_products');
    const offers = products.filter(p => p.offerPrice && p.offerPrice < p.price);
    const tbody = document.getElementById('offersList');
    
    if (offers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#666;">لا توجد عروض</td></tr>';
        return;
    }
    
    tbody.innerHTML = offers.map((p, i) => {
        const idx = products.indexOf(p);
        return `
        <tr>
            <td>${p.emoji || '🍎'} ${p.name}</td>
            <td>${p.oldPrice || p.price || 0} ج.م</td>
            <td>${p.offerPrice || 0} ج.م</td>
            <td>${((p.oldPrice - p.offerPrice) / p.oldPrice * 100).toFixed(0)}%</td>
            <td><span class="badge badge-success">نشط</span></td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editProduct(${idx})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm" onclick="removeOffer(${idx})"><i class="fas fa-times"></i></button>
            </td>
        </tr>
    `}).join('');
}

function removeOffer(index) {
    if (!confirm('هل أنت متأكد من إزالة العرض؟')) return;
    const products = getData('alwaha_products');
    if (products[index]) {
        products[index].offerPrice = null;
        products[index].offerText = null;
        products[index].offer = null;
        if (products[index].oldPrice) {
            products[index].price = products[index].oldPrice;
            products[index].oldPrice = null;
        }
        saveData('alwaha_products', products);
        renderOffersTable();
        renderProductsTable();
        updateDashboard();
        showToast('تم إزالة العرض', 'success');
    }
}

function openAddOffer() {
    openAddProduct();
    document.getElementById('productOfferPrice').focus();
}

// ============================================================
// COUPONS
// ============================================================

function renderCouponsTable() {
    const coupons = getData('alwaha_coupons');
    const tbody = document.getElementById('couponsList');
    
    if (coupons.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#666;">لا توجد كوبونات</td></tr>';
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
                <button class="btn btn-primary btn-sm" onclick="editCoupon(${i})"><i class="fas fa-edit"></i></button>
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

function editCoupon(index) {
    const coupons = getData('alwaha_coupons');
    const c = coupons[index];
    if (!c) return;
    
    document.getElementById('couponModalTitle').textContent = 'تعديل الكوبون';
    document.getElementById('editCouponIndex').value = index;
    document.getElementById('couponCodeInput').value = c.code || '';
    document.getElementById('couponDiscount').value = c.discount || '';
    document.getElementById('couponType').value = c.type || 'percentage';
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
    
    const coupons = getData('alwaha_coupons');
    
    if (index === '') {
        if (coupons.find(c => c.code === code)) {
            alert('هذا الكود موجود بالفعل');
            return;
        }
        coupons.push({ code, discount, type, used: 0 });
    } else {
        const idx = parseInt(index);
        coupons[idx] = { code, discount, type, used: coupons[idx].used || 0 };
    }
    
    saveData('alwaha_coupons', coupons);
    renderCouponsTable();
    updateDashboard();
    closeModal('couponModal');
    showToast('تم حفظ الكوبون بنجاح', 'success');
}

function deleteCoupon(index) {
    if (!confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return;
    const coupons = getData('alwaha_coupons');
    coupons.splice(index, 1);
    saveData('alwaha_coupons', coupons);
    renderCouponsTable();
    updateDashboard();
    showToast('تم حذف الكوبون', 'success');
}

// ============================================================
// USERS
// ============================================================

function renderUsersTable() {
    const users = getData('alwaha_users');
    const tbody = document.getElementById('usersList');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#666;">لا توجد مستخدمين</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map((u, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${u.display_name || 'غير معروف'}</td>
            <td>${u.email || '--'}</td>
            <td>${u.phone || '--'}</td>
            <td>${u.created_at ? new Date(u.created_at).toLocaleDateString('ar-EG') : '--'}</td>
            <td>${u.referral_count || 0}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="viewUser(${i})"><i class="fas fa-eye"></i></button>
                <button class="btn btn-gold btn-sm" onclick="editUser(${i})"><i class="fas fa-edit"></i></button>
            </td>
        </tr>
    `).join('');
}

function viewUser(index) {
    const users = getData('alwaha_users');
    const user = users[index];
    if (!user) return;
    showToast(`👤 ${user.display_name || 'مستخدم'}\n📧 ${user.email || '--'}\n📱 ${user.phone || '--'}\n📍 ${user.address || '--'}\n⭐ نقاط: ${user.referral_points || 0}\n👥 إحالات: ${user.referral_count || 0}`, 'info');
}

function editUser(index) {
    const users = getData('alwaha_users');
    const user = users[index];
    if (!user) return;
    
    const newName = prompt('الاسم الكامل:', user.display_name || '');
    if (newName !== null) user.display_name = newName || user.display_name;
    
    const newPhone = prompt('رقم الجوال:', user.phone || '');
    if (newPhone !== null) user.phone = newPhone || '';
    
    const newAddress = prompt('العنوان:', user.address || '');
    if (newAddress !== null) user.address = newAddress || '';
    
    const newPoints = prompt('نقاط الإحالة:', user.referral_points || 0);
    if (newPoints !== null) user.referral_points = parseFloat(newPoints) || 0;
    
    users[index] = user;
    saveData('alwaha_users', users);
    renderUsersTable();
    showToast('تم تحديث بيانات المستخدم', 'success');
}

async function loadUsers() {
    try {
        if (typeof supabaseClient === 'undefined') {
            showToast('⚠️ Supabase غير متصل', 'error');
            return;
        }
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            saveData('alwaha_users', data);
            renderUsersTable();
            updateDashboard();
            showToast('تم جلب المستخدمين ✅', 'success');
        }
    } catch (error) {
        console.error('❌ Error loading users:', error);
        showToast('خطأ في جلب المستخدمين: ' + error.message, 'error');
    }
}

// ============================================================
// CUSTOMERS
// ============================================================

function renderCustomersTable() {
    const customers = getData('alwaha_customers');
    const tbody = document.getElementById('customersList');
    
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#666;">لا توجد عملاء</td></tr>';
        return;
    }
    
    tbody.innerHTML = customers.map((c, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${c.name || 'غير معروف'}</td>
            <td>${c.phone || '--'}</td>
            <td>${c.email || '--'}</td>
            <td>${c.ordersCount || 0}</td>
            <td>${(c.totalSpent || 0).toFixed(2)} ج.م</td>
            <td>${c.lastOrder ? new Date(c.lastOrder).toLocaleDateString('ar-EG') : '--'}</td>
            <td>${c.isActive ? '🟢 نشط' : '🔴 غير نشط'}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="viewCustomer(${i})"><i class="fas fa-eye"></i></button>
                <button class="btn btn-gold btn-sm" onclick="editCustomer(${i})"><i class="fas fa-edit"></i></button>
            </td>
        </tr>
    `).join('');
}

function viewCustomer(index) {
    const customers = getData('alwaha_customers');
    const customer = customers[index];
    if (!customer) return;
    
    const prefs = customer.preferences || {};
    showToast(`👤 ${customer.name || 'عميل'}\n📧 ${customer.email || '--'}\n📱 ${customer.phone || '--'}\n📍 ${customer.address || '--'}\n🛒 طلبات: ${customer.ordersCount || 0}\n💰 إجمالي: ${(customer.totalSpent || 0).toFixed(2)} ج.م\n⭐ المنتجات المفضلة: ${(prefs.favoriteProducts || []).join(', ') || '--'}`, 'info');
}

function editCustomer(index) {
    const customers = getData('alwaha_customers');
    const customer = customers[index];
    if (!customer) return;
    
    const newName = prompt('الاسم الكامل:', customer.name || '');
    if (newName !== null) customer.name = newName || customer.name;
    
    const newPhone = prompt('رقم الجوال:', customer.phone || '');
    if (newPhone !== null) customer.phone = newPhone || '';
    
    const newEmail = prompt('البريد الإلكتروني:', customer.email || '');
    if (newEmail !== null) customer.email = newEmail || '';
    
    const newAddress = prompt('العنوان:', customer.address || '');
    if (newAddress !== null) customer.address = newAddress || '';
    
    const isActive = confirm('هل العميل نشط؟ (OK = نشط، Cancel = غير نشط)');
    customer.isActive = isActive;
    
    customers[index] = customer;
    saveData('alwaha_customers', customers);
    renderCustomersTable();
    showToast('تم تحديث بيانات العميل', 'success');
}

async function loadCustomers() {
    try {
        const orders = getData('alwaha_orders');
        const customers = [];
        
        orders.forEach(o => {
            if (o.customer && o.phone) {
                const existing = customers.find(c => c.phone === o.phone);
                if (existing) {
                    existing.ordersCount = (existing.ordersCount || 0) + 1;
                    existing.totalSpent = (existing.totalSpent || 0) + (o.discountedTotal || o.total || 0);
                    if (o.date > existing.lastOrder) existing.lastOrder = o.date;
                } else {
                    customers.push({
                        id: 'CUST-' + Date.now().toString().slice(-6),
                        name: o.customer,
                        phone: o.phone,
                        email: '',
                        address: o.address || '',
                        ordersCount: 1,
                        totalSpent: o.discountedTotal || o.total || 0,
                        lastOrder: o.date || new Date().toISOString(),
                        joinedDate: o.date || new Date().toISOString(),
                        preferences: { favoriteProducts: [] },
                        isActive: true
                    });
                }
            }
        });
        
        customers.forEach(c => {
            const customerOrders = orders.filter(o => o.phone === c.phone);
            const productCounts = {};
            customerOrders.forEach(o => {
                if (o.items) {
                    o.items.forEach(item => {
                        productCounts[item.name] = (productCounts[item.name] || 0) + 1;
                    });
                }
            });
            const sorted = Object.entries(productCounts).sort((a, b) => b[1] - a[1]);
            c.preferences = c.preferences || {};
            c.preferences.favoriteProducts = sorted.slice(0, 3).map(item => item[0]);
        });
        
        saveData('alwaha_customers', customers);
        renderCustomersTable();
        updateDashboard();
        showToast('✅ تم تحديث بيانات العملاء', 'success');
    } catch (error) {
        console.error('❌ Error loading customers:', error);
        showToast('خطأ في تحديث بيانات العملاء', 'error');
    }
}

// ============================================================
// SETTINGS
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
    
    saveData('alwaha_settings', settings);
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
    } catch (e) {}
}

function resetSettings() {
    if (!confirm('هل أنت متأكد من استعادة الإعدادات الافتراضية؟')) return;
    localStorage.removeItem('alwaha_settings');
    loadSettings();
    showToast('تم استعادة الإعدادات الافتراضية', 'success');
}

function backupData() {
    const data = {
        products: getData('alwaha_products'),
        orders: getData('alwaha_orders'),
        coupons: getData('alwaha_coupons'),
        users: getData('alwaha_users'),
        customers: getData('alwaha_customers'),
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
// SYNC
// ============================================================

async function syncAllData() {
    const btn = document.getElementById('syncBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري المزامنة...';
    }
    
    const results = [];
    
    try {
        if (typeof supabaseClient === 'undefined') {
            showToast('⚠️ Supabase غير متصل', 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-sync"></i> مزامنة';
            }
            return;
        }
        
        // Sync Products
        try {
            const { data, error } = await supabaseClient.from('products').select('*');
            if (error) throw error;
            if (data && data.length > 0) {
                saveData('alwaha_products', data);
                results.push('✅ المنتجات');
            }
        } catch (e) {
            results.push('❌ المنتجات: ' + e.message);
        }
        
        // Sync Orders
        try {
            const { data, error } = await supabaseClient.from('orders').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            if (data) {
                saveData('alwaha_orders', data);
                results.push('✅ الطلبات');
            }
        } catch (e) {
            results.push('❌ الطلبات: ' + e.message);
        }
        
        // Sync Coupons
        try {
            const { data, error } = await supabaseClient.from('coupons').select('*');
            if (error) throw error;
            if (data && data.length > 0) {
                saveData('alwaha_coupons', data);
                results.push('✅ الكوبونات');
            }
        } catch (e) {
            results.push('❌ الكوبونات: ' + e.message);
        }
        
        // Sync Users
        try {
            const { data, error } = await supabaseClient.from('users').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            if (data) {
                saveData('alwaha_users', data);
                results.push('✅ المستخدمين');
            }
        } catch (e) {
            results.push('❌ المستخدمين: ' + e.message);
        }
        
        renderProductsTable();
        renderOrders(document.getElementById('orderFilter')?.value || 'all');
        renderCouponsTable();
        renderUsersTable();
        renderCustomersTable();
        updateDashboard();
        
        showToast('✅ تمت المزامنة:\n' + results.join('\n'), 'success');
    } catch (error) {
        console.error('❌ Sync error:', error);
        showToast('❌ حدث خطأ في المزامنة: ' + (error.message || 'غير معروف'), 'error');
    }
    
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sync"></i> مزامنة';
    }
}

// ============================================================
// MODALS
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
// TABS
// ============================================================

document.querySelectorAll('.menu-item[data-tab]').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
        this.classList.add('active');
        
        const tab = this.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.getElementById(`tab-${tab}`).classList.add('active');
        
        const titles = {
            'dashboard': 'لوحة التحكم',
            'orders': 'الطلبات',
            'products': 'المنتجات',
            'offers': 'العروض',
            'coupons': 'الكوبونات',
            'users': 'المستخدمين',
            'customers': 'العملاء',
            'settings': 'الإعدادات'
        };
        document.getElementById('pageTitle').textContent = titles[tab] || 'لوحة التحكم';
        
        if (tab === 'users') loadUsers();
        if (tab === 'customers') loadCustomers();
    });
});

// ============================================================
// TOAST
// ============================================================

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 20px; left: 20px; 
        background: ${type === 'success' ? '#1A5C3A' : type === 'error' ? '#dc3545' : '#17a2b8'}; 
        color: white; padding: 12px 24px; 
        border-radius: 12px; font-weight: 600; 
        box-shadow: 0 4px 20px rgba(0,0,0,0.15); 
        z-index: 9999; font-family: 'Tajawal', sans-serif;
        animation: slideInRight 0.3s ease;
        max-width: 90%;
        white-space: pre-line;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = '0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ============================================================
// INIT
// ============================================================

function initAdmin() {
    updateDashboard();
    renderOrders();
    renderProductsTable();
    renderOffersTable();
    renderCouponsTable();
    renderUsersTable();
    renderCustomersTable();
    loadSettings();
    
    setTimeout(() => syncAllData(), 1500);
}

// ============================================================
// EXPORTS
// ============================================================

window.login = login;
window.logout = logout;
window.openAddProduct = openAddProduct;
window.saveProduct = saveProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.exportProducts = exportProducts;
window.openAddOffer = openAddOffer;
window.removeOffer = removeOffer;
window.openAddCoupon = openAddCoupon;
window.editCoupon = editCoupon;
window.saveCoupon = saveCoupon;
window.deleteCoupon = deleteCoupon;
window.filterOrders = filterOrders;
window.updateOrderStatus = updateOrderStatus;
window.deleteOrder = deleteOrder;
window.viewOrder = viewOrder;
window.completeOrder = completeOrder;
window.exportOrders = exportOrders;
window.closeModal = closeModal;
window.saveSettings = saveSettings;
window.resetSettings = resetSettings;
window.backupData = backupData;
window.syncAllData = syncAllData;
window.loadUsers = loadUsers;
window.viewUser = viewUser;
window.editUser = editUser;
window.loadCustomers = loadCustomers;
window.viewCustomer = viewCustomer;
window.editCustomer = editCustomer;
window.renderCustomersTable = renderCustomersTable; 
