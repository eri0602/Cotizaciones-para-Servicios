-- ============================================
-- PLATAFORMA DE COTIZACIONES - SQL COMPLETO
-- Base de datos PostgreSQL para Supabase
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('CLIENT', 'PROVIDER', 'ADMIN');

CREATE TYPE request_urgency AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

CREATE TYPE request_status AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED');

CREATE TYPE proposal_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'FAILED');

CREATE TYPE subscription_plan AS ENUM ('BASIC', 'PREMIUM', 'ENTERPRISE');

CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED');

-- ============================================
-- TABLA: USERS
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'CLIENT',
    phone VARCHAR(20),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- TABLA: USER_PROFILES
-- ============================================

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Peru',
    zip_code VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- ============================================
-- TABLA: PROVIDER_PROFILES
-- ============================================

CREATE TABLE provider_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(200) NOT NULL,
    description TEXT,
    years_experience INTEGER NOT NULL DEFAULT 0,
    avatar_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Peru',
    service_radius INTEGER NOT NULL DEFAULT 50,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    premium_until TIMESTAMP,
    rating_average DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    total_reviews INTEGER NOT NULL DEFAULT 0,
    total_jobs_completed INTEGER NOT NULL DEFAULT 0,
    response_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    response_time_hours DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    stripe_account_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_provider_profiles_user_id ON provider_profiles(user_id);
CREATE INDEX idx_provider_profiles_city ON provider_profiles(city);
CREATE INDEX idx_provider_profiles_rating ON provider_profiles(rating_average DESC);

-- ============================================
-- TABLA: CATEGORIES
-- ============================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);

-- ============================================
-- TABLA: SERVICES_OFFERED
-- ============================================

CREATE TABLE services_offered (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(provider_id, category_id)
);

CREATE INDEX idx_services_offered_provider_id ON services_offered(provider_id);
CREATE INDEX idx_services_offered_category_id ON services_offered(category_id);

-- ============================================
-- TABLA: REQUESTS
-- ============================================

CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    budget_min DECIMAL(10, 2),
    budget_max DECIMAL(10, 2),
    currency VARCHAR(3) NOT NULL DEFAULT 'PEN',
    deadline TIMESTAMP,
    urgency request_urgency,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Peru',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status request_status NOT NULL DEFAULT 'OPEN',
    proposals_count INTEGER NOT NULL DEFAULT 0,
    views_count INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_requests_client_id ON requests(client_id);
CREATE INDEX idx_requests_category_id ON requests(category_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX idx_requests_city ON requests(city);

-- ============================================
-- TABLA: REQUEST_IMAGES
-- ============================================

CREATE TABLE request_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_request_images_request_id ON request_images(request_id);

-- ============================================
-- TABLA: REQUEST_PROPOSALS
-- ============================================

CREATE TABLE request_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'PEN',
    estimated_days INTEGER,
    message TEXT NOT NULL,
    status proposal_status NOT NULL DEFAULT 'PENDING',
    is_highlighted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(request_id, provider_id)
);

CREATE INDEX idx_request_proposals_request_id ON request_proposals(request_id);
CREATE INDEX idx_request_proposals_provider_id ON request_proposals(provider_id);
CREATE INDEX idx_request_proposals_status ON request_proposals(status);

-- ============================================
-- TABLA: PORTFOLIO_ITEMS
-- ============================================

CREATE TABLE portfolio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portfolio_items_provider_id ON portfolio_items(provider_id);

-- ============================================
-- TABLA: CERTIFICATIONS
-- ============================================

CREATE TABLE certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    issuer VARCHAR(200),
    issue_date TIMESTAMP,
    expiry_date TIMESTAMP,
    certificate_url VARCHAR(500),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_certifications_provider_id ON certifications(provider_id);

-- ============================================
-- TABLA: TRANSACTIONS
-- ============================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL UNIQUE REFERENCES requests(id) ON DELETE RESTRICT,
    proposal_id UUID NOT NULL UNIQUE REFERENCES request_proposals(id) ON DELETE RESTRICT,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE RESTRICT,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'PEN',
    platform_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    provider_earnings DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status payment_status NOT NULL DEFAULT 'PENDING',
    stripe_payment_id VARCHAR(255),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_client_id ON transactions(client_id);
