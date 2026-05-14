-- Remove tables that depend on projects before dropping it
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- CLIENTS (clientes das organizações Vertra)
CREATE TABLE clients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name            VARCHAR(255) NOT NULL,
    cnpj            VARCHAR(18) UNIQUE,
    email           VARCHAR(255),
    phone           VARCHAR(20),
    city            VARCHAR(100),
    state           VARCHAR(2),
    active          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at      TIMESTAMP WITH TIME ZONE
);

-- PROJECTS (projetos por cliente)
CREATE TABLE projects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID NOT NULL REFERENCES clients(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    status          VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    started_at      DATE,
    finished_at     DATE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at      TIMESTAMP WITH TIME ZONE
);

-- REPORTS (recriado para referenciar a nova projects)
CREATE TABLE reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    title           VARCHAR(255) NOT NULL,
    content         JSONB,
    status          VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    published_at    TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at      TIMESTAMP WITH TIME ZONE
);

-- ADDRESS_CACHE (cache geográfico para evitar chamadas duplicadas à API)
CREATE TABLE address_cache (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_address         TEXT NOT NULL,
    normalized_address  TEXT,
    latitude            DECIMAL(10, 8) NOT NULL,
    longitude           DECIMAL(11, 8) NOT NULL,
    source              VARCHAR(20) DEFAULT 'google_api' CHECK (source IN ('google_api', 'manual', 'imported')),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(raw_address)
);

-- SHIPMENT_RECORDS (base histórica de NFs por projeto)
CREATE TABLE shipment_records (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id          UUID NOT NULL REFERENCES projects(id),
    organization_id     UUID NOT NULL REFERENCES organizations(id),
    nf_number           VARCHAR(50),
    nf_date             DATE,
    nf_value            DECIMAL(15, 2),
    sender_name         VARCHAR(255),
    sender_city         VARCHAR(100),
    sender_state        VARCHAR(2),
    recipient_name      VARCHAR(255),
    recipient_address   TEXT,
    recipient_city      VARCHAR(100),
    recipient_state     VARCHAR(2),
    recipient_zipcode   VARCHAR(9),
    weight_kg           DECIMAL(10, 3),
    volume_m3           DECIMAL(10, 4),
    freight_value       DECIMAL(15, 2),
    freight_modality    VARCHAR(30) CHECK (freight_modality IN ('lotacao', 'fracionado_peso', 'fracionado_valor')),
    carrier_name        VARCHAR(255),
    delivery_deadline   INTEGER,
    delivery_date       DATE,
    latitude            DECIMAL(10, 8),
    longitude           DECIMAL(11, 8),
    geocoding_status    VARCHAR(20) DEFAULT 'pending' CHECK (geocoding_status IN ('pending', 'cached', 'api', 'imported', 'failed')),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÍNDICES
CREATE INDEX idx_clients_organization      ON clients(organization_id);
CREATE INDEX idx_projects_client           ON projects(client_id);
CREATE INDEX idx_projects_organization     ON projects(organization_id);
CREATE INDEX idx_reports_project           ON reports(project_id);
CREATE INDEX idx_reports_organization      ON reports(organization_id);
CREATE INDEX idx_address_cache_raw         ON address_cache(raw_address);
CREATE INDEX idx_shipments_project         ON shipment_records(project_id);
CREATE INDEX idx_shipments_organization    ON shipment_records(organization_id);
CREATE INDEX idx_shipments_geocoding       ON shipment_records(geocoding_status);
CREATE INDEX idx_shipments_nf_date         ON shipment_records(nf_date);

-- TRIGGERS DE updated_at
CREATE TRIGGER trg_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_shipments_updated_at
    BEFORE UPDATE ON shipment_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
