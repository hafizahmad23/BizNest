-- ============================================================================
-- BizNest Pakistan — COMPLETE DATABASE MIGRATION
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New Query → Run
-- Safe to re-run (idempotent via IF NOT EXISTS / ON CONFLICT DO NOTHING)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 1. TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','business','admin')),
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS provinces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  province_id UUID NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  UNIQUE (province_id, slug)
);

CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  province_id UUID NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  UNIQUE (district_id, slug)
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  tagline TEXT,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  province_id UUID REFERENCES provinces(id),
  district_id UUID REFERENCES districts(id),
  city_id UUID REFERENCES cities(id),
  full_address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  cover_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','rejected','suspended')),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  leads_count INTEGER NOT NULL DEFAULT 0,
  ai_description TEXT,
  ai_keywords TEXT[],
  ai_summary TEXT,
  operating_hours JSONB,
  price_range TEXT,
  service_area TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS business_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2),
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_moderated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, reviewer_id)
);

CREATE TABLE IF NOT EXISTS business_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  sender_name TEXT NOT NULL,
  sender_email TEXT,
  sender_phone TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, business_id)
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, customer_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES business_products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  UNIQUE(cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  business_id UUID NOT NULL REFERENCES businesses(id),
  subtotal DECIMAL(12,2) NOT NULL,
  delivery_fee DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  order_status TEXT NOT NULL DEFAULT 'placed' CHECK (order_status IN ('placed','confirmed','processing','shipped','delivered','cancelled')),
  delivery_address TEXT,
  transaction_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES business_products(id),
  product_name TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  quantity INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES profiles(id),
  documents JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_note TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category_id);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city_id);
CREATE INDEX IF NOT EXISTS idx_businesses_province ON businesses(province_id);
CREATE INDEX IF NOT EXISTS idx_businesses_district ON businesses(district_id);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_rating ON businesses(rating DESC);
CREATE INDEX IF NOT EXISTS idx_businesses_featured ON businesses(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_businesses_created ON businesses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_business ON business_products(business_id);

CREATE INDEX IF NOT EXISTS idx_reviews_business ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id);

CREATE INDEX IF NOT EXISTS idx_leads_business ON business_leads(business_id);
CREATE INDEX IF NOT EXISTS idx_leads_sender ON business_leads(sender_id);

CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_business ON saved_businesses(business_id);

CREATE INDEX IF NOT EXISTS idx_conversations_business ON conversations(business_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_business ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_cities_district ON cities(district_id);
CREATE INDEX IF NOT EXISTS idx_cities_province ON cities(province_id);
CREATE INDEX IF NOT EXISTS idx_districts_province ON districts(province_id);

CREATE INDEX IF NOT EXISTS idx_verification_business ON verification_requests(business_id);

-- ============================================================================
-- 3. FUNCTIONS
-- ============================================================================

-- Helper: is the current caller an admin? (reads profiles securely)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Helper: does current caller own a given business?
CREATE OR REPLACE FUNCTION is_business_owner(biz_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM businesses
    WHERE id = biz_id AND owner_id = auth.uid()
  );
$$;

-- Trigger 1: auto-create profile when a user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, city)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'city'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger 2: auto-recalculate business rating from real (unmoderated) reviews
CREATE OR REPLACE FUNCTION recalc_business_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_business UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_business := OLD.business_id;
  ELSE
    target_business := NEW.business_id;
  END IF;

  UPDATE businesses
  SET
    rating = COALESCE((
      SELECT ROUND(AVG(r.rating)::numeric, 2)
      FROM reviews r
      WHERE r.business_id = target_business AND r.is_moderated = FALSE
    ), 0),
    review_count = (
      SELECT COUNT(*)
      FROM reviews r
      WHERE r.business_id = target_business AND r.is_moderated = FALSE
    )
  WHERE id = target_business;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reviews_recalc ON reviews;
CREATE TRIGGER trg_reviews_recalc
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION recalc_business_rating();

-- Trigger 3: auto-update updated_at columns
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_businesses_updated_at ON businesses;
CREATE TRIGGER trg_businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_reviews_updated_at ON reviews;
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_leads_updated_at ON business_leads;
CREATE TRIGGER trg_leads_updated_at BEFORE UPDATE ON business_leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_carts_updated_at ON carts;
CREATE TRIGGER trg_carts_updated_at BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_verification_updated_at ON verification_requests;
CREATE TRIGGER trg_verification_updated_at BEFORE UPDATE ON verification_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Guard: users can NEVER set their own role to 'admin'
CREATE OR REPLACE FUNCTION guard_profile_privilege()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'admin' AND NOT is_admin() THEN
    RAISE EXCEPTION 'Only an existing admin can grant the admin role.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_privilege ON profiles;
