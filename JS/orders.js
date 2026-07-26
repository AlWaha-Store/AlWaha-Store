// ============================================================
// ORDERS MODULE - إدارة الطلبات
// ============================================================

const Orders = {
    // ============================================================
    // OPEN CHECKOUT
    // ============================================================
    
    openCheckout() {
        if (Cart.getItems().length === 0) {
            showToast(
                currentLang === 'en' ? 'Cart is empty!' : 'سلتك فارغة!',
                'error',
                '⚠️'
            );
            return;
        }

        // تجميع المنتجات
        const grouped = {};
        Cart.getItems().forEach(item => {
            const key = `${item.id}`;
            if (grouped[key]) {
                grouped[key].qty += item.qty;
                grouped[key].weight = (grouped[key].weight * (grouped[key].qty - item.qty) + item.weight * item.qty) / grouped[key].qty;
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
            const price = item.offerPrice || item.price;
            const itemTotal = price * totalWeight;
            total += itemTotal;
            const productName = currentLang === 'en' ? item.nameEn : item.name;
            
            let priceDisplay = `${itemTotal.toFixed(2)} ${currency}`;
            if (item.oldPrice && item.offerPrice) {
                const oldTotal = item.oldPrice * totalWeight;
                priceDisplay = `
                    <span style="text-decoration:line-through;color:#999;">
                        ${oldTotal.toFixed(2)}
                    </span> ${itemTotal.toFixed(2)} ${currency}
                `;
            }
            summaryHtml += `
                <div class="cs-item">
                    <span>${item.emoji} ${productName} (${totalWeight.toFixed(2)} ${kgLabel})</span>
                    <span>${priceDisplay}</span>
                </div>
            `;
        });
        
        const discountedTotal = this.getDiscountedTotal(total);
        if (window.appliedCoupon) {
            const coupon = window.appliedCoupon;
            summaryHtml += `
                <div class="cs-item" style="color:#27ae60;border-top:1px dashed #27ae60;padding-top:4px;margin-top:4px;">
                    <span>💰 ${currentLang === 'en' ? 'Discount' : 'خصم'} ${coupon.type === 'percentage' ? coupon.discount + '%' : coupon.discount + ' ' + currency}</span>
                    <span>- ${(total - discountedTotal).toFixed(2)} ${currency}</span>
                </div>
            `;
        }
        summaryHtml += `
            <div class="cs-total">
                <span>${currentLang === 'en' ? 'Total' : 'الإجمالي'}</span>
                <span>${discountedTotal.toFixed(2)} ${currency}</span>
            </div>
            <div class="cs-total-note">
                ${currentLang === 'en' ? '* Total without delivery fee' : '* الإجمالي بدون قيمة التوصيل'}
            </div>
        `;
        
        const summaryEl = getElement('checkoutSummary');
        if (summaryEl) summaryEl.innerHTML = summaryHtml;

        // تحميل البيانات المحفوظة
        const savedPhone = localStorage.getItem('alwaha_phone');
        const savedName = localStorage.getItem('alwaha_name');
        const savedAddress = localStorage.getItem('alwaha_address');
        
        if (savedPhone) setValue('custPhone', savedPhone);
        if (savedName) setValue('custName', savedName);
        if (savedAddress) setValue('custAddress', savedAddress);

        // فتح النافذة
        const modal = getElement('checkoutModal');
        if (modal) modal.classList.add('open');
        
        const sidebar = getElement('cartSidebar');
        if (sidebar) sidebar.classList.remove('open');
        
        const overlay = getElement('cartOverlay');
        if (overlay) overlay.classList.remove('active');
        
        document.body.style.overflow = 'hidden';
        
        this.validateForm();
        this.setMinDeliveryTime();
    },

    closeCheckout() {
        const modal = getElement('checkoutModal');
        if (modal) modal.classList.remove('open');
        document.body.style.overflow = '';
    },

    // ============================================================
    // VALIDATE FORM
    // ============================================================
    
    validateForm() {
        const nameVal = getValue('custName').trim();
        const phoneVal = getValue('custPhone').trim();
        const addressVal = getValue('custAddress').trim();
        const confirmBtn = getElement('btnConfirmOrder');

        const deliveryRadio = document.querySelector('input[name="delivery"]:checked');
        const deliveryType = deliveryRadio ? deliveryRadio.value : 'اسرع وقت';
        const deliveryTimeInput = getElement('deliveryTime');
        
        let isDeliveryTimeValid = true;
        if (deliveryType === 'وقت محدد') {
            isDeliveryTimeValid = deliveryTimeInput && deliveryTimeInput.value !== '';
        }

        const paymentRadio = document.querySelector('input[name="payment"]:checked');
        const isPaymentSelected = paymentRadio !== null;

        if (confirmBtn) {
            if (nameVal.length >= 3 && phoneVal.length >= 7 && addressVal.length >= 10 && 
                isDeliveryTimeValid && isPaymentSelected) {
                confirmBtn.removeAttribute('disabled');
            } else {
                confirmBtn.setAttribute('disabled', 'true');
            }
        }
    },

    // ============================================================
    // SET MIN DELIVERY TIME
    // ============================================================
    
    setMinDeliveryTime() {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30);
        const isoString = now.toISOString().slice(0, 16);
        const deliveryTime = getElement('deliveryTime');
        if (deliveryTime) {
            deliveryTime.min = isoString;
            const deliveryRadio = document.querySelector('input[name="delivery"]:checked');
            if (deliveryRadio && deliveryRadio.value === 'وقت محدد') {
                deliveryTime.value = isoString;
            }
        }
    },

    // ============================================================
    // COUPONS
    // ============================================================
    
    getDiscountedTotal(total) {
        if (!window.appliedCoupon) return total;
        const coupon = window.appliedCoupon;
        if (coupon.type === 'percentage') {
            return total - (total * coupon.discount / 100);
        } else {
            return Math.max(0, total - coupon.discount);
        }
    },

    applyCoupon() {
        const input = getElement('couponCode');
        const msg = getElement('couponMessage');
        if (!input || !msg) return;
        
        const code = input.value.trim().toUpperCase();
        const coupons = getData('alwaha_coupons');

        if (!code) {
            msg.textContent = '⚠️ الرجاء إدخال كود الخصم';
            msg.style.color = '#e74c3c';
            return;
        }

        const found = coupons.find(c => c.code === code);
        if (found) {
            window.appliedCoupon = found;
            msg.textContent = `✅ تم تطبيق كود "${code}" بنجاح! خصم ${found.discount}${found.type === 'percentage' ? '%' : ' ج.م'}`;
            msg.style.color = '#27ae60';
            input.style.borderColor = '#27ae60';
            this.updateCheckoutTotal();
        } else {
            window.appliedCoupon = null;
            msg.textContent = '❌ كود غير صحيح أو منتهي الصلاحية';
            msg.style.color = '#e74c3c';
            input.style.borderColor = '#e74c3c';
            this.updateCheckoutTotal();
        }
    },

    updateCheckoutTotal() {
        let total = Cart.getTotal();
        const discountedTotal = this.getDiscountedTotal(total);
        const currency = currentLang === 'en' ? 'EGP' : 'ج.م';
        const totalSpan = document.querySelector('.cs-total span:last-child');
        if (totalSpan) {
            totalSpan.textContent = discountedTotal.toFixed(2) + ' ' + currency;
        }
    },

    // ============================================================
    // CONFIRM ORDER
    // ============================================================
    
    async confirmOrder() {
        if (Cart.getItems().length === 0) {
            showToast('سلتك فارغة!', 'error');
            return;
        }

        const name = getValue('custName').trim() || 'عميل';
        const countryCode = getValue('countryCode') || '20';
        let phoneInput = getValue('custPhone').trim();
        const address = getValue('custAddress').trim() || 'لم يحدد';
        const notes = getValue('custNotes').trim() || '';
        
        const paymentRadio = document.querySelector('input[name="payment"]:checked');
        const payment = paymentRadio ? paymentRadio.value : 'كاش عند التوصيل';
        
        const deliveryRadio = document.querySelector('input[name="delivery"]:checked');
        const delivery = deliveryRadio ? deliveryRadio.value : 'اسرع وقت';
        const deliveryTime = getValue('deliveryTime');

        if (!phoneInput) {
            showToast('أدخل رقم الجوال', 'error');
            const phoneEl = getElement('custPhone');
            if (phoneEl) phoneEl.focus();
            return;
        }

        // تنظيف رقم الهاتف
        let cleanPhone = phoneInput.replace(/[\s\-\(\)]/g, '');
        let fullPhone = cleanPhone.startsWith('0') ? countryCode + cleanPhone.substring(1) : countryCode + cleanPhone;

        const items = Cart.getItems();
        let total = Cart.getTotal();
        const discountedTotal = this.getDiscountedTotal(total);

        const orderData = {
            customer: name,
            phone: fullPhone,
            address: address,
            items: items.map(item => ({
                name: item.name,
                nameEn: item.nameEn,
                emoji: item.emoji,
                weight: item.weight * item.qty,
                price: item.offerPrice || item.price,
                oldPrice: item.oldPrice,
                total: (item.offerPrice || item.price) * item.weight * item.qty
            })),
            total: total,
            discountedTotal: discountedTotal,
            coupon: window.appliedCoupon?.code || null,
            payment: payment,
            delivery: delivery,
            deliveryTime: deliveryTime || null,
            notes: notes,
            status: 'جديد',
            date: new Date().toISOString(),
            dateAr: formatDate(new Date())
        };

        try {
            // حفظ في Supabase
            const user = Auth.getUser();
            if (isSupabaseAvailable() && user) {
                const { error } = await supabaseClient
                    .from('orders')
                    .insert([{
                        user_id: user.id,
                        customer: orderData.customer,
                        phone: orderData.phone,
                        address: orderData.address,
                        items: orderData.items,
                        total: orderData.total,
                        discounted_total: orderData.discountedTotal,
                        coupon_code: orderData.coupon,
                        payment_method: orderData.payment,
                        delivery_type: orderData.delivery,
                        delivery_time: orderData.deliveryTime || null,
                        notes: orderData.notes,
                        status: orderData.status,
                        created_at: orderData.date
                    }]);
                if (error) throw error;
            }
            
            // حفظ في localStorage
            let orders = getData('alwaha_orders');
            const newOrder = {
                ...orderData,
                id: 'ORD-' + Date.now().toString().slice(-8)
            };
            orders.unshift(newOrder);
            saveData('alwaha_orders', orders);

            // معالجة الإحالة
            await Referral.handleReferral(orderData);

            // بناء رسالة واتساب
            const shopNumber = '201229156909';
            const msg = this.buildWhatsAppMessage(orderData);
            const whatsappUrl = `https://wa.me/${shopNumber}?text=${encodeURIComponent(msg)}`;
            
            // مسح السلة
            Cart.clear();
            window.appliedCoupon = null;
            setValue('couponCode', '');
            const couponMsg = getElement('couponMessage');
            if (couponMsg) couponMsg.textContent = '';
            
            this.closeCheckout();
            
            showToast('تم تأكيد طلبك! 🎉', 'success');
            setTimeout(() => {
                window.open(whatsappUrl, '_blank');
            }, 600);
            
        } catch (error) {
            console.error('❌ Error saving order:', error);
            showToast('حدث خطأ في حفظ الطلب', 'error');
        }
    },

    // ============================================================
    // BUILD WHATSAPP MESSAGE
    // ============================================================
    
    buildWhatsAppMessage(order) {
        const shopName = currentLang === 'en' ? 'Al-Waha' : 'الواحة';
        const currency = currentLang === 'en' ? 'EGP' : 'ج.م';
        const kgLabel = currentLang === 'en' ? 'kg' : 'كجم';
        const siteUrl = window.location.origin + window.location.pathname;
        
        let msg = `🌿 *طلب جديد من متجر ${shopName}* 🛒\n`;
        msg += `───────────────────\n`;
        msg += `🛍 *المنتجات المطلوبة:*\n`;
        order.items.forEach(item => {
            msg += `• ${item.emoji} *${item.name}*: ${item.weight.toFixed(2)} ${kgLabel} - ${item.total.toFixed(2)} ${currency}\n`;
        });
        msg += `───────────────────\n`;
        msg += `💰 *الإجمالي:* ${order.total.toFixed(2)} ${currency}\n`;
        if (order.coupon) {
            msg += `💸 *الخصم:* -${(order.total - order.discountedTotal).toFixed(2)} ${currency}\n`;
            msg += `🛒 *الإجمالي بعد الخصم:* ${order.discountedTotal.toFixed(2)} ${currency}\n`;
        }
        msg += `───────────────────\n`;
        msg += `👤 *معلومات العميل:*\n`;
        msg += `• *الاسم:* ${order.customer}\n`;
        msg += `• *الجوال:* +${order.phone}\n`;
        msg += `📍 *العنوان:* ${order.address}\n`;
        if (order.notes) msg += `📝 *ملاحظات:* ${order.notes}\n`;
        msg += `───────────────────\n`;
        msg += `⏱️ *وقت التوصيل:* ${order.delivery}\n`;
        if (order.deliveryTime) {
            const formattedTime = formatDate(order.deliveryTime, currentLang);
            msg += `📅 *الميعاد:* ${formattedTime}\n`;
        }
        msg += `💳 *طريقة الدفع:* ${order.payment}\n`;
        if (order.payment.includes('إنستا') || order.payment.includes('Insta') || 
            order.payment.includes('محفظة') || order.payment.includes('Wallet')) {
            msg += `\n⚠️ *ملاحظة هامة للدفع الإلكتروني:*\n`;
            msg += `يرجى إرسال مبلغ الطلب إلى الرقم التالي:\n`;
            msg += `📞 *01005777923*\n`;
            msg += `مع ضرورة إرسال لقطة شاشة (Screenshot) للتحويل هنا لتأكيد الطلب وبدء الشحن.\n`;
        }
        msg += `───────────────────\n`;
        msg += `🌐 *رابط المتجر:* ${siteUrl}\n`;
        msg += `🌸 *نشكرك على اختيارك متجر الواحة - طازج وصحي دائماً!*`;
        
        return msg;
    }
};

// ============================================================
// EXPORT
// ============================================================

window.Orders = Orders;

console.log('✅ Orders module loaded'); 
