CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE cart_status AS ENUM ('OPEN', 'ORDERED');

CREATE TABLE IF NOT EXISTS carts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL,
  created_at DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at DATE NOT NULL DEFAULT CURRENT_DATE,
  status     cart_status NOT NULL DEFAULT 'OPEN'
);

CREATE TABLE IF NOT EXISTS cart_items (
  cart_id    UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  count      INTEGER NOT NULL DEFAULT 1,
  product    JSONB NOT NULL DEFAULT '{}',
  PRIMARY KEY (cart_id, product_id)
);

-- Test data
INSERT INTO carts (id, user_id, created_at, updated_at, status) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_DATE, CURRENT_DATE, 'OPEN'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', CURRENT_DATE, CURRENT_DATE, 'ORDERED');

INSERT INTO cart_items (cart_id, product_id, count) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 1),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 3);