CREATE TRIGGER trg_guard_profile_privilege BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION guard_profile_privilege();

-- Guard: business owners can NEVER self-approve, verify, feature, or
-- mark their listing premium. Only an admin can change these flags.
CREATE OR REPLACE FUNCTION guard_business_privileges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    NEW.is_verified := OLD.is_verified;
    NEW.is_featured := OLD.is_featured;
    NEW.is_premium := OLD.is_premium;
    NEW.status := OLD.status;
    NEW.owner_id := OLD.owner_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_business_privileges ON businesses;
CREATE TRIGGER trg_guard_business_privileges BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION guard_business_privileges();

-- Safe view counter (used by the app instead of blind client increments)
CREATE OR REPLACE FUNCTION increment_business_views(biz_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE businesses SET views_count = views_count + 1 WHERE id = biz_id;
END;
$$;

-- Lead counter sync
CREATE OR REPLACE FUNCTION recalc_business_leads()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_business UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_business := OLD.business_id;
  ELSE
    target_business := NEW.business_id;
  END IF;

  UPDATE businesses
  SET leads_count = (
    SELECT COUNT(*) FROM business_leads l WHERE l.business_id = target_business
  )
  WHERE id = target_business;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_leads_recalc ON business_leads;
CREATE TRIGGER trg_leads_recalc
  AFTER INSERT OR UPDATE OR DELETE ON business_leads
  FOR EACH ROW EXECUTE FUNCTION recalc_business_leads();

-- Notify business owner when a new lead arrives
CREATE OR REPLACE FUNCTION notify_owner_on_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  biz RECORD;
BEGIN
  SELECT id, name, owner_id INTO biz FROM businesses WHERE id = NEW.business_id;
  IF biz.owner_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, body, reference_id, reference_type)
    VALUES (
      biz.owner_id,
      'lead',
      'New Customer Inquiry',
      NEW.sender_name || ' sent an inquiry to "' || biz.name || '".',
      NEW.id,
      'business_lead'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_owner_on_lead ON business_leads;
CREATE TRIGGER trg_notify_owner_on_lead
  AFTER INSERT ON business_leads
  FOR EACH ROW EXECUTE FUNCTION notify_owner_on_lead();

-- Notify business owner when a new order is placed
CREATE OR REPLACE FUNCTION notify_owner_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  biz RECORD;
BEGIN
  SELECT id, name, owner_id INTO biz FROM businesses WHERE id = NEW.business_id;
  IF biz.owner_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, body, reference_id, reference_type)
    VALUES (
      biz.owner_id,
      'order',
      'New Order Received',
      'A new order (PKR ' || NEW.total || ') was placed for "' || biz.name || '".',
      NEW.id,
      'order'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_owner_on_order ON orders;
CREATE TRIGGER trg_notify_owner_on_order
  AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION notify_owner_on_order();

-- Notify business owner when listing status changes (approved / rejected)
CREATE OR REPLACE FUNCTION notify_owner_on_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO notifications (user_id, type, title, body, reference_id, reference_type)
    VALUES (
      NEW.owner_id,
      'business_status',
      'Listing Status Updated',
      'Your listing "' || NEW.name || '" status changed to: ' || NEW.status || '.',
      NEW.id,
      'business'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_owner_on_status ON businesses;
CREATE TRIGGER trg_notify_owner_on_status
  AFTER UPDATE OF status ON businesses
  FOR EACH ROW EXECUTE FUNCTION notify_owner_on_status_change();

-- Bump conversation timestamp on new message
CREATE OR REPLACE FUNCTION touch_conversation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE conversations SET last_message_at = NOW() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_conversation ON messages;
CREATE TRIGGER trg_touch_conversation
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION touch_conversation();

-- ============================================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- ------------------------------ profiles -----------------------------------
DROP POLICY IF EXISTS profiles_select_all ON profiles;
CREATE POLICY profiles_select_all ON profiles
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE
  USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());

-- ------------------------- locations / categories --------------------------
DROP POLICY IF EXISTS provinces_read_all ON provinces;
CREATE POLICY provinces_read_all ON provinces FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS districts_read_all ON districts;
CREATE POLICY districts_read_all ON districts FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS cities_read_all ON cities;
CREATE POLICY cities_read_all ON cities FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS categories_read_all ON categories;
CREATE POLICY categories_read_all ON categories FOR SELECT USING (TRUE);

-- ------------------------------- businesses --------------------------------
DROP POLICY IF EXISTS businesses_read_active ON businesses;
CREATE POLICY businesses_read_active ON businesses
  FOR SELECT
  USING (status = 'active' OR owner_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS businesses_insert_business_role ON businesses;
CREATE POLICY businesses_insert_business_role ON businesses
  FOR INSERT
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('business', 'admin')
    )
  );

