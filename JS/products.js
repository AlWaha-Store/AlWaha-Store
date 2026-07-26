// ============================================================
// PRODUCTS MODULE - إدارة المنتجات
// ============================================================

const Products = {
    data: [],
    STORAGE_KEY: 'alwaha_products',
    isLoading: false,

    // ============================================================
    // LOAD DATA
    // ============================================================
    
    loadData() {
        if (this.isLoading) return;
        this.isLoading = true;
        
        try {
            // حاول تحميل من localStorage
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                    this.data = parsed;
                    console.log('✅ Products loaded from localStorage:', this.data.length);
                    this.isLoading = false;
                    return;
                }
            }
        } catch (e) {
            console.warn('⚠️ Error reading products from localStorage:', e);
        }
        
        // استخدام المنتجات الافتراضية
        this.data = this.getDefaultProducts();
        saveData(this.STORAGE_KEY, this.data);
        console.log('✅ Default products loaded:', this.data.length);
        this.isLoading = false;
    },

    // ============================================================
    // DEFAULT PRODUCTS
    // ============================================================
    
    getDefaultProducts() {
        return [
            // ===== فاكهة =====
            { id: 1, name: 'تفاح', nameEn: 'Apple', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍎', price: 25, oldPrice: null, offerPrice: null, offer: null, description: 'تفاح طازج من مزارعنا', descEn: 'Fresh apples from our farms', popular: 120, stock: 100 },
            { id: 2, name: 'برتقال', nameEn: 'Orange', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍊', price: 20, oldPrice: null, offerPrice: null, offer: null, description: 'برتقال عصير طازج', descEn: 'Fresh juice oranges', popular: 95, stock: 100 },
            { id: 3, name: 'موز', nameEn: 'Banana', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍌', price: 28, oldPrice: null, offerPrice: null, offer: null, description: 'موز طازج من المزرعة', descEn: 'Fresh bananas from the farm', popular: 150, stock: 100 },
            { id: 4, name: 'مانجو', nameEn: 'Mango', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🥭', price: 30, oldPrice: 35, offerPrice: 30, offer: 'عرض 5 كجم بسعر 150 ج.م', description: 'مانجو طازج - عرض خاص', descEn: 'Fresh mango - Special offer', popular: 200, stock: 100 },
            { id: 5, name: 'أناناس', nameEn: 'Pineapple', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍍', price: 40, oldPrice: null, offerPrice: null, offer: null, description: 'أناناس طازج من الفلبين', descEn: 'Fresh pineapple from Philippines', popular: 60, stock: 100 },
            { id: 6, name: 'فراولة', nameEn: 'Strawberry', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍓', price: 35, oldPrice: 45, offerPrice: 35, offer: 'خصم 20%', description: 'فراولة طازجة - عرض خاص', descEn: 'Fresh strawberries - Special offer', popular: 180, stock: 100 },
            { id: 7, name: 'عنب', nameEn: 'Grapes', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍇', price: 38, oldPrice: null, offerPrice: null, offer: null, description: 'عنب أسود حلو', descEn: 'Sweet black grapes', popular: 110, stock: 100 },
            { id: 8, name: 'رمان', nameEn: 'Pomegranate', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍎', price: 32, oldPrice: null, offerPrice: null, offer: null, description: 'رمان أحمر شهي', descEn: 'Delicious red pomegranate', popular: 75, stock: 100 },
            { id: 9, name: 'كيوي', nameEn: 'Kiwi', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🥝', price: 45, oldPrice: null, offerPrice: null, offer: null, description: 'كيوي طازج غني بفيتامين C', descEn: 'Fresh kiwi rich in Vitamin C', popular: 55, stock: 100 },
            { id: 10, name: 'خوخ', nameEn: 'Peach', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍑', price: 30, oldPrice: null, offerPrice: null, offer: null, description: 'خوخ طازج حلو المذاق', descEn: 'Fresh sweet peaches', popular: 80, stock: 100 },
            { id: 11, name: 'كمثرى', nameEn: 'Pear', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍐', price: 28, oldPrice: null, offerPrice: null, offer: null, description: 'كمثرى طازجة عصيرية', descEn: 'Fresh juicy pears', popular: 70, stock: 100 },
            { id: 12, name: 'كرز', nameEn: 'Cherry', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍒', price: 50, oldPrice: null, offerPrice: null, offer: null, description: 'كرز طازج حلو', descEn: 'Fresh sweet cherries', popular: 90, stock: 100 },
            { id: 13, name: 'بطيخ', nameEn: 'Watermelon', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍉', price: 15, oldPrice: null, offerPrice: null, offer: null, description: 'بطيخ أحمر منعش', descEn: 'Refreshing red watermelon', popular: 200, stock: 100 },
            { id: 14, name: 'شمام', nameEn: 'Cantaloupe', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍈', price: 20, oldPrice: null, offerPrice: null, offer: null, description: 'شمام طازج حلو', descEn: 'Fresh sweet cantaloupe', popular: 85, stock: 100 },
            { id: 15, name: 'ليمون', nameEn: 'Lemon', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍋', price: 18, oldPrice: null, offerPrice: null, offer: null, description: 'ليمون طازج حامض', descEn: 'Fresh sour lemons', popular: 110, stock: 100 },
            { id: 16, name: 'جريب فروت', nameEn: 'Grapefruit', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍊', price: 22, oldPrice: null, offerPrice: null, offer: null, description: 'جريب فروت طازج', descEn: 'Fresh grapefruit', popular: 40, stock: 100 },
            { id: 17, name: 'تمر', nameEn: 'Dates', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🌴', price: 35, oldPrice: null, offerPrice: null, offer: null, description: 'تمر طازج غني بالطاقة', descEn: 'Fresh energy-rich dates', popular: 130, stock: 100 },
            { id: 18, name: 'تين', nameEn: 'Fig', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍃', price: 40, oldPrice: null, offerPrice: null, offer: null, description: 'تين طازج حلو', descEn: 'Fresh sweet figs', popular: 60, stock: 100 },
            { id: 19, name: 'رطب', nameEn: 'Fresh Dates', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🌴', price: 30, oldPrice: null, offerPrice: null, offer: null, description: 'رطب طازج من النخيل', descEn: 'Fresh dates from palm', popular: 100, stock: 100 },
            { id: 20, name: 'أفوكادو', nameEn: 'Avocado', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🥑', price: 55, oldPrice: null, offerPrice: null, offer: null, description: 'أفوكادو طازج غني بالدهون الصحية', descEn: 'Fresh healthy fat avocado', popular: 150, stock: 100 },
            { id: 21, name: 'جوافة', nameEn: 'Guava', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍐', price: 20, oldPrice: null, offerPrice: null, offer: null, description: 'جوافة طازجة غنية بفيتامين C', descEn: 'Fresh Vitamin C rich guava', popular: 90, stock: 100 },
            { id: 22, name: 'فاكهة التنين', nameEn: 'Dragon Fruit', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🐉', price: 60, oldPrice: null, offerPrice: null, offer: null, description: 'فاكهة التنين الطازجة', descEn: 'Fresh dragon fruit', popular: 120, stock: 100 },
            { id: 23, name: 'ليتشي', nameEn: 'Lychee', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍓', price: 45, oldPrice: null, offerPrice: null, offer: null, description: 'ليتشي طازج حلو', descEn: 'Fresh sweet lychee', popular: 80, stock: 100 },
            { id: 24, name: 'كاكا', nameEn: 'Persimmon', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍊', price: 35, oldPrice: null, offerPrice: null, offer: null, description: 'كاكا طازجة حلوة', descEn: 'Fresh sweet persimmon', popular: 50, stock: 100 },
            { id: 25, name: 'يوسفي', nameEn: 'Tangerine', category: 'فاكهة', categoryEn: 'Fruits', emoji: '🍊', price: 18, oldPrice: null, offerPrice: null, offer: null, description: 'يوسفي طازج حلو', descEn: 'Fresh sweet tangerine', popular: 130, stock: 100 },
            
            // ===== خضار =====
            { id: 26, name: 'طماطم', nameEn: 'Tomato', category: 'خضار', categoryEn: 'Vegetables', emoji: '🍅', price: 15, oldPrice: 20, offerPrice: 15, offer: 'خصم 25%', description: 'طماطم طازجة - عرض خاص', descEn: 'Fresh tomatoes - Special offer', popular: 190, stock: 100 },
            { id: 27, name: 'خيار', nameEn: 'Cucumber', category: 'خضار', categoryEn: 'Vegetables', emoji: '🥒', price: 15, oldPrice: null, offerPrice: null, offer: null, description: 'خيار طازج مقرمش', descEn: 'Fresh crunchy cucumber', popular: 140, stock: 100 },
            { id: 28, name: 'فلفل', nameEn: 'Pepper', category: 'خضار', categoryEn: 'Vegetables', emoji: '🫑', price: 30, oldPrice: null, offerPrice: null, offer: null, description: 'فلفل ألوان طازج', descEn: 'Fresh colorful peppers', popular: 90, stock: 100 },
            { id: 29, name: 'خس', nameEn: 'Lettuce', category: 'خضار', categoryEn: 'Vegetables', emoji: '🥬', price: 10, oldPrice: 12, offerPrice: 10, offer: 'عرض 5 كجم بسعر 50 ج.م', description: 'خس طازج - عرض خاص', descEn: 'Fresh lettuce - Special offer', popular: 130, stock: 100 },
            { id: 30, name: 'سبانخ', nameEn: 'Spinach', category: 'خضار', categoryEn: 'Vegetables', emoji: '🌿', price: 14, oldPrice: null, offerPrice: null, offer: null, description: 'سبانخ غني بالحديد', descEn: 'Iron-rich spinach', popular: 85, stock: 100 },
            { id: 31, name: 'جزر', nameEn: 'Carrot', category: 'خضار', categoryEn: 'Vegetables', emoji: '🥕', price: 18, oldPrice: null, offerPrice: null, offer: null, description: 'جزر طازج غني بفيتامين أ', descEn: 'Fresh vitamin A rich carrots', popular: 160, stock: 100 },
            { id: 32, name: 'بطاطس', nameEn: 'Potato', category: 'خضار', categoryEn: 'Vegetables', emoji: '🥔', price: 16, oldPrice: 22, offerPrice: 16, offer: '5 كجم بسعر 80 ج.م', description: 'بطاطس طازجة - 5 كجم بسعر خاص', descEn: 'Fresh potatoes - 5kg special price', popular: 220, stock: 100 },
            { id: 33, name: 'بنجر', nameEn: 'Beetroot', category: 'خضار', categoryEn: 'Vegetables', emoji: '🍠', price: 20, oldPrice: null, offerPrice: null, offer: null, description: 'بنجر أحمر غني بالحديد', descEn: 'Iron-rich red beetroot', popular: 65, stock: 100 },
            { id: 34, name: 'كوسة', nameEn: 'Zucchini', category: 'خضار', categoryEn: 'Vegetables', emoji: '🥒', price: 18, oldPrice: null, offerPrice: null, offer: null, description: 'كوسة طازجة', descEn: 'Fresh zucchini', popular: 100, stock: 100 },
            { id: 35, name: 'باذنجان', nameEn: 'Eggplant', category: 'خضار', categoryEn: 'Vegetables', emoji: '🍆', price: 20, oldPrice: null, offerPrice: null, offer: null, description: 'باذنجان طازج', descEn: 'Fresh eggplant', popular: 80, stock: 100 },
            { id: 36, name: 'ثوم', nameEn: 'Garlic', category: 'خضار', categoryEn: 'Vegetables', emoji: '🧄', price: 25, oldPrice: null, offerPrice: null, offer: null, description: 'ثوم طازج', descEn: 'Fresh garlic', popular: 120, stock: 100 },
            { id: 37, name: 'بصل', nameEn: 'Onion', category: 'خضار', categoryEn: 'Vegetables', emoji: '🧅', price: 12, oldPrice: null, offerPrice: null, offer: null, description: 'بصل طازج', descEn: 'Fresh onion', popular: 150, stock: 100 },
            { id: 38, name: 'فجل', nameEn: 'Radish', category: 'خضار', categoryEn: 'Vegetables', emoji: '🌰', price: 10, oldPrice: null, offerPrice: null, offer: null, description: 'فجل طازج مقرمش', descEn: 'Fresh crunchy radish', popular: 60, stock: 100 },
            { id: 39, name: 'كرفس', nameEn: 'Celery', category: 'خضار', categoryEn: 'Vegetables', emoji: '🌿', price: 15, oldPrice: null, offerPrice: null, offer: null, description: 'كرفس طازج', descEn: 'Fresh celery', popular: 70, stock: 100 },
            { id: 40, name: 'بروكلي', nameEn: 'Broccoli', category: 'خضار', categoryEn: 'Vegetables', emoji: '🥦', price: 25, oldPrice: null, offerPrice: null, offer: null, description: 'بروكلي طازج غني بفيتامين C', descEn: 'Fresh Vitamin C rich broccoli', popular: 110, stock: 100 },
            { id: 41, name: 'قرنبيط', nameEn: 'Cauliflower', category: 'خضار', categoryEn: 'Vegetables', emoji: '🥦', price: 22, oldPrice: null, offerPrice: null, offer: null, description: 'قرنبيط طازج', descEn: 'Fresh cauliflower', popular: 90, stock: 100 },
            { id: 42, name: 'فطر', nameEn: 'Mushroom', category: 'خضار', categoryEn: 'Vegetables', emoji: '🍄', price: 35, oldPrice: null, offerPrice: null, offer: null, description: 'فطر طازج', descEn: 'Fresh mushroom', popular: 130, stock: 100 },
            { id: 43, name: 'ذرة', nameEn: 'Corn', category: 'خضار', categoryEn: 'Vegetables', emoji: '🌽', price: 12, oldPrice: null, offerPrice: null, offer: null, description: 'ذرة طازجة حلوة', descEn: 'Fresh sweet corn', popular: 140, stock: 100 },
            { id: 44, name: 'فاصوليا', nameEn: 'Green Beans', category: 'خضار', categoryEn: 'Vegetables', emoji: '🌱', price: 20, oldPrice: null, offerPrice: null, offer: null, description: 'فاصوليا طازجة', descEn: 'Fresh green beans', popular: 100, stock: 100 },
            { id: 45, name: 'بازلاء', nameEn: 'Peas', category: 'خضار', categoryEn: 'Vegetables', emoji: '🫛', price: 18, oldPrice: null, offerPrice: null, offer: null, description: 'بازلاء طازجة', descEn: 'Fresh peas', popular: 85, stock: 100 },
            { id: 46, name: 'قرع', nameEn: 'Pumpkin', category: 'خضار', categoryEn: 'Vegetables', emoji: '🎃', price: 15, oldPrice: null, offerPrice: null, offer: null, description: 'قرع طازج', descEn: 'Fresh pumpkin', popular: 75, stock: 100 },
            { id: 47, name: 'بطاطا حلوة', nameEn: 'Sweet Potato', category: 'خضار', categoryEn: 'Vegetables', emoji: '🍠', price: 20, oldPrice: null, offerPrice: null, offer: null, description: 'بطاطا حلوة طازجة', descEn: 'Fresh sweet potato', popular: 120, stock: 100 },
            { id: 48, name: 'زنجبيل', nameEn: 'Ginger', category: 'خضار', categoryEn: 'Vegetables', emoji: '🌱', price: 30, oldPrice: null, offerPrice: null, offer: null, description: 'زنجبيل طازج', descEn: 'Fresh ginger', popular: 95, stock: 100 },
            { id: 49, name: 'كراث', nameEn: 'Leek', category: 'خضار', categoryEn: 'Vegetables', emoji: '🌿', price: 18, oldPrice: null, offerPrice: null, offer: null, description: 'كراث طازج', descEn: 'Fresh leek', popular: 60, stock: 100 },
            { id: 50, name: 'جرجير', nameEn: 'Arugula', category: 'خضار', categoryEn: 'Vegetables', emoji: '🌿', price: 22, oldPrice: null, offerPrice: null, offer: null, description: 'جرجير طازج', descEn: 'Fresh arugula', popular: 80, stock: 100 }
        ];
    },

    // ============================================================
    // GET DATA
    // ============================================================
    
    getData() {
        if (this.data.length === 0) {
            this.loadData();
        }
        return this.data;
    },

    saveData(products) {
        this.data = products;
        saveData(this.STORAGE_KEY, products);
    },

    // ============================================================
    // HELPERS
    // ============================================================
    
    getName(p) {
        return currentLang === 'en' ? p.nameEn : p.name;
    },
    
    getCategory(p) {
        return currentLang === 'en' ? p.categoryEn : p.category;
    },
    
    getDescription(p) {
        return currentLang === 'en' ? p.descEn : p.description;
    },
    
    getPrice(p) {
        return p.offerPrice || p.price;
    },
    
    hasOffer(p) {
        return p.offerPrice && p.offerPrice < p.price;
    },

    // ============================================================
    // RENDER
    // ============================================================
    
    render(sort = 'default', search = '') {
        if (this.data.length === 0) {
            this.loadData();
        }
        
        const products = this.data;
        const fruitsGrid = getElement('fruitsGrid');
        const vegGrid = getElement('vegetablesGrid');
        const offersGrid = getElement('offersGrid');

        if (!fruitsGrid || !vegGrid || !offersGrid) {
            console.warn('⚠️ Product grids not found');
            return;
        }

        // تصفية المنتجات
        let fruits = products.filter(p => p.category === 'فاكهة');
        let vegetables = products.filter(p => p.category === 'خضار');
        let offers = products.filter(p => this.hasOffer(p));

        // تطبيق البحث
        if (search && search.trim()) {
            const s = search.trim().toLowerCase();
            fruits = fruits.filter(p => 
                p.name.toLowerCase().includes(s) || 
                p.nameEn.toLowerCase().includes(s)
            );
            vegetables = vegetables.filter(p => 
                p.name.toLowerCase().includes(s) || 
                p.nameEn.toLowerCase().includes(s)
            );
            offers = offers.filter(p => 
                p.name.toLowerCase().includes(s) || 
                p.nameEn.toLowerCase().includes(s)
            );
        }

        // تطبيق الترتيب
        const sortFn = (a, b) => {
            if (sort === 'price-asc') return this.getPrice(a) - this.getPrice(b);
            if (sort === 'price-desc') return this.getPrice(b) - this.getPrice(a);
            if (sort === 'popular') return (b.popular || 0) - (a.popular || 0);
            return 0;
        };
        
        fruits.sort(sortFn);
        vegetables.sort(sortFn);
        offers.sort(sortFn);

        // عرض المنتجات
        this.renderGrid(fruitsGrid, fruits);
        this.renderGrid(vegGrid, vegetables);
        this.renderGrid(offersGrid, offers, true);
        
        console.log('✅ Products rendered:', products.length);
    },

    renderGrid(grid, items, isOffer = false) {
        if (!grid) return;
        
        if (items.length === 0) {
            grid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:20px;color:#5a7a5a;font-size:14px;">
                    ${currentLang === 'en' ? 'No products' : 'لا توجد منتجات'}
                </div>
            `;
            return;
        }
        
        grid.innerHTML = '';
        const priceLabel = currentLang === 'en' ? 'EGP/kg' : 'ج.م/كجم';
        const viewLabel = currentLang === 'en' ? 'View' : 'معاينة';
        
        items.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card' + (isOffer ? ' offer-product' : '');
            
            const hasOffer = this.hasOffer(p);
            let offerHtml = hasOffer ? `<span class="offer-badge">${p.offer || 'عرض'}</span>` : '';
            
            const price = this.getPrice(p);
            let priceHtml = p.oldPrice && hasOffer ?
                `<span class="old-price">${p.oldPrice}</span> ${price} <small>${priceLabel}</small>` :
                `${price} <small>${priceLabel}</small>`;
            
            card.innerHTML = `
                ${offerHtml}
                <span class="product-emoji">${p.emoji}</span>
                <h3>${this.getName(p)}</h3>
                <span class="product-cat">${this.getCategory(p)}</span>
                <div class="price">${priceHtml}</div>
                <button class="btn-detail" data-id="${p.id}">${viewLabel}</button>
            `;
            
            grid.appendChild(card);
            
            const btn = card.querySelector('.btn-detail');
            if (btn) {
                btn.addEventListener('click', function() {
                    UI.openProductModal(parseInt(this.dataset.id));
                });
            }
        });
    }
};

// ============================================================
// EXPORT
// ============================================================

window.Products = Products;

console.log('✅ Products module loaded'); 
