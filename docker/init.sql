-- ============================================================
-- Marketplace1 – database schema (local development)
-- Run automatically by the postgres Docker container on first start.
-- ============================================================

-- ── ENUMs ────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('CLIENT','VENDOR','ADMIN','LIVREUR');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('IN_PROGRESS','PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED','RETURNED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE pay_method AS ENUM ('CASH','CARD','BANK_TRANSFER','MOBILE_PAYMENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE pay_status AS ENUM ('PENDING','COMPLETED','FAILED','REFUNDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE biz_role AS ENUM ('VENDOR','LIVREUR');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE biz_status AS ENUM ('PENDING','APPROVED','REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── TABLES ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS utilisateurs (
  id_utilisateur  SERIAL PRIMARY KEY,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password        VARCHAR(255) NOT NULL,
  username        VARCHAR(100) UNIQUE NOT NULL,
  adresse         TEXT,
  phone_number    VARCHAR(20),
  role            user_role NOT NULL DEFAULT 'CLIENT',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id_categorie  SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  id_parent     INTEGER REFERENCES categories(id_categorie),
  "Description" TEXT
);

CREATE TABLE IF NOT EXISTS market (
  id_market       SERIAL PRIMARY KEY,
  id_utilisateur  INTEGER NOT NULL REFERENCES utilisateurs(id_utilisateur),
  name            VARCHAR(255) NOT NULL,
  description     TEXT
);

CREATE TABLE IF NOT EXISTS produits (
  id_produit    SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  price         FLOAT NOT NULL,
  stock         INTEGER DEFAULT 0,
  description   TEXT,
  id_market     INTEGER NOT NULL REFERENCES market(id_market),
  id_categorie  INTEGER NOT NULL REFERENCES categories(id_categorie),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id_order          SERIAL PRIMARY KEY,
  id_utilisateur    INTEGER NOT NULL REFERENCES utilisateurs(id_utilisateur),
  total_prix        DECIMAL(10,2) NOT NULL CHECK (total_prix >= 0),
  statut            order_status NOT NULL DEFAULT 'IN_PROGRESS',
  items             JSONB NOT NULL DEFAULT '[]',
  shipping_address  TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  finished_statut_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS cart (
  id_cart         SERIAL PRIMARY KEY,
  id_utilisateur  INTEGER NOT NULL REFERENCES utilisateurs(id_utilisateur),
  id_produit      INTEGER NOT NULL REFERENCES produits(id_produit),
  quantity        INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS payments (
  id_payment      SERIAL PRIMARY KEY,
  id_order        INTEGER NOT NULL REFERENCES orders(id_order),
  amount          DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  payment_method  pay_method NOT NULL DEFAULT 'CASH',
  payment_status  pay_status NOT NULL DEFAULT 'PENDING',
  transaction_id  VARCHAR(255) UNIQUE,
  payment_date    TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS business_account_requests (
  id              SERIAL PRIMARY KEY,
  email           VARCHAR(255) NOT NULL,
  username        VARCHAR(255) NOT NULL,
  phone_number    VARCHAR(50) NOT NULL,
  company_name    VARCHAR(255) NOT NULL,
  requested_role  biz_role NOT NULL DEFAULT 'VENDOR',
  description     TEXT,
  address         TEXT,
  tax_number      VARCHAR(100),
  status          biz_status NOT NULL DEFAULT 'PENDING',
  submitted_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── SEED DATA ─────────────────────────────────────────────────
-- Admin user  →  email: admin@marketplace.local  /  password: Marketplace1!
INSERT INTO utilisateurs (email, password, username, role)
VALUES (
  'admin@marketplace.local',
  '$2b$10$XIawTkJMWhSPqs/k.y1FHOQRfe/6swm/r9BO8pritBPdLkofNm1ua',
  'admin',
  'ADMIN'
) ON CONFLICT DO NOTHING;

-- Demo category
INSERT INTO categories (name, "Description")
VALUES ('Général', 'Catégorie générale')
ON CONFLICT DO NOTHING;
