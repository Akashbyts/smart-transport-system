CREATE TABLE IF NOT EXISTS driver_verification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID UNIQUE NOT NULL REFERENCES drivers(id),
  license_number VARCHAR(50) NOT NULL,
  license_expiry DATE NOT NULL,
  id_card_number VARCHAR(50) NOT NULL,
  license_image VARCHAR(255),
  id_card_image VARCHAR(255),
  selfie_image VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  rejection_reason TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP
);

CREATE INDEX idx_driver_verification_driver ON driver_verification(driver_id);
CREATE INDEX idx_driver_verification_status ON driver_verification(status);