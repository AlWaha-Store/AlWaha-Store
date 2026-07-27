-- ==========================================
-- متجر الواحة - قاعدة البيانات
-- ==========================================

-- 1. جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  referrals INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('fruits', 'vegetables')),
  price DECIMAL(10, 2) NOT NULL,
  image TEXT NOT NULL,
  weight INTEGER DEFAULT 500,
  is_on_sale BOOLEAN DEFAULT FALSE,
  sale_price DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. جدول الطلبات
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('express', 'scheduled')),
  scheduled_time TIME,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'instapay', 'wallet')),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  coupon_code TEXT,
  discount DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. جدول الكوبونات
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. جدول إعدادات الأدمن
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  password TEXT NOT NULL,
  allowed_ips TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. جدول السلة المؤقتة
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  weight INTEGER DEFAULT 500,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. دوال مساعدة
CREATE OR REPLACE FUNCTION increment_user_orders(user_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET orders_count = orders_count + 1
  WHERE id = user_id::UUID;
END;
$$ LANGUAGE plpgsql;

-- 8. إدخال بيانات تجريبية
INSERT INTO products (name, category, price, image, weight, is_on_sale) VALUES
('تفاح أحمر', 'fruits', 30, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300', 500, true),
('برتقال', 'fruits', 20, 'https://images.unsplash.com/photo-1547514701-427821017d84?w=300', 500, false),
('موز', 'fruits', 15, 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=300', 300, false),
('عنب', 'fruits', 40, 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=300', 400, true),
('خيار', 'vegetables', 10, 'https://images.unsplash.com/photo-1585049152458-c8d8820b2c18?w=300', 500, false),
('طماطم', 'vegetables', 12, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300', 500, true),
('جزر', 'vegetables', 8, 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300', 400, false),
('خس', 'vegetables', 7, 'https://images.unsplash.com/photo-1622206151226-18ca2a9ab4e1?w=300', 300, false);

-- إضافة كوبون تجريبي
INSERT INTO coupons (code, discount_percent, expires_at) VALUES
('WELCOME10', 10, '2025-12-31 23:59:59+00');

-- إضافة إعدادات الأدمن الافتراضية
INSERT INTO admin_settings (password, allowed_ips) VALUES
('seif1876', '{}'); 