DROP POLICY IF EXISTS businesses_update_owner ON businesses;
CREATE POLICY businesses_update_owner ON businesses
  FOR UPDATE
  USING (owner_id = auth.uid() OR is_admin())
  WITH CHECK (owner_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS businesses_delete_owner ON businesses;
CREATE POLICY businesses_delete_owner ON businesses
  FOR DELETE
  USING (owner_id = auth.uid() OR is_admin());

-- --------------------------- business_products ------------------------------
DROP POLICY IF EXISTS products_read_all ON business_products;
CREATE POLICY products_read_all ON business_products FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS products_owner_insert ON business_products;
CREATE POLICY products_owner_insert ON business_products
  FOR INSERT WITH CHECK (is_business_owner(business_id) OR is_admin());

DROP POLICY IF EXISTS products_owner_update ON business_products;
CREATE POLICY products_owner_update ON business_products
  FOR UPDATE
  USING (is_business_owner(business_id) OR is_admin())
  WITH CHECK (is_business_owner(business_id) OR is_admin());

DROP POLICY IF EXISTS products_owner_delete ON business_products;
CREATE POLICY products_owner_delete ON business_products
  FOR DELETE
  USING (is_business_owner(business_id) OR is_admin());

-- -------------------------------- reviews ----------------------------------
DROP POLICY IF EXISTS reviews_read_public ON reviews;
CREATE POLICY reviews_read_public ON reviews
  FOR SELECT
  USING (is_moderated = FALSE OR reviewer_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS reviews_insert_auth ON reviews;
CREATE POLICY reviews_insert_auth ON reviews
  FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid()
    AND NOT is_business_owner(business_id)
  );

DROP POLICY IF EXISTS reviews_update_own ON reviews;
CREATE POLICY reviews_update_own ON reviews
  FOR UPDATE
  USING (reviewer_id = auth.uid() OR is_admin())
  WITH CHECK (reviewer_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS reviews_delete_own ON reviews;
CREATE POLICY reviews_delete_own ON reviews
  FOR DELETE
  USING (reviewer_id = auth.uid() OR is_admin());

-- ------------------------------- business_leads -----------------------------
DROP POLICY IF EXISTS leads_insert_anyone ON business_leads;
CREATE POLICY leads_insert_anyone ON business_leads
  FOR INSERT
  WITH CHECK (sender_id IS NULL OR sender_id = auth.uid());

DROP POLICY IF EXISTS leads_read_owner_or_sender ON business_leads;
CREATE POLICY leads_read_owner_or_sender ON business_leads
  FOR SELECT
  USING (
    is_business_owner(business_id)
    OR sender_id = auth.uid()
    OR is_admin()
  );

DROP POLICY IF EXISTS leads_update_owner ON business_leads;
CREATE POLICY leads_update_owner ON business_leads
  FOR UPDATE
  USING (is_business_owner(business_id) OR is_admin())
  WITH CHECK (is_business_owner(business_id) OR is_admin());

-- ---------------------------- saved_businesses ------------------------------
DROP POLICY IF EXISTS saved_all_own ON saved_businesses;
CREATE POLICY saved_all_own ON saved_businesses
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ------------------------------ conversations -------------------------------
DROP POLICY IF EXISTS conversations_read_participants ON conversations;
CREATE POLICY conversations_read_participants ON conversations
  FOR SELECT
  USING (customer_id = auth.uid() OR is_business_owner(business_id) OR is_admin());

DROP POLICY IF EXISTS conversations_insert_customer ON conversations;
CREATE POLICY conversations_insert_customer ON conversations
  FOR INSERT
  WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS conversations_update_participants ON conversations;
CREATE POLICY conversations_update_participants ON conversations
  FOR UPDATE
  USING (customer_id = auth.uid() OR is_business_owner(business_id) OR is_admin())
  WITH CHECK (customer_id = auth.uid() OR is_business_owner(business_id) OR is_admin());

-- -------------------------------- messages ----------------------------------
DROP POLICY IF EXISTS messages_read_participants ON messages;
CREATE POLICY messages_read_participants ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.customer_id = auth.uid() OR is_business_owner(c.business_id) OR is_admin())
    )
  );

DROP POLICY IF EXISTS messages_insert_participants ON messages;
CREATE POLICY messages_insert_participants ON messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.customer_id = auth.uid() OR is_business_owner(c.business_id))
    )
  );

-- ---------------------------------- carts -----------------------------------
DROP POLICY IF EXISTS carts_all_own ON carts;
CREATE POLICY carts_all_own ON carts
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS cart_items_all_own ON cart_items;
CREATE POLICY cart_items_all_own ON cart_items
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM carts c WHERE c.id = cart_id AND c.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM carts c WHERE c.id = cart_id AND c.user_id = auth.uid())
  );

