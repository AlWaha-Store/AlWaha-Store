// ============================================================
// UI MODULE - واجهة المستخدم
// ============================================================

const UI = {
    // ============================================================
    // UPDATE USER INTERFACE
    // ============================================================
    
    updateForLoggedInUser() {
        const userData = Auth.getUserData();
        const user = Auth.getUser();
        
        const name = userData?.display_name || user?.email?.split('@')[0] || 'مستخدم';
        const initial = (name || 'م')[0];
        
        const userBtn = document.getElementById('userBtn');
        if (userBtn) {
            userBtn.innerHTML = `
                <span class="user-avatar">${initial}</span>
                <span class="user-name-text">${name.length > 8 ? name.substring(0, 8) + '...' : name}</span>
                <span class="online-dot"></span>
            `;
            userBtn.className = 'user-btn logged-in';
            userBtn.onclick = () => this.toggleUserMenu();
        }
        
        const guestMenu = document.getElementById('guestMenu');
        const userMenu = document.getElementById('userMenu');
        
        if (guestMenu) guestMenu.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
    },

    updateForGuestUser() {
        const userBtn = document.getElementById('userBtn');
        if (userBtn) {
            userBtn.innerHTML = `
                <i class="fas fa-user"></i>
                <span class="user-name-text">تسجيل</span>
            `;
            userBtn.className = 'user-btn guest';
            userBtn.onclick = () => openAuthModal();
        }
        
        const guestMenu = document.getElementById('guestMenu');
        const userMenu = document.getElementById('userMenu');
        
        if (guestMenu) guestMenu.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    },

    // ============================================================
    // USER MENU
    // ============================================================
    
    toggleUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
            this.updateUserDropdown();
        }
    },

    updateUserDropdown() {
        const userData = Auth.getUserData();
        const user = Auth.getUser();
        
        const name = userData?.display_name || user?.email?.split('@')[0] || 'مستخدم';
        const email = user?.email || '--';
        const phone = userData?.phone || 'لم يحدد';
        const address = userData?.address || 'لم يحدد';
        const points = userData?.referral_points || 0;
        const referrals = userData?.referral_count || 0;
        
        const orders = JSON.parse(localStorage.getItem('alwaha_orders') || '[]');
        const userOrders = orders.filter(o => o.phone === phone || o.customer === name);
        const pendingOrders = userOrders.filter(o => o.status !== 'تم التسليم');
        
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.innerHTML = `
                <div class="dropdown-header">
                    <div class="dropdown-avatar">${(name || 'م')[0]}</div>
                    <div class="dropdown-info">
                        <div class="dropdown-name">${name}</div>
                        <div class="dropdown-email">${email}</div>
                    </div>
                </div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-stats">
                    <div class="stat-item">
                        <span class="stat-number">${userOrders.length}</span>
                        <span class="stat-label">الطلبات</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${points}</span>
                        <span class="stat-label">النقاط</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${referrals}</span>
                        <span class="stat-label">الإحالات</span>
                    </div>
                </div>
                ${pendingOrders.length > 0 ? `
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-pending">
                        <div class="pending-title">
                            <i class="fas fa-spinner fa-pulse"></i>
                            طلبات قيد المعالجة (${pendingOrders.length})
                        </div>
                        ${pendingOrders.map(o => `
                            <div class="pending-item">
                                <span>#${o.id || '---'}</span>
                                <span class="pending-status">${o.status || 'جديد'}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                <div class="dropdown-divider"></div>
                <div class="dropdown-item" onclick="UI.viewProfile()">
                    <i class="fas fa-user"></i> حسابي
                </div>
                <div class="dropdown-item" onclick="UI.viewOrders()">
                    <i class="fas fa-shopping-bag"></i> طلباتي
                </div>
                <div class="dropdown-item" onclick="Referral.shareStore()">
                    <i class="fas fa-share-alt"></i> مشاركة المتجر
                </div>
                <div class="dropdown-item" onclick="Auth.logout()" style="color:#e74c3c;">
                    <i class="fas fa-sign-out-alt"></i> تسجيل الخروج
                </div>
            `;
        }
    },

    // ============================================================
    // PROFILE MODAL
    // ============================================================
    
    viewProfile() {
        if (!Auth.isLoggedIn()) {
            showToast('يجب تسجيل الدخول أولاً', 'error');
            openAuthModal();
            return;
        }
        
        const userData = Auth.getUserData();
        const user = Auth.getUser();
        
        const name = userData?.display_name || user?.email?.split('@')[0] || 'مستخدم';
        const email = user?.email || '--';
        const phone = userData?.phone || '';
        const address = userData?.address || '';
        const points = userData?.referral_points || 0;
        const referrals = userData?.referral_count || 0;
        const shareLink = `${window.location.origin}${window.location.pathname}?ref=${user.id}`;
        
        const orders = JSON.parse(localStorage.getItem('alwaha_orders') || '[]');
        const userOrders = orders.filter(o => o.phone === phone || o.customer === name);
        
        const profileModal = document.getElementById('profileModal');
        if (profileModal) {
            document.getElementById('profileAvatar').textContent = '👤';
            document.getElementById('profileName').textContent = name;
            document.getElementById('profileEmail').textContent = email;
            document.getElementById('profileDisplayName').value = name;
            document.getElementById('profilePhone').value = phone;
            document.getElementById('profileAddress').value = address;
            document.getElementById('profileShareLink').value = shareLink;
            document.getElementById('profileOrders').textContent = userOrders.length;
            document.getElementById('profilePoints').textContent = points;
            document.getElementById('profileReferrals').textContent = referrals;
            
            // عرض الطلبات الحالية
            const pendingOrders = userOrders.filter(o => o.status !== 'تم التسليم');
            const pendingContainer = document.getElementById('profilePendingOrders');
            if (pendingContainer) {
                if (pendingOrders.length > 0) {
                    pendingContainer.innerHTML = pendingOrders.map(o => `
                        <div class="pending-order-item">
                            <div class="pending-order-header">
                                <span>طلب #${o.id || '---'}</span>
                                <span class="status-badge ${o.status === 'جديد' ? 'status-new' : 'status-processing'}">
                                    ${o.status || 'جديد'}
                                </span>
                            </div>
                            <div class="order-progress">
                                <div class="progress-step ${o.status === 'جديد' ? 'active' : ''}">جديد</div>
                                <div class="progress-line ${o.status === 'قيد التجهيز' ? 'active' : ''}"></div>
                                <div class="progress-step ${o.status === 'قيد التجهيز' ? 'active' : ''}">تجهيز</div>
                                <div class="progress-line ${o.status === 'تم التوصيل' ? 'active' : ''}"></div>
                                <div class="progress-step ${o.status === 'تم التوصيل' ? 'active' : ''}">توصيل</div>
                            </div>
                        </div>
                    `).join('');
                } else {
                    pendingContainer.innerHTML = `
                        <div class="no-pending-orders">
                            <i class="fas fa-check-circle"></i>
                            لا توجد طلبات قيد المعالجة
                        </div>
                    `;
                }
            }
            
            profileModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    },

    // ============================================================
    // VIEW ORDERS
    // ============================================================
    
    viewOrders() {
        if (!Auth.isLoggedIn()) {
            showToast('يجب تسجيل الدخول أولاً', 'error');
            openAuthModal();
            return;
        }
        
        const userData = Auth.getUserData();
        const phone = userData?.phone || '';
        const name = userData?.display_name || '';
        
        const orders = JSON.parse(localStorage.getItem('alwaha_orders') || '[]');
        const userOrders = orders.filter(o => o.phone === phone || o.customer === name);
        
        if (userOrders.length === 0) {
            showToast('📦 لا توجد طلبات سابقة', 'info');
            return;
        }
        
        let message = '📦 *طلباتي السابقة*\n';
        message += '───────────────────\n';
        userOrders.forEach((o, i) => {
            message += `${i+1}. ${o.dateAr || o.date || '--'}\n`;
            message += `   🛒 ${o.items ? o.items.length : 0} منتج\n`;
            message += `   💰 ${(o.discountedTotal || o.total || 0).toFixed(2)} ج.م\n`;
            message += `   📌 ${o.status || 'جديد'}\n`;
            message += `───────────────────\n`;
        });
        showToast(message, 'info');
    },

    // ============================================================
    // PRODUCT MODAL
    // ============================================================
    
    openProductModal(id) {
        const products = Products.getData();
        const p = products.find(item => item.id === id);
        if (!p) return;
        
        const priceLabel = currentLang === 'en' ? 'EGP/kg' : 'ج.م / كجم';
        
        document.getElementById('modalEmoji').textContent = p.emoji;
        document.getElementById('modalName').textContent = Products.getName(p);
        
        let priceHtml = p.oldPrice ?
            `<span class="old-price">${p.oldPrice}</span> ${p.price} <small>${priceLabel}</small>` :
            `${p.price} <small>${priceLabel}</small>`;
        document.getElementById('modalPrice').innerHTML = priceHtml;
        document.getElementById('modalDesc').textContent = Products.getDescription(p);
        
        const offerTag = document.getElementById('modalOfferTag');
        if (p.offer) {
            offerTag.style.display = 'inline-block';
            offerTag.textContent = `🏷️ ${p.offer}`;
        } else {
            offerTag.style.display = 'none';
        }
        
        document.getElementById('modalWeight').value = 1;
        document.getElementById('sharePopup')?.classList.remove('show');
        document.getElementById('productModal').classList.add('open');
        document.body.style.overflow = 'hidden';
        
        // حفظ المنتج الحالي للمشاركة
        window._shareProductData = p;
        window._modalProductId = p.id;
    },

    closeProductModal() {
        document.getElementById('productModal').classList.remove('open');
        document.body.style.overflow = '';
        document.getElementById('sharePopup')?.classList.remove('show');
    },

    // ============================================================
    // SHARE
    // ============================================================
    
    shareProduct(platform) {
        const p = window._shareProductData;
        if (!p) return;
        
        const shopPhone = '01229156909';
        const shopName = currentLang === 'en' ? 'Al-Waha' : 'الواحة';
        const siteUrl = window.location.origin + window.location.pathname;
        
        let priceText = `${p.price} ${currentLang === 'en' ? 'EGP/kg' : 'ج.م/كجم'}`;
        if (p.oldPrice) {
            priceText = `${p.oldPrice} → ${p.price} ${currentLang === 'en' ? 'EGP/kg' : 'ج.م/كجم'}`;
        }
        
        let message = `🍎 منتج رائع من متجر ${shopName}!\n\n`;
        message += `📦 المنتج: ${p.emoji} ${Products.getName(p)}\n`;
        message += `💰 السعر: ${priceText}\n`;
        message += `📝 الوصف: ${Products.getDescription(p)}\n\n`;
        if (p.offer) {
            message += `🏷️ عرض: ${p.offer}\n\n`;
        }
        message += `🛒 اطلبه الآن من متجر ${shopName} : ${siteUrl}\n`;
        message += `📱 تواصل للطلبات والاستفسار: ${shopPhone}`;

        if (platform === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        } else if (platform === 'copy') {
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
        }
    },

    toggleSharePopup() {
        document.getElementById('sharePopup')?.classList.toggle('show');
    }
};

// ============================================================
// EXPORT
// ============================================================

window.UI = UI; 