CREATE INDEX idx_transactions_provider_id ON transactions(provider_id);
CREATE INDEX idx_transactions_payment_status ON transactions(payment_status);

-- ============================================
-- TABLA: REVIEWS
-- ============================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_transaction_id ON reviews(transaction_id);

-- ============================================
-- TABLA: CHAT_CONVERSATIONS
-- ============================================

CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    proposal_id UUID REFERENCES request_proposals(id) ON DELETE CASCADE,
    participant_1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant_2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(request_id, participant_1_id, participant_2_id)
);

CREATE INDEX idx_chat_conversations_participants ON chat_conversations(participant_1_id, participant_2_id);
CREATE INDEX idx_chat_conversations_request_id ON chat_conversations(request_id);

-- ============================================
-- TABLA: CHAT_MESSAGES
-- ============================================

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- ============================================
-- TABLA: NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ============================================
-- TABLA: SUBSCRIPTIONS
-- ============================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    plan_type subscription_plan NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'PEN',
    status subscription_status NOT NULL DEFAULT 'ACTIVE',
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_provider_id ON subscriptions(provider_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- TABLA: SAVED_REQUESTS
-- ============================================

CREATE TABLE saved_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(provider_id, request_id)
);

CREATE INDEX idx_saved_requests_provider_id ON saved_requests(provider_id);

-- ============================================
-- TRIGGER: UPDATE UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_profiles_updated_at
    BEFORE UPDATE ON provider_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_request_proposals_updated_at
    BEFORE UPDATE ON request_proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función para actualizar el rating promedio del proveedor
CREATE OR REPLACE FUNCTION update_provider_rating_from_review()
RETURNS TRIGGER AS $$
DECLARE
    v_provider_id UUID;
BEGIN
    -- Obtener el provider_id de la transacción
    SELECT t.provider_id INTO v_provider_id
    FROM transactions t
    WHERE t.id = NEW.transaction_id;

    -- Actualizar el rating del proveedor
    UPDATE provider_profiles pp
    SET 
        rating_average = (
            SELECT COALESCE(AVG(r.rating), 0)::decimal(3,2)
            FROM reviews r
            JOIN transactions tt ON r.transaction_id = tt.id
            WHERE tt.provider_id = v_provider_id
            AND r.is_visible = true
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews r
            JOIN transactions tt ON r.transaction_id = tt.id
            WHERE tt.provider_id = v_provider_id
            AND r.is_visible = true
        )
    WHERE pp.id = v_provider_id;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar rating cuando se crea/actualiza una review
CREATE TRIGGER update_rating_on_review
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_rating_from_review();

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de solicitudes con información del cliente
CREATE VIEW requests_with_client AS
SELECT 
    r.*,
    u.email as client_email,
    up.first_name as client_first_name,
    up.last_name as client_last_name,
    c.name as category_name
FROM requests r
JOIN users u ON r.client_id = u.id
JOIN user_profiles up ON u.id = up.user_id
JOIN categories c ON r.category_id = c.id;

-- Vista de propuestas con información del proveedor
CREATE VIEW proposals_with_provider AS
SELECT 
    rp.*,
    pp.business_name,
    pp.rating_average,
    pp.total_reviews,
    pp.years_experience,
    u.email as provider_email,
    up.first_name as provider_first_name,
    up.last_name as provider_last_name,
    r.title as request_title,
    r.client_id
FROM request_proposals rp
JOIN provider_profiles pp ON rp.provider_id = pp.id
JOIN users u ON pp.user_id = u.id
JOIN user_profiles up ON u.id = up.user_id
JOIN requests r ON rp.request_id = r.id;

-- Vista de transacciones con nombres
CREATE VIEW transactions_with_names AS
SELECT 
    t.*,
    r.title as request_title,
    pp.business_name as provider_name,
    client.email as client_email,
    provider_user.email as provider_email
FROM transactions t
JOIN requests r ON t.request_id = r.id
JOIN provider_profiles pp ON t.provider_id = pp.id
JOIN users client ON t.client_id = client.id
JOIN users provider_user ON pp.user_id = provider_user.id;