-- ---------------------------------- orders ----------------------------------
DROP POLICY IF EXISTS orders_read_own_or_owner ON orders;
CREATE POLICY orders_read_own_or_owner ON orders
  FOR SELECT
  USING (buyer_id = auth.uid() OR is_business_owner(business_id) OR is_admin());

DROP POLICY IF EXISTS orders_insert_buyer ON orders;
CREATE POLICY orders_insert_buyer ON orders
  FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

DROP POLICY IF EXISTS orders_update_owner ON orders;
CREATE POLICY orders_update_owner ON orders
  FOR UPDATE
  USING (is_business_owner(business_id) OR is_admin())
  WITH CHECK (is_business_owner(business_id) OR is_admin());

DROP POLICY IF EXISTS order_items_read_own ON order_items;
CREATE POLICY order_items_read_own ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
      AND (o.buyer_id = auth.uid() OR is_business_owner(o.business_id) OR is_admin())
    )
  );

DROP POLICY IF EXISTS order_items_insert_buyer ON order_items;
CREATE POLICY order_items_insert_buyer ON order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.buyer_id = auth.uid()
    )
  );

-- ------------------------------- notifications ------------------------------
DROP POLICY IF EXISTS notifications_read_own ON notifications;
CREATE POLICY notifications_read_own ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS notifications_update_own ON notifications;
CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS notifications_insert_auth ON notifications;
CREATE POLICY notifications_insert_auth ON notifications
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- --------------------------- verification_requests --------------------------
DROP POLICY IF EXISTS verification_insert_owner ON verification_requests;
CREATE POLICY verification_insert_owner ON verification_requests
  FOR INSERT
  WITH CHECK (requested_by = auth.uid() AND is_business_owner(business_id));

DROP POLICY IF EXISTS verification_read_owner_admin ON verification_requests;
CREATE POLICY verification_read_owner_admin ON verification_requests
  FOR SELECT
  USING (requested_by = auth.uid() OR is_business_owner(business_id) OR is_admin());

DROP POLICY IF EXISTS verification_update_admin ON verification_requests;
CREATE POLICY verification_update_admin ON verification_requests
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- 5. SEED DATA — CATEGORIES (16)
-- ============================================================================

INSERT INTO categories (name, slug, icon, description, display_order) VALUES
  ('Botanical & Nursery', 'botanical-nursery', 'Sprout', 'Plants, seeds, landscaping, gardening supplies & nurseries', 1),
  ('Restaurants & Cafes', 'restaurants-cafes', 'Utensils', 'Pakistani cuisine, fast food, bakeries, coffee shops & fine dining', 2),
  ('Doctors & Clinics', 'doctors-clinics', 'Stethoscope', 'Specialist doctors, dental clinics, skin centers & private practices', 3),
  ('Electricians & Solar', 'electricians-solar', 'Wrench', 'Electricians, AC technicians, solar installers & repair services', 4),
  ('Real Estate & Plots', 'real-estate-plots', 'Home', 'Plots, houses, commercial property dealers & investment advisors', 5),
  ('Software & Freelancers', 'software-freelancers', 'Laptop', 'Software houses, web developers, designers & digital agencies', 6),
  ('Lawyers & Legal Aid', 'lawyers-legal-aid', 'Scale', 'Advocates, corporate lawyers, tax consultants & legal documentation', 7),
  ('Solar & Energy Systems', 'solar-energy-systems', 'Zap', 'Solar panels, inverters, net metering & backup power solutions', 8),
  ('Hotels & Guest Houses', 'hotels-guest-houses', 'Hotel', 'Hotels, guest houses, resorts & short-stay accommodation', 9),
  ('Hospitals & Diagnostics', 'hospitals-diagnostics', 'Hospital', 'Hospitals, laboratories, imaging centers & emergency care', 10),
  ('Retail & Wholesale', 'retail-wholesale', 'ShoppingBag', 'Shops, wholesale dealers, distributors & general stores', 11),
  ('Plumbers & Home Repairs', 'plumbers-home-repairs', 'Droplets', 'Plumbers, painters, carpenters & home maintenance services', 12),
  ('Academies & Tutors', 'academies-tutors', 'GraduationCap', 'Coaching academies, home tutors, language & IT institutes', 13),
  ('Salons & Spas', 'salons-spas', 'Scissors', 'Beauty parlors, barber shops, spas & grooming services', 14),
  ('Photographers & Media', 'photographers-media', 'Camera', 'Wedding photographers, videographers, studios & media production', 15),
  ('Gyms & Fitness Centers', 'gyms-fitness-centers', 'Dumbbell', 'Gyms, fitness trainers, yoga studios & sports facilities', 16)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 6. SEED DATA — PROVINCES (7)
-- ============================================================================

