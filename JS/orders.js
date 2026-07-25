// ============================================================
// ORDERS MODULE - إدارة الطلبات
// ============================================================

const Orders = {
    // ============================================================
    // OPEN CHECKOUT
    // ============================================================
    
    openCheckout() {
        if (Cart.getItems().length === 0) {
            showToast(`${currentLang === 'en' ? 'Cart is empty!' : 'سلتك فارغة!'}`, 'error', '⚠️');
            return;
        }

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
            const itemTotal = item.price * totalWeight;
            total += itemTotal;
            const productName = currentLang === 'en' ? item.nameEn : item.name;
            
            let priceDisplay = `${itemTotal.toFixed(2)} ${currency}`;
            if (item.oldPrice) {
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
        if (appliedCoupon) {
            summaryHtml += `
                <div class="cs-item" style="color:#27ae60;border-top:1px dashed #27ae60;padding-top:4px;margin-top:4px;">
                    <span>💰 خصم ${appliedCoupon.type === 'percentage' ? appliedCoupon.discount + '%' : appliedCoupon.discount + ' ج.م'}</span>
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
        
        document.getElementById('checkoutSummary').innerHTML = summaryHtml;

        const savedPhone = localStorage.getItem('alwaha_phone');
        const savedName = localStorage.getItem('alwaha_name');
        const savedAddress = localStorage.getItem('alwaha_address');
        
        if (savedPhone) document.getElementById('custPhone').value = savedPhone;
        if (savedName) document.getElementById('custName').value = savedName;
        if (savedAddress) document.getElementById('custAddress').value = savedAddress;

        document.getElementById('checkoutModal').classList.add('open');
        document.getElementById('cartSidebar').classList.remove('open');
        document.getElementById('cartOverlay').classList.remove('active');
        document.body.style.overflow = 'hidden';
        
        this.validateForm();
        this.setMinDeliveryTime();
    },

    closeCheckout() {
        document.getElementById('checkoutModal').classList.remove('open');
        document.body.style.overflow = '';
        document.getElementById('cartSidebar').classList.add('open');
        document.getElementById('cartOverlay').classList.add('active');
    },

    // ============================================================
    // VALIDATE FORM
    // ============================================================
    
    validateForm() {
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
        const deliveryTime = document.getElementById('deliveryTime');
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
        if (!appliedCoupon) return total;
        if (appliedCoupon.type === 'percentage') {
            return total - (total * appliedCoupon.discount / 100);
        } else {
            return Math.max(0, total - appliedCoupon.discount);
        }
    },

    applyCoupon() {
        const input = document.getElementById('couponCode');
        const msg = document.getElementById('couponMessage');
        if (!input || !msg) return;
        
        const code = input.value.trim().toUpperCase();
        const coupons = JSON.parse(localStorage.getItem('alwaha_coupons') || '[]');

        if (!code) {
            msg.textContent = '⚠️ الرجاء إدخال كود الخصم';
            msg.style.color = '#e74c3c';
            return;
        }

        const found = coupons.find(c => c.code === code);
        if (found) {
            appliedCoupon = found;
            msg.textContent = `✅ تم تطبيق كود "${code}" بنجاح! خصم ${found.discount}${found.type === 'percentage' ? '%' : ' ج.م'}`;
            msg.style.color = '#27ae60';
            input.style.borderColor = '#27ae60';
            this.updateCheckoutTotal();
        } else {
            appliedCoupon = null;
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

        const name = document.getElementById('custName')?.value?.trim() || 'عميل';
        const countryCode = document.getElementById('countryCode')?.value || '20';
        let phoneInput = document.getElementById('custPhone')?.value?.trim() || '';
        const address = document.getElementById('custAddress')?.value?.trim() || 'لم يحدد';
        const notes = document.getElementById('custNotes')?.value?.trim() || '';
        const paymentRadio = document.querySelector('input[name="payment"]:checked');
        const payment = paymentRadio ? paymentRadio.value : 'كاش عند التوصيل';
        const deliveryRadio = document.querySelector('input[name="delivery"]:checked');
        const delivery = deliveryRadio ? deliveryRadio.value : 'اسرع وقت';
        const deliveryTime = document.getElementById('deliveryTime')?.value || '';

        if (!phoneInput) {
            showToast('أدخل رقم الجوال', 'error');
            document.getElementById('custPhone')?.focus();
            return;
        }

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
                price: item.price,
                oldPrice: item.oldPrice,
                total: item.price * item.weight * item.qty
            })),
            total: total,
            discountedTotal: discountedTotal,
            coupon: appliedCoupon?.code || null,
            payment: payment,
            delivery: delivery,
            deliveryTime: deliveryTime,
            notes: notes,
            status: 'جديد',
            date: new Date().toISOString(),
            dateAr: new Date().toLocaleDateString('ar-EG', { 
                year: 'numeric', month: 'long', day: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
            })
        };

        try {
            // Save to Supabase
            const user = Auth.getUser();
            if (typeof supabaseClient !== 'undefined' && user) {
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
            
            // Save to localStorage
            let orders = JSON.parse(localStorage.getItem('alwaha_orders') || '[]');
            orders.unshift({ ...orderData, id: 'ORD-' + Date.now().toString().slice(-8) });
            localStorage.setItem('alwaha_orders', JSON.stringify(orders));

            // Handle referral
            await Referral.handleReferral(orderData);

            // Build WhatsApp message
            const shopNumber = '201229156909';
            const msg = this.buildWhatsAppMessage(orderData);
            const whatsappUrl = `https://wa.me/${shopNumber}?text=${encodeURIComponent(msg)}`;
            
            // Clear cart
            Cart.clear();
            appliedCoupon = null;
            document.getElementById('couponCode').value = '';
            document.getElementById('couponMessage').textContent = '';
            
            document.getElementById('checkoutModal').classList.remove('open');
            document.body.style.overflow = '';
            
            showToast('تم تأكيد طلبك! 🎉', 'success');
            setTimeout(() => { window.open(whatsappUrl, '_blank'); }, 600);
            
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
            const formattedTime = new Date(order.deliveryTime).toLocaleString(
                currentLang === 'en' ? 'en-US' : 'ar-EG'
            );
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