-- ============================================
-- DATOS INICIALES: CATEGORÍAS
-- ============================================

INSERT INTO categories (id, name, slug, description, icon_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Plomería', 'plomeria', 'Servicios de plomería y tuberías', '🔧'),
('22222222-2222-2222-2222-222222222222', 'Electricidad', 'electricidad', 'Servicios eléctricos y reparaciones', '⚡'),
('33333333-3333-3333-3333-333333333333', 'Carpintería', 'carpinteria', 'Trabajos en madera y muebles', '🪚'),
('44444444-4444-4444-4444-444444444444', 'Pintura', 'pintura', 'Pintura de interiores y exteriores', '🎨'),
('55555555-5555-5555-5555-555555555555', 'Limpieza', 'limpieza', 'Servicios de limpieza del hogar', '🧹'),
('66666666-6666-6666-6666-666666666666', 'Gasfitería', 'gasfiteria', 'Instalación y reparación de gas', '🔥'),
('77777777-7777-7777-7777-777777777777', 'Albañilería', 'albañileria', 'Trabajos de construcción y reparación', '🧱'),
('88888888-8888-8888-8888-888888888888', 'Jardinería', 'jardineria', 'Cuidados de jardín y paisajismo', '🌳');

-- ============================================
-- SEED DATA DE EJEMPLO
-- ============================================

-- Insertar usuario cliente de prueba
INSERT INTO users (id, email, password_hash, role, is_verified, phone)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'cliente@demo.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.dW8KIuJ3eHFfXe',
    'CLIENT',
    true,
    '+51 999 999 999'
);

INSERT INTO user_profiles (user_id, first_name, last_name, city, state, country)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Juan',
    'Pérez',
    'Lima',
    'Miraflores',
    'Peru'
);

-- Insertar usuario proveedor de prueba
INSERT INTO users (id, email, password_hash, role, is_verified, phone)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'proveedor@demo.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.dW8KIuJ3eHFfXe',
    'PROVIDER',
    true,
    '+51 988 888 888'
);

INSERT INTO user_profiles (user_id, first_name, last_name, city, state, country)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Carlos',
    'García',
    'Lima',
    'San Isidro',
    'Peru'
);

INSERT INTO provider_profiles (
    user_id, business_name, description, years_experience, 
    city, state, service_radius, rating_average, total_reviews, 
    total_jobs_completed, response_rate, is_premium
)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Servicios Generales Carlos',
    'Empresa con más de 15 años de experiencia en servicios del hogar. Especialistas en plomería, electricidad y reparaciones generales.',
    15,
    'Lima',
    'San Isidro',
    50,
    4.80,
    124,
    256,
    98.00,
    true
);

-- Insertar servicio ofrecido
INSERT INTO services_offered (provider_id, category_id)
SELECT 
    pp.id,
    c.id
FROM provider_profiles pp, categories c
WHERE pp.user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
AND c.slug = 'plomeria';

-- Insertar solicitud de ejemplo
INSERT INTO requests (
    id, client_id, category_id, title, description,
    budget_min, budget_max, urgency, city, state, address, status
)
SELECT 
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    u.id,
    c.id,
    'Instalación de grifería nueva en baño',
    'Necesito instalar una grifería nueva en el baño principal. Ya compré la grifería y solo necesito que la instalen correctamente. El baño está en el segundo piso. El trabajo incluye verificar las conexiones y asegurar que no haya fugas.',
    150.00,
    300.00,
    'MEDIUM',
    'Lima',
    'Miraflores',
    'Av. Larco 123, Departamento 502',
    'OPEN'
FROM users u, categories c
WHERE u.email = 'cliente@demo.com'
AND c.slug = 'plomeria';

-- ============================================
-- FIN DEL SQL
-- ============================================

-- NOTAS:
-- 1. Este SQL está diseñado para PostgreSQL 14+
-- 2. Para usar con Supabase, ejecútalo en el SQL Editor
-- 3. Las passwords hasheadas son para 'password123'
-- 4. Los UUIDs de seed son de ejemplo, gen_random_uuid() generará los reales para nuevas filas