INSERT INTO provinces (name, slug) VALUES
  ('Punjab', 'punjab'),
  ('Sindh', 'sindh'),
  ('Khyber Pakhtunkhwa', 'khyber-pakhtunkhwa'),
  ('Balochistan', 'balochistan'),
  ('Islamabad Capital Territory', 'islamabad-capital-territory'),
  ('Gilgit-Baltistan', 'gilgit-baltistan'),
  ('Azad Jammu & Kashmir', 'azad-jammu-kashmir')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 7. SEED DATA — DISTRICTS
-- ============================================================================

-- PUNJAB
INSERT INTO districts (province_id, name, slug)
SELECT p.id, d.name, d.slug FROM provinces p
JOIN (VALUES
  ('Lahore','lahore'), ('Rawalpindi','rawalpindi'), ('Faisalabad','faisalabad'),
  ('Multan','multan'), ('Gujranwala','gujranwala'), ('Sialkot','sialkot'),
  ('Bahawalpur','bahawalpur'), ('Sargodha','sargodha'), ('Gujrat','gujrat'),
  ('Sheikhupura','sheikhupura'), ('Rahim Yar Khan','rahim-yar-khan'), ('Sahiwal','sahiwal-punjab'),
  ('Kasur','kasur'), ('Okara','okara'), ('Jhang','jhang'),
  ('Dera Ghazi Khan','dera-ghazi-khan'), ('Mianwali','mianwali'), ('Chiniot','chiniot'),
  ('Khanewal','khanewal'), ('Hafizabad','hafizabad'), ('Attock','attock'),
  ('Jhelum','jhelum'), ('Chakwal','chakwal'), ('Narowal','narowal'),
  ('Vehari','vehari'), ('Khushab','khushab'), ('Pakpattan','pakpattan'),
  ('Toba Tek Singh','toba-tek-singh'), ('Nankana Sahib','nankana-sahib'), ('Mandi Bahauddin','mandi-bahauddin'),
  ('Lodhran','lodhran'), ('Muzaffargarh','muzaffargarh'), ('Layyah','layyah'),
  ('Bhakkar','bhakkar'), ('Bahawalnagar','bahawalnagar')
) AS d(name, slug) ON TRUE
WHERE p.slug = 'punjab'
ON CONFLICT DO NOTHING;

-- SINDH
INSERT INTO districts (province_id, name, slug)
SELECT p.id, d.name, d.slug FROM provinces p
JOIN (VALUES
  ('Karachi','karachi'), ('Hyderabad','hyderabad'), ('Sukkur','sukkur'),
  ('Larkana','larkana'), ('Nawabshah','nawabshah'), ('Mirpurkhas','mirpurkhas'),
  ('Jacobabad','jacobabad'), ('Shikarpur','shikarpur'), ('Khairpur','khairpur'),
  ('Sanghar','sanghar'), ('Badin','badin'), ('Thatta','thatta'),
  ('Dadu','dadu'), ('Ghotki','ghotki'), ('Kashmore','kashmore'),
  ('Tando Allahyar','tando-allahyar'), ('Tando Muhammad Khan','tando-muhammad-khan'),
  ('Matiari','matiari'), ('Umerkot','umerkot'), ('Tharparkar','tharparkar'),
  ('Kambar Shahdadkot','kambar-shahdadkot')
) AS d(name, slug) ON TRUE
WHERE p.slug = 'sindh'
ON CONFLICT DO NOTHING;

-- KHYBER PAKHTUNKHWA
INSERT INTO districts (province_id, name, slug)
SELECT p.id, d.name, d.slug FROM provinces p
JOIN (VALUES
  ('Peshawar','peshawar'), ('Mardan','mardan'), ('Abbottabad','abbottabad'),
  ('Swat','swat'), ('Dera Ismail Khan','dera-ismail-khan'), ('Kohat','kohat'),
  ('Bannu','bannu'), ('Haripur','haripur'), ('Nowshera','nowshera'),
  ('Charsadda','charsadda'), ('Mansehra','mansehra'), ('Swabi','swabi'),
  ('Buner','buner'), ('Shangla','shangla'), ('Lakki Marwat','lakki-marwat'),
  ('Tank','tank'), ('Hangu','hangu'), ('Karak','karak'),
  ('Chitral','chitral'), ('Lower Dir','lower-dir'), ('Upper Dir','upper-dir'),
  ('Malakand','malakand'), ('Battagram','battagram'), ('Tor Ghar','tor-ghar')
) AS d(name, slug) ON TRUE
WHERE p.slug = 'khyber-pakhtunkhwa'
ON CONFLICT DO NOTHING;

