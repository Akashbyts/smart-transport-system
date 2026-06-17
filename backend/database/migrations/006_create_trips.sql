CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES drivers(id),
  bus_id UUID NOT NULL REFERENCES buses(id),
  route_id UUID NOT NULL REFERENCES routes(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trips_driver ON trips(driver_id);
CREATE INDEX idx_trips_bus ON trips(bus_id);
CREATE INDEX idx_trips_route ON trips(route_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_started ON trips(started_at);