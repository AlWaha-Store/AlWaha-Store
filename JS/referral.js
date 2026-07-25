// ============================================================
// REFERRAL MODULE - نظام الإحالات
// ============================================================

const Referral = {
    // ============================================================
    // SHARE STORE
    // ============================================================
    
    shareStore() {
        const user = Auth.getUser();
        
        if (!user) {
            showToast('⚠️ يجب تسجيل الدخول أولاً للمشاركة', 'error');
            openAuthModal();
            return;
        }
        
        const shopName = currentLang === 'en' ? 'Al-Waha' : 'الواحة';
        const siteUrl = window.location.origin + window.location.pathname;
        const referralLink = `${siteUrl}?ref=${user.id}`;
        
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
    },

    // ============================================================
    // SHARE PROFILE LINK
    // ============================================================
    
    copyShareLink() {
        const linkInput = document.getElementById('profileShareLink');
        if (linkInput) {
            navigator.clipboard.writeText(linkInput.value).then(() => {
                showToast('✅ تم نسخ الرابط', 'success');
            }).catch(() => {
                linkInput.select();
                document.execCommand('copy');
                showToast('✅ تم نسخ الرابط', 'success');
            });
        }
    },

    // ============================================================
    // HANDLE REFERRAL
    // ============================================================
    
    async handleReferral(orderData) {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const referrerId = urlParams.get('ref');
            
            if (!referrerId) return;
            if (!Auth.isLoggedIn()) return;
            
            const user = Auth.getUser();
            if (referrerId === user.id) return;
            
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
                    
                    console.log(`✅ Referral point added for ${referrerId}`);
                    showToast('🎉 تم إضافة نقطة إحالة للمستخدم الذي دعاك!', 'success');
                }
            }
        } catch (error) {
            console.error('❌ Error handling referral:', error);
        }
    }
};

// ============================================================
// EXPORT
// ============================================================

window.Referral = Referral; 