-- BALOCHISTAN
INSERT INTO districts (province_id, name, slug)
SELECT p.id, d.name, d.slug FROM provinces p
JOIN (VALUES
  ('Quetta','quetta'), ('Turbat','turbat'), ('Khuzdar','khuzdar'),
  ('Gwadar','gwadar'), ('Chaman','chaman'), ('Zhob','zhob'),
  ('Loralai','loralai'), ('Sibi','sibi'), ('Mastung','mastung'),
  ('Kalat','kalat'), ('Panjgur','panjgur'), ('Nushki','nushki'),
  ('Kharan','kharan'), ('Lasbela','lasbela'), ('Pishin','pishin'),
  ('Killa Abdullah','killa-abdullah'), ('Killa Saifullah','killa-saifullah'), ('Washuk','washuk'),
  ('Awaran','awaran'), ('Naseerabad','naseerabad'), ('Jaffarabad','jaffarabad'),
  ('Dera Bugti','dera-bugti'), ('Musakhel','musakhel'), ('Barkhan','barkhan'),
  ('Sherani','sherani'), ('Ziarat','ziarat'), ('Harnai','harnai'),
  ('Jhal Magsi','jhal-magsi'), ('Sohbatpur','sohbatpur')
) AS d(name, slug) ON TRUE
WHERE p.slug = 'balochistan'
ON CONFLICT DO NOTHING;

-- ISLAMABAD CAPITAL TERRITORY
INSERT INTO districts (province_id, name, slug)
SELECT p.id, d.name, d.slug FROM provinces p
JOIN (VALUES ('Islamabad','islamabad')) AS d(name, slug) ON TRUE
WHERE p.slug = 'islamabad-capital-territory'
ON CONFLICT DO NOTHING;

-- GILGIT-BALTISTAN
INSERT INTO districts (province_id, name, slug)
SELECT p.id, d.name, d.slug FROM provinces p
JOIN (VALUES
  ('Gilgit','gilgit'), ('Skardu','skardu'), ('Hunza','hunza'),
  ('Ghanche','ghanche'), ('Astore','astore'), ('Diamer','diamer'),
  ('Ghizer','ghizer'), ('Nagar','nagar'), ('Shigar','shigar'),
  ('Kharmang','kharmang')
) AS d(name, slug) ON TRUE
WHERE p.slug = 'gilgit-baltistan'
ON CONFLICT DO NOTHING;

-- AZAD JAMMU & KASHMIR
INSERT INTO districts (province_id, name, slug)
SELECT p.id, d.name, d.slug FROM provinces p
JOIN (VALUES
  ('Muzaffarabad','muzaffarabad'), ('Mirpur','mirpur-ajk'), ('Rawalakot (Poonch)','rawalakot-poonch'),
  ('Kotli','kotli'), ('Bhimber','bhimber'), ('Bagh','bagh'),
  ('Haveli','haveli'), ('Neelum','neelum'), ('Sudhnoti','sudhnoti'),
  ('Hattian Bala','hattian-bala')
) AS d(name, slug) ON TRUE
WHERE p.slug = 'azad-jammu-kashmir'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8. SEED DATA — CITIES (main city per district, coords for major metros)
-- ============================================================================

-- Cities for every Punjab district (coords for major metros)
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, c.name, c.slug, c.lat, c.lng
FROM districts d
JOIN (VALUES
  ('lahore','Lahore',31.5204,74.3587),
  ('rawalpindi','Rawalpindi',33.5651,73.0169),
  ('faisalabad','Faisalabad',31.4504,73.1350),
  ('multan','Multan',30.1575,71.5249),
  ('gujranwala','Gujranwala',32.1877,74.1945),
  ('sialkot','Sialkot',32.4945,74.5229),
  ('bahawalpur','Bahawalpur',29.3956,71.6836),
  ('sargodha','Sargodha',32.0836,72.6711),
  ('gujrat','Gujrat',32.5740,74.0754),
  ('sheikhupura','Sheikhupura',31.7131,73.9850),
  ('rahim-yar-khan','Rahim Yar Khan',28.4202,70.2952),
  ('sahiwal-punjab','Sahiwal',30.6682,73.1114),
  ('kasur','Kasur',31.1167,74.4500),
  ('okara','Okara',30.8081,73.4458),
  ('jhang','Jhang',31.2681,72.3181),
  ('dera-ghazi-khan','Dera Ghazi Khan',30.0561,70.6348),
  ('mianwali','Mianwali',32.5853,71.5436),
  ('chiniot','Chiniot',31.7200,72.9789),
  ('khanewal','Khanewal',30.3017,71.9321),
  ('hafizabad','Hafizabad',32.0709,73.6880),
  ('attock','Attock',33.7660,72.3609),
  ('jhelum','Jhelum',32.9345,73.7310),
  ('chakwal','Chakwal',32.9328,72.8556),
  ('narowal','Narowal',32.1000,74.8833),
  ('vehari','Vehari',30.0452,72.3489),
  ('khushab','Khushab',32.2967,72.3525),
  ('pakpattan','Pakpattan',30.3410,73.3866),
  ('toba-tek-singh','Toba Tek Singh',30.9712,72.4827),
  ('nankana-sahib','Nankana Sahib',31.4475,73.6972),
  ('mandi-bahauddin','Mandi Bahauddin',32.5861,73.4917),
  ('lodhran','Lodhran',29.5339,71.6324),
  ('muzaffargarh','Muzaffargarh',30.0703,71.1933),
  ('layyah','Layyah',30.9647,70.9399),
  ('bhakkar','Bhakkar',31.6082,71.0854),
  ('bahawalnagar','Bahawalnagar',30.0000,73.2500)
) AS c(slug, name, lat, lng) ON c.slug = d.slug
WHERE d.province_id = (SELECT id FROM provinces WHERE slug = 'punjab')
ON CONFLICT DO NOTHING;

