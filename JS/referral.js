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
            showToast(
                currentLang === 'en' ? 'Please login first to share' : '⚠️ يجب تسجيل الدخول أولاً للمشاركة',
                'error'
            );
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
                showToast(
                    currentLang === 'en' ? '✅ Link copied! Share with friends' : '✅ تم نسخ رابط المشاركة! شاركه مع أصدقائك',
                    'success'
                );
            }).catch(() => {
                showToast(
                    `📋 ${currentLang === 'en' ? 'Share link:' : 'رابط المشاركة:'} ${referralLink}`,
                    'info'
                );
            });
        }
    },

    // ============================================================
    // SHARE PROFILE LINK
    // ============================================================
    
    copyShareLink() {
        const linkInput = getElement('profileShareLink');
        if (linkInput) {
            navigator.clipboard.writeText(linkInput.value).then(() => {
                showToast(
                    currentLang === 'en' ? '✅ Link copied!' : '✅ تم نسخ الرابط',
                    'success'
                );
            }).catch(() => {
                linkInput.select();
                document.execCommand('copy');
                showToast(
                    currentLang === 'en' ? '✅ Link copied!' : '✅ تم نسخ الرابط',
                    'success'
                );
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
            
            // التحقق من عدم وجود طلبات سابقة لنفس العميل
            const orders = getData('alwaha_orders');
            const userOrders = orders.filter(o => 
                o.phone === orderData.phone || 
                o.customer === orderData.customer
            );
            
            if (userOrders.length > 1) return;
            
            if (isSupabaseAvailable()) {
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
                    
                    // تحديث localStorage
                    let users = getData('alwaha_users');
                    const userIndex = users.findIndex(u => u.id === referrerId);
                    if (userIndex !== -1) {
                        users[userIndex].referral_points = newPoints;
                        users[userIndex].referral_count = newReferrals;
                        saveData('alwaha_users', users);
                    }
                    
                    console.log(`✅ Referral point added for ${referrerId}`);
                    showToast(
                        currentLang === 'en' ? '🎉 Referral point added!' : '🎉 تم إضافة نقطة إحالة!',
                        'success'
                    );
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

console.log('✅ Referral module loaded'); 
