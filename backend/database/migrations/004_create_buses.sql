CREATE TABLE IF NOT EXISTS buses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bus_number VARCHAR(20) UNIQUE NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 50,
  model VARCHAR(100),
  year INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_buses_number ON buses(bus_number);
CREATE INDEX idx_buses_active ON buses(is_active);