-- Sindh cities
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, c.name, c.slug, c.lat, c.lng
FROM districts d
JOIN (VALUES
  ('karachi','Karachi',24.8607,67.0011),
  ('hyderabad','Hyderabad',25.3960,68.3578),
  ('sukkur','Sukkur',27.7058,68.8574),
  ('larkana','Larkana',27.5590,68.2120),
  ('nawabshah','Nawabshah',26.2442,68.4100),
  ('mirpurkhas','Mirpurkhas',25.5276,69.0126),
  ('jacobabad','Jacobabad',28.2769,68.4514),
  ('shikarpur','Shikarpur',27.9556,68.6382),
  ('khairpur','Khairpur',27.5295,68.7592),
  ('sanghar','Sanghar',26.0469,68.9489),
  ('badin','Badin',24.6560,68.8387),
  ('thatta','Thatta',24.7475,67.9240),
  ('dadu','Dadu',26.7303,67.7765),
  ('ghotki','Ghotki',28.0062,69.3165),
  ('kashmore','Kashmore',28.4333,69.5833),
  ('tando-allahyar','Tando Allahyar',25.4605,68.7192),
  ('tando-muhammad-khan','Tando Muhammad Khan',25.1239,68.5363),
  ('matiari','Matiari',25.5972,68.4467),
  ('umerkot','Umerkot',25.3633,69.7417),
  ('tharparkar','Mithi (Tharparkar)',24.7370,69.7981),
  ('kambar-shahdadkot','Kambar Shahdadkot',27.5900,67.9000)
) AS c(slug, name, lat, lng) ON c.slug = d.slug
WHERE d.province_id = (SELECT id FROM provinces WHERE slug = 'sindh')
ON CONFLICT DO NOTHING;

-- KPK cities
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, c.name, c.slug, c.lat, c.lng
FROM districts d
JOIN (VALUES
  ('peshawar','Peshawar',34.0151,71.5249),
  ('mardan','Mardan',34.1986,72.0404),
  ('abbottabad','Abbottabad',34.1688,73.2215),
  ('swat','Mingora (Swat)',34.7717,72.3600),
  ('dera-ismail-khan','Dera Ismail Khan',31.8313,70.9017),
  ('kohat','Kohat',33.5869,71.4414),
  ('bannu','Bannu',32.9889,70.6056),
  ('haripur','Haripur',33.9946,72.9106),
  ('nowshera','Nowshera',34.0106,71.9876),
  ('charsadda','Charsadda',34.1437,71.7433),
  ('mansehra','Mansehra',34.3338,73.1969),
  ('swabi','Swabi',34.1201,72.4698),
  ('buner','Daggar (Buner)',34.5111,72.4842),
  ('shangla','Alpuri (Shangla)',34.9000,72.6500),
  ('lakki-marwat','Lakki Marwat',32.6078,70.9114),
  ('tank','Tank',32.2203,70.3793),
  ('hangu','Hangu',33.5311,71.0593),
  ('karak','Karak',33.1163,71.0948),
  ('chitral','Chitral',35.8510,71.7864),
  ('lower-dir','Timergara (Lower Dir)',34.8283,71.8406),
  ('upper-dir','Dir (Upper Dir)',35.2061,71.8776),
  ('malakand','Batkhela (Malakand)',34.6167,71.9717),
  ('battagram','Battagram',34.6781,73.0236),
  ('tor-ghar','Judbah (Tor Ghar)',34.6333,72.8000)
) AS c(slug, name, lat, lng) ON c.slug = d.slug
WHERE d.province_id = (SELECT id FROM provinces WHERE slug = 'khyber-pakhtunkhwa')
ON CONFLICT DO NOTHING;

