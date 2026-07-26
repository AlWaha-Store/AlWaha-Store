// ============================================================
// CART MODULE - إدارة سلة التسوق
// ============================================================

const Cart = {
    items: [],
    STORAGE_KEY: 'alwaha_cart_v10',

    // ============================================================
    // LOAD & SAVE
    // ============================================================
    
    loadLocal() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    this.items = parsed;
                }
            }
        } catch (e) {
            console.warn('⚠️ Error loading cart:', e);
            this.items = [];
        }
    },

    saveLocal() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
        } catch (e) {
            console.warn('⚠️ Error saving cart:', e);
        }
        
        if (Auth.isLoggedIn()) {
            this.saveToSupabase();
        }
        
        this.updateUI();
        this.updateSideMenuCount();
    },

    // ============================================================
    // SUPABASE SYNC
    // ============================================================
    
    async saveToSupabase() {
        const user = Auth.getUser();
        if (!user || !isSupabaseAvailable()) return;
        
        try {
            // حذف السلة القديمة
            await supabaseClient
                .from('cart')
                .delete()
                .eq('user_id', user.id);
            
            if (this.items.length === 0) return;
            
            // إضافة العناصر الجديدة
            const cartItems = this.items.map(item => ({
                user_id: user.id,
                product_id: item.id,
                weight: item.weight || 1,
                qty: item.qty || 1
            }));
            
            const { error } = await supabaseClient.from('cart').insert(cartItems);
            if (error) throw error;
            
        } catch (error) {
            console.error('❌ Error saving cart to Supabase:', error);
        }
    },

    async syncFromSupabase() {
        const user = Auth.getUser();
        if (!user || !isSupabaseAvailable()) return;
        
        try {
            const { data, error } = await supabaseClient
                .from('cart')
                .select('*')
                .eq('user_id', user.id);
            
            if (error) throw error;
            
            if (data && data.length > 0) {
                const products = Products.getData();
                const cloudCart = data
                    .map(item => {
                        const p = products.find(pr => pr.id === item.product_id);
                        if (!p) return null;
                        return {
                            ...p,
                            weight: item.weight || 1,
                            qty: item.qty || 1
                        };
                    })
                    .filter(Boolean);
                
                if (cloudCart.length > 0) {
                    // دمج السلة المحلية مع السلة السحابية
                    const merged = [...cloudCart];
                    this.items.forEach(localItem => {
                        const existing = merged.find(c => c.id === localItem.id);
                        if (existing) {
                            existing.qty += localItem.qty;
                            existing.weight = (existing.weight + localItem.weight) / 2;
                        } else {
                            merged.push(localItem);
                        }
                    });
                    this.items = merged;
                    this.saveLocal();
                }
            }
        } catch (error) {
            console.error('❌ Error syncing cart from Supabase:', error);
        }
    },

    // ============================================================
    // ADD FROM MODAL
    // ============================================================
    
    addFromModal() {
        const productId = window._modalProductId;
        const weightInput = getElement('modalWeight');
        const weight = weightInput ? parseFloat(weightInput.value) || 1 : 1;
        
        if (!productId) {
            showToast('⚠️ حدث خطأ، حاول مرة أخرى', 'error');
            return;
        }
        
        const products = Products.getData();
        const p = products.find(item => item.id === productId);
        if (!p) {
            showToast('⚠️ المنتج غير موجود', 'error');
            return;
        }
        
        this.add(p.id, weight);
        
        const productName = currentLang === 'en' ? p.nameEn : p.name;
        const kgLabel = currentLang === 'en' ? 'kg' : 'كجم';
        showToast(
            `${currentLang === 'en' ? 'Added' : 'تم إضافة'} ${weight.toFixed(2)} ${kgLabel} ${productName}`,
            'success',
            '🛒'
        );

        const btn = getElement('modalAddBtn');
        if (btn) {
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
    },

    // ============================================================
    // ADD / REMOVE / UPDATE
    // ============================================================
    
    add(productId, weight = 1) {
        const products = Products.getData();
        const p = products.find(item => item.id === productId);
        if (!p) return false;
        
        const existingIndex = this.items.findIndex(item => item.id === p.id);
        
        if (existingIndex !== -1) {
            const existingItem = this.items[existingIndex];
            const totalWeight = (existingItem.weight * existingItem.qty) + weight;
            existingItem.weight = totalWeight / (existingItem.qty + 1);
            existingItem.qty += 1;
        } else {
            this.items.push({
                id: p.id,
                name: p.name,
                nameEn: p.nameEn,
                emoji: p.emoji,
                price: p.price,
                offerPrice: p.offerPrice || null,
                oldPrice: p.oldPrice || null,
                weight: weight,
                qty: 1
            });
        }
        
        this.saveLocal();
        return true;
    },

    changeQty(productId, delta) {
        const idx = this.items.findIndex(i => i.id === parseInt(productId));
        if (idx === -1) return;
        
        this.items[idx].qty += delta;
        
        if (this.items[idx].qty <= 0) {
            const name = currentLang === 'en' ? this.items[idx].nameEn : this.items[idx].name;
            this.items.splice(idx, 1);
            showToast(
                `${currentLang === 'en' ? 'Removed' : 'تم حذف'} ${name}`,
                'error',
                '🗑️'
            );
        } else {
            const name = currentLang === 'en' ? this.items[idx].nameEn : this.items[idx].name;
            const totalWeight = this.items[idx].weight * this.items[idx].qty;
            const kgLabel = currentLang === 'en' ? 'kg' : 'كجم';
            showToast(
                `${name}: ${totalWeight.toFixed(2)} ${kgLabel}`,
                'success',
                '📦'
            );
        }
        
        this.saveLocal();
    },

    remove(productId) {
        const idx = this.items.findIndex(i => i.id === parseInt(productId));
        if (idx === -1) return;
        
        const name = currentLang === 'en' ? this.items[idx].nameEn : this.items[idx].name;
        this.items.splice(idx, 1);
        this.saveLocal();
        showToast(
            `${currentLang === 'en' ? 'Removed' : 'تم حذف'} ${name}`,
            'error',
            '🗑️'
        );
    },

    clear() {
        this.items = [];
        this.saveLocal();
    },

    // ============================================================
    // GETTERS
    // ============================================================
    
    getItems() {
        return this.items;
    },

    getTotal() {
        let total = 0;
        this.items.forEach(item => {
            const price = item.offerPrice || item.price;
            total += price * item.weight * item.qty;
        });
        return total;
    },

    getItemCount() {
        let count = 0;
        this.items.forEach(item => {
            count += item.qty;
        });
        return count;
    },

    getUniqueCount() {
        const unique = new Set();
        this.items.forEach(item => unique.add(item.id));
        return unique.size;
    },

    getDiscountedTotal(coupon) {
        let total = this.getTotal();
        if (coupon) {
            if (coupon.type === 'percentage') {
                total = total - (total * coupon.discount / 100);
            } else {
                total = Math.max(0, total - coupon.discount);
            }
        }
        return total;
    },

    // ============================================================
    // UI UPDATE
    // ============================================================
    
    updateUI() {
        const list = getElement('cartItemsList');
        const fbadge = getElement('floatingBadge');
        const totalSpan = getElement('cartTotalPrice');
        const headerTotal = getElement('cartHeaderTotal');
        const floatingCheckoutBtn = getElement('floatingCheckout');

        if (!list) return;

        const kgLabel = currentLang === 'en' ? 'kg' : 'كجم';
        const currency = currentLang === 'en' ? 'EGP' : 'ج.م';

        // تجميع المنتجات المتكررة
        const grouped = {};
        this.items.forEach(item => {
            const key = `${item.id}`;
            if (grouped[key]) {
                grouped[key].qty += item.qty;
                grouped[key].weight = (grouped[key].weight * (grouped[key].qty - item.qty) + item.weight * item.qty) / grouped[key].qty;
            } else {
                grouped[key] = { ...item };
            }
        });
        const groupedItems = Object.values(grouped);

        if (groupedItems.length === 0) {
            list.innerHTML = `
                <div class="empty-cart-msg">
                    <i class="fas fa-shopping-cart"></i>
                    ${currentLang === 'en' ? 'Your cart is empty' : 'سلتك فارغة'}
                </div>
            `;
            if (fbadge) fbadge.textContent = '0';
            if (totalSpan) totalSpan.textContent = `0 ${currency}`;
            if (headerTotal) headerTotal.textContent = `0 ${currency}`;
            if (floatingCheckoutBtn) floatingCheckoutBtn.style.display = 'none';
            this.updateSideMenuCount();
            return;
        }

        let totalPrice = 0;
        let html = '';
        
        groupedItems.forEach(item => {
            const totalWeight = item.weight * item.qty;
            const price = item.offerPrice || item.price;
            const itemTotal = price * totalWeight;
            totalPrice += itemTotal;
            const productName = currentLang === 'en' ? item.nameEn : item.name;
            
            let priceDisplay = `${itemTotal.toFixed(2)} ${currency}`;
            if (item.oldPrice && item.offerPrice) {
                const oldTotal = item.oldPrice * totalWeight;
                priceDisplay = `
                    <span style="text-decoration:line-through;color:#999;font-size:13px;">
                        ${oldTotal.toFixed(2)}
                    </span> ${itemTotal.toFixed(2)} ${currency}
                `;
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
                        <button onclick="Cart.changeQty('${item.id}', -1)">−</button>
                        <span style="font-weight:700;min-width:14px;text-align:center;">${item.qty}</span>
                        <button onclick="Cart.changeQty('${item.id}', 1)">+</button>
                        <button class="remove-btn" onclick="Cart.remove('${item.id}')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        list.innerHTML = html;
        if (fbadge) fbadge.textContent = this.getUniqueCount();
        if (totalSpan) totalSpan.textContent = totalPrice.toFixed(2) + ' ' + currency;
        if (headerTotal) headerTotal.textContent = totalPrice.toFixed(2) + ' ' + currency;
        if (floatingCheckoutBtn) floatingCheckoutBtn.style.display = 'flex';
        
        this.updateSideMenuCount();
    },

    updateSideMenuCount() {
        const sideMenuCount = getElement('sideMenuCartCount');
        if (sideMenuCount) {
            sideMenuCount.textContent = this.getUniqueCount();
        }
    }
};

// ============================================================
// EXPORT
// ============================================================

window.Cart = Cart;

console.log('✅ Cart module loaded'); 
