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
                this.items = JSON.parse(saved);
                if (!Array.isArray(this.items)) this.items = [];
            }
        } catch (e) {
            this.items = [];
        }
    },

    saveLocal() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
        } catch (e) {
            console.warn('⚠️ Error saving cart locally:', e);
        }
        
        if (Auth.isLoggedIn()) {
            this.saveToSupabase();
        }
    },

    // ============================================================
    // SUPABASE SYNC
    // ============================================================
    
    async saveToSupabase() {
        const user = Auth.getUser();
        if (!user) return;
        
        try {
            if (typeof supabaseClient === 'undefined') return;
            
            await supabaseClient
                .from('cart')
                .delete()
                .eq('user_id', user.id);
            
            if (this.items.length === 0) return;
            
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
        if (!user) return;
        
        try {
            if (typeof supabaseClient === 'undefined') return;
            
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
                    if (this.items.length > 0) {
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
                    } else {
                        this.items = cloudCart;
                    }
                    
                    this.saveLocal();
                    this.updateUI();
                    console.log('✅ Cart synced from Supabase');
                }
            }
        } catch (error) {
            console.error('❌ Error syncing cart from Supabase:', error);
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
                oldPrice: p.oldPrice || null,
                weight: weight,
                qty: 1
            });
        }
        
        this.saveLocal();
        this.updateUI();
        return true;
    },

    changeQty(productId, delta) {
        const idx = this.items.findIndex(i => i.id === parseInt(productId));
        if (idx === -1) return;
        
        this.items[idx].qty += delta;
        
        if (this.items[idx].qty <= 0) {
            const name = currentLang === 'en' ? this.items[idx].nameEn : this.items[idx].name;
            this.items.splice(idx, 1);
            showToast(`${currentLang === 'en' ? 'Removed' : 'تم حذف'} ${name}`, 'error', '🗑️');
        } else {
            const name = currentLang === 'en' ? this.items[idx].nameEn : this.items[idx].name;
            const totalWeight = this.items[idx].weight * this.items[idx].qty;
            const kgLabel = currentLang === 'en' ? 'kg' : 'كجم';
            showToast(`${name}: ${totalWeight.toFixed(2)} ${kgLabel}`, 'success', '📦');
        }
        
        this.saveLocal();
        this.updateUI();
    },

    remove(productId) {
        const idx = this.items.findIndex(i => i.id === parseInt(productId));
        if (idx === -1) return;
        
        const name = currentLang === 'en' ? this.items[idx].nameEn : this.items[idx].name;
        this.items.splice(idx, 1);
        this.saveLocal();
        this.updateUI();
        showToast(`${currentLang === 'en' ? 'Removed' : 'تم حذف'} ${name}`, 'error', '🗑️');
    },

    clear() {
        this.items = [];
        this.saveLocal();
        this.updateUI();
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
            total += item.price * item.weight * item.qty;
        });
        return total;
    },

    getItemCount() {
        return this.items.length;
    },

    getUniqueCount() {
        const unique = new Set();
        this.items.forEach(item => unique.add(item.id));
        return unique.size;
    },

    // ============================================================
    // UI UPDATE
    // ============================================================
    
    updateUI() {
        const list = document.getElementById('cartItemsList');
        const fbadge = document.getElementById('floatingBadge');
        const totalSpan = document.getElementById('cartTotalPrice');
        const headerTotal = document.getElementById('cartHeaderTotal');
        const floatingCheckoutBtn = document.getElementById('floatingCheckout');

        const kgLabel = currentLang === 'en' ? 'kg' : 'كجم';
        const currency = currentLang === 'en' ? 'EGP' : 'ج.م';

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

        if (!list) return;

        if (groupedItems.length === 0) {
            list.innerHTML = `
                <div class="empty-cart-msg" id="emptyCartMsg">
                    <i class="fas fa-shopping-cart"></i>
                    ${currentLang === 'en' ? 'Your cart is empty' : 'سلتك فارغة'}
                </div>
            `;
            if (fbadge) fbadge.textContent = '0';
            if (totalSpan) totalSpan.textContent = `0 ${currency}`;
            if (headerTotal) headerTotal.textContent = `0 ${currency}`;
            if (floatingCheckoutBtn) floatingCheckoutBtn.style.display = 'none';
            return;
        }

        let totalPrice = 0;
        let html = '';
        
        groupedItems.forEach(item => {
            const totalWeight = item.weight * item.qty;
            const itemTotal = item.price * totalWeight;
            totalPrice += itemTotal;
            const productName = currentLang === 'en' ? item.nameEn : item.name;
            
            let priceDisplay = `${itemTotal.toFixed(2)} ${currency}`;
            if (item.oldPrice) {
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
    }
};

// ============================================================
// EXPORT
// ============================================================

window.Cart = Cart; 