-- Balochistan cities
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, c.name, c.slug, c.lat, c.lng
FROM districts d
JOIN (VALUES
  ('quetta','Quetta',30.1798,66.9750),
  ('turbat','Turbat',25.9925,63.0718),
  ('khuzdar','Khuzdar',27.7384,66.6434),
  ('gwadar','Gwadar',25.1264,62.3225),
  ('chaman','Chaman',30.9177,66.4525),
  ('zhob','Zhob',31.3417,69.4481),
  ('loralai','Loralai',30.3705,68.5980),
  ('sibi','Sibi',29.5448,67.8764),
  ('mastung','Mastung',29.7997,66.8455),
  ('kalat','Kalat',29.0266,66.5936),
  ('panjgur','Panjgur',26.9644,64.0903),
  ('nushki','Nushki',29.5542,66.0214),
  ('kharan','Kharan',28.5833,65.4167),
  ('lasbela','Uthal (Lasbela)',25.8072,66.6219),
  ('pishin','Pishin',30.5803,66.9961),
  ('killa-abdullah','Killa Abdullah',30.6978,66.6400),
  ('killa-saifullah','Killa Saifullah',30.7000,68.3667),
  ('washuk','Washuk',27.8500,64.9167),
  ('awaran','Awaran',26.4568,65.2314),
  ('naseerabad','Dera Murad Jamali',28.5467,68.2231),
  ('jaffarabad','Dera Allah Yar',28.3733,68.3500),
  ('dera-bugti','Dera Bugti',29.0361,69.1500),
  ('musakhel','Musakhel',30.8500,69.8333),
  ('barkhan','Barkhan',29.8978,69.5258),
  ('sherani','Sherani',31.9333,69.2833),
  ('ziarat','Ziarat',30.3833,67.7333),
  ('harnai','Harnai',30.1000,67.9333),
  ('jhal-magsi','Gandava (Jhal Magsi)',28.6128,67.4869),
  ('sohbatpur','Sohbatpur',28.3000,68.5500)
) AS c(slug, name, lat, lng) ON c.slug = d.slug
WHERE d.province_id = (SELECT id FROM provinces WHERE slug = 'balochistan')
ON CONFLICT DO NOTHING;

-- ICT
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, 'Islamabad', 'islamabad', 33.6844, 73.0479
FROM districts d
WHERE d.slug = 'islamabad'
  AND d.province_id = (SELECT id FROM provinces WHERE slug = 'islamabad-capital-territory')
ON CONFLICT DO NOTHING;

-- Gilgit-Baltistan cities
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, c.name, c.slug, c.lat, c.lng
FROM districts d
JOIN (VALUES
  ('gilgit','Gilgit',35.9208,74.3144),
  ('skardu','Skardu',35.2971,75.6337),
  ('hunza','Karimabad (Hunza)',36.3167,74.6500),
  ('ghanche','Khaplu (Ghanche)',35.1603,76.3319),
  ('astore','Eidgah (Astore)',35.3667,74.8500),
  ('diamer','Chilas (Diamer)',35.4167,74.1000),
  ('ghizer','Gahkuch (Ghizer)',36.1833,73.7667),
  ('nagar','Nagar Proper',36.2667,74.5167),
  ('shigar','Shigar',35.4333,75.7333),
  ('kharmang','Tolti (Kharmang)',34.9667,76.1667)
) AS c(slug, name, lat, lng) ON c.slug = d.slug
WHERE d.province_id = (SELECT id FROM provinces WHERE slug = 'gilgit-baltistan')
ON CONFLICT DO NOTHING;

-- AJK cities
INSERT INTO cities (district_id, province_id, name, slug, latitude, longitude)
SELECT d.id, d.province_id, c.name, c.slug, c.lat, c.lng
FROM districts d
JOIN (VALUES
  ('muzaffarabad','Muzaffarabad',34.3700,73.4711),
  ('mirpur-ajk','Mirpur',33.1482,73.7516),
  ('rawalakot-poonch','Rawalakot',33.8578,73.7604),
  ('kotli','Kotli',33.5167,73.9167),
  ('bhimber','Bhimber',32.9746,74.0786),
  ('bagh','Bagh',33.9811,73.7761),
  ('haveli','Forward Kahuta (Haveli)',33.9500,73.9833),
  ('neelum','Athmuqam (Neelum)',34.5833,73.9000),
  ('sudhnoti','Palandri (Sudhnoti)',33.7167,73.6833),
  ('hattian-bala','Hattian Bala',34.1691,73.7428)
) AS c(slug, name, lat, lng) ON c.slug = d.slug
WHERE d.province_id = (SELECT id FROM provinces WHERE slug = 'azad-jammu-kashmir')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 9. REALTIME — enable for chat & notifications
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END $$;

-- ============================================================================
-- DONE. Next steps (manual):
-- 1. Create your admin user (sign up in the app), then run:
--      UPDATE profiles SET role = 'admin' WHERE email = 'you@example.com';
-- 2. Set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in Vercel env vars.
-- ============================================================================
