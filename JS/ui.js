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
        
        const userBtn = getElement('userBtn');
        if (userBtn) {
            userBtn.innerHTML = `
                <span class="user-avatar">${initial}</span>
                <span class="user-name-text">${name.length > 8 ? name.substring(0, 8) + '...' : name}</span>
                <span class="online-dot"></span>
            `;
            userBtn.className = 'user-btn';
            userBtn.onclick = () => this.toggleUserMenu();
        }
    },

    updateForGuestUser() {
        const userBtn = getElement('userBtn');
        if (userBtn) {
            userBtn.innerHTML = `
                <i class="fas fa-user"></i>
                <span class="user-name-text">${currentLang === 'en' ? 'Login' : 'تسجيل'}</span>
            `;
            userBtn.className = 'user-btn guest';
            userBtn.onclick = () => openAuthModal();
        }
        
        const dropdown = getElement('userDropdown');
        if (dropdown) dropdown.classList.remove('show');
    },

    // ============================================================
    // USER MENU
    // ============================================================
    
    toggleUserMenu() {
        const dropdown = getElement('userDropdown');
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
        const points = userData?.referral_points || 0;
        const referrals = userData?.referral_count || 0;
        
        const orders = getData('alwaha_orders');
        const userOrders = orders.filter(o => o.phone === phone || o.customer === name);
        const pendingOrders = userOrders.filter(o => o.status !== 'تم التسليم' && o.status !== 'ملغي');
        
        const dropdown = getElement('userDropdown');
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
                        <span class="stat-label">${currentLang === 'en' ? 'Orders' : 'الطلبات'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${points}</span>
                        <span class="stat-label">${currentLang === 'en' ? 'Points' : 'النقاط'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${referrals}</span>
                        <span class="stat-label">${currentLang === 'en' ? 'Referrals' : 'الإحالات'}</span>
                    </div>
                </div>
                ${pendingOrders.length > 0 ? `
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-pending">
                        <div class="pending-title">
                            <i class="fas fa-spinner fa-pulse"></i>
                            ${currentLang === 'en' ? 'Pending Orders' : 'طلبات قيد المعالجة'} (${pendingOrders.length})
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
                    <i class="fas fa-user"></i> ${currentLang === 'en' ? 'My Account' : 'حسابي'}
                </div>
                <div class="dropdown-item" onclick="UI.viewOrders()">
                    <i class="fas fa-shopping-bag"></i> ${currentLang === 'en' ? 'My Orders' : 'طلباتي'}
                </div>
                <div class="dropdown-item" onclick="Referral.shareStore()">
                    <i class="fas fa-share-alt"></i> ${currentLang === 'en' ? 'Share Store' : 'مشاركة المتجر'}
                </div>
                <div class="dropdown-item" onclick="Auth.logout()" style="color:#e74c3c;">
                    <i class="fas fa-sign-out-alt"></i> ${currentLang === 'en' ? 'Logout' : 'تسجيل الخروج'}
                </div>
            `;
        }
    },

    // ============================================================
    // PROFILE MODAL
    // ============================================================
    
    viewProfile() {
        if (!Auth.isLoggedIn()) {
            showToast(
                currentLang === 'en' ? 'Please login first' : 'يجب تسجيل الدخول أولاً',
                'error'
            );
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
        
        const orders = getData('alwaha_orders');
        const userOrders = orders.filter(o => o.phone === phone || o.customer === name);
        const pendingOrders = userOrders.filter(o => o.status !== 'تم التسليم' && o.status !== 'ملغي');
        
        const profileModal = getElement('profileModal');
        if (profileModal) {
            const avatar = getElement('profileAvatar');
            if (avatar) avatar.textContent = '👤';
            
            const nameEl = getElement('profileName');
            if (nameEl) nameEl.textContent = name;
            
            const emailEl = getElement('profileEmail');
            if (emailEl) emailEl.textContent = email;
            
            setValue('profileDisplayName', name);
            setValue('profilePhone', phone);
            setValue('profileAddress', address);
            setValue('profileShareLink', shareLink);
            
            const ordersEl = getElement('profileOrders');
            if (ordersEl) ordersEl.textContent = userOrders.length;
            
            const pointsEl = getElement('profilePoints');
            if (pointsEl) pointsEl.textContent = points;
            
            const referralsEl = getElement('profileReferrals');
            if (referralsEl) referralsEl.textContent = referrals;
            
            const pendingContainer = getElement('profilePendingOrders');
            if (pendingContainer) {
                if (pendingOrders.length > 0) {
                    pendingContainer.innerHTML = pendingOrders.map(o => `
                        <div class="pending-order-item">
                            <div class="pending-order-header">
                                <span>${currentLang === 'en' ? 'Order' : 'طلب'} #${o.id || '---'}</span>
                                <span class="status-badge ${o.status === 'جديد' ? 'status-new' : 'status-processing'}">
                                    ${o.status || 'جديد'}
                                </span>
                            </div>
                            <div class="order-progress">
                                <div class="progress-step ${o.status === 'جديد' ? 'active' : ''}">
                                    ${currentLang === 'en' ? 'New' : 'جديد'}
                                </div>
                                <div class="progress-line ${o.status === 'قيد التجهيز' ? 'active' : ''}"></div>
                                <div class="progress-step ${o.status === 'قيد التجهيز' ? 'active' : ''}">
                                    ${currentLang === 'en' ? 'Processing' : 'تجهيز'}
                                </div>
                                <div class="progress-line ${o.status === 'تم التوصيل' ? 'active' : ''}"></div>
                                <div class="progress-step ${o.status === 'تم التوصيل' ? 'active' : ''}">
                                    ${currentLang === 'en' ? 'Delivering' : 'توصيل'}
                                </div>
                            </div>
                        </div>
                    `).join('');
                } else {
                    pendingContainer.innerHTML = `
                        <div class="no-pending-orders">
                            <i class="fas fa-check-circle"></i>
                            ${currentLang === 'en' ? 'No pending orders' : 'لا توجد طلبات قيد المعالجة'}
                        </div>
                    `;
                }
            }
            
            profileModal.classList.add('open');
            document.body.style.overflow = 'hidden';
            
            const dropdown = getElement('userDropdown');
            if (dropdown) dropdown.classList.remove('show');
        }
    },

    // ============================================================
    // VIEW ORDERS
    // ============================================================
    
    viewOrders() {
        if (!Auth.isLoggedIn()) {
            showToast(
                currentLang === 'en' ? 'Please login first' : 'يجب تسجيل الدخول أولاً',
                'error'
            );
            openAuthModal();
            return;
        }
        
        const userData = Auth.getUserData();
        const phone = userData?.phone || '';
        const name = userData?.display_name || '';
        
        const orders = getData('alwaha_orders');
        const userOrders = orders.filter(o => o.phone === phone || o.customer === name);
        
        if (userOrders.length === 0) {
            showToast(
                currentLang === 'en' ? '📦 No orders yet' : '📦 لا توجد طلبات سابقة',
                'info'
            );
            return;
        }
        
        let message = `📦 ${currentLang === 'en' ? 'My Orders' : 'طلباتي السابقة'}\n`;
        message += `───────────────────\n`;
        userOrders.forEach((o, i) => {
            message += `${i+1}. ${o.dateAr || formatDate(o.date) || '--'}\n`;
            message += `   🛒 ${o.items ? o.items.length : 0} ${currentLang === 'en' ? 'products' : 'منتج'}\n`;
            message += `   💰 ${(o.discountedTotal || o.total || 0).toFixed(2)} ${currentLang === 'en' ? 'EGP' : 'ج.م'}\n`;
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
        if (!p) {
            showToast(
                currentLang === 'en' ? 'Product not found' : 'المنتج غير موجود',
                'error'
            );
            return;
        }
        
        const priceLabel = currentLang === 'en' ? 'EGP/kg' : 'ج.م / كجم';
        
        const emojiEl = getElement('modalEmoji');
        if (emojiEl) emojiEl.textContent = p.emoji;
        
        const nameEl = getElement('modalName');
        if (nameEl) nameEl.textContent = Products.getName(p);
        
        const priceEl = getElement('modalPrice');
        if (priceEl) {
            const price = Products.getPrice(p);
            let priceHtml = p.oldPrice && Products.hasOffer(p) ?
                `<span class="old-price">${p.oldPrice}</span> ${price} <small>${priceLabel}</small>` :
                `${price} <small>${priceLabel}</small>`;
            priceEl.innerHTML = priceHtml;
        }
        
        const descEl = getElement('modalDesc');
        if (descEl) descEl.textContent = Products.getDescription(p);
        
        const offerTag = getElement('modalOfferTag');
        if (offerTag) {
            if (Products.hasOffer(p)) {
                offerTag.style.display = 'inline-block';
                offerTag.textContent = `🏷️ ${p.offer || 'عرض'}`;
            } else {
                offerTag.style.display = 'none';
            }
        }
        
        const weightInput = getElement('modalWeight');
        if (weightInput) weightInput.value = 1;
        
        const sharePopup = getElement('sharePopup');
        if (sharePopup) sharePopup.classList.remove('show');
        
        const modal = getElement('productModal');
        if (modal) {
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
        
        // حفظ المنتج الحالي للمشاركة
        window._shareProductData = p;
        window._modalProductId = p.id;
    },

    closeProductModal() {
        const modal = getElement('productModal');
        if (modal) modal.classList.remove('open');
        document.body.style.overflow = '';
        
        const sharePopup = getElement('sharePopup');
        if (sharePopup) sharePopup.classList.remove('show');
    },

    changeModalWeight(delta) {
        const input = getElement('modalWeight');
        if (!input) return;
        let val = parseFloat(input.value) || 1;
        val = Math.max(0.25, Math.round((val + delta) * 100) / 100);
        input.value = val;
    },

    toggleSharePopup() {
        const popup = getElement('sharePopup');
        if (popup) popup.classList.toggle('show');
    },

    // ============================================================
    // SHARE PRODUCT
    // ============================================================
    
    shareProduct(platform) {
        const p = window._shareProductData;
        if (!p) {
            showToast(
                currentLang === 'en' ? 'Product not found' : 'المنتج غير موجود',
                'error'
            );
            return;
        }
        
        const shopPhone = '01229156909';
        const shopName = currentLang === 'en' ? 'Al-Waha' : 'الواحة';
        const siteUrl = window.location.origin + window.location.pathname;
        const price = Products.getPrice(p);
        
        let priceText = `${price} ${currentLang === 'en' ? 'EGP/kg' : 'ج.م/كجم'}`;
        if (p.oldPrice && Products.hasOffer(p)) {
            priceText = `${p.oldPrice} → ${price} ${currentLang === 'en' ? 'EGP/kg' : 'ج.م/كجم'}`;
        }
        
        let message = `🍎 ${currentLang === 'en' ? 'Great product from' : 'منتج رائع من متجر'} ${shopName}!\n\n`;
        message += `📦 ${currentLang === 'en' ? 'Product' : 'المنتج'}: ${p.emoji} ${Products.getName(p)}\n`;
        message += `💰 ${currentLang === 'en' ? 'Price' : 'السعر'}: ${priceText}\n`;
        message += `📝 ${currentLang === 'en' ? 'Description' : 'الوصف'}: ${Products.getDescription(p)}\n\n`;
        if (Products.hasOffer(p)) {
            message += `🏷️ ${currentLang === 'en' ? 'Offer' : 'عرض'}: ${p.offer || 'عرض خاص'}\n\n`;
        }
        message += `🛒 ${currentLang === 'en' ? 'Order now from' : 'اطلبه الآن من متجر'} ${shopName}: ${siteUrl}\n`;
        message += `📱 ${currentLang === 'en' ? 'Contact for orders' : 'تواصل للطلبات والاستفسار'}: ${shopPhone}`;

        if (platform === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        } else if (platform === 'copy') {
            navigator.clipboard.writeText(message).then(() => {
                showToast(
                    currentLang === 'en' ? 'Copied!' : 'تم النسخ!',
                    'success',
                    '📋'
                );
            }).catch(() => {
                const ta = document.createElement('textarea');
                ta.value = message;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                showToast(
                    currentLang === 'en' ? 'Copied!' : 'تم النسخ!',
                    'success',
                    '📋'
                );
            });
            
            const popup = getElement('sharePopup');
            if (popup) popup.classList.remove('show');
        }
    }
};

// ============================================================
// EXPORT
// ============================================================

window.UI = UI;

console.log('✅ UI module loaded'); 
