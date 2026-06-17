CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_number VARCHAR(20) UNIQUE NOT NULL,
  route_name VARCHAR(200) NOT NULL,
  start_location VARCHAR(200) NOT NULL,
  end_location VARCHAR(200) NOT NULL,
  stops JSONB DEFAULT '[]',
  estimated_duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_routes_number ON routes(route_number);
CREATE INDEX idx_routes_active ON routes(is_active);
CREATE INDEX idx_routes_stops ON routes USING gin(stops);