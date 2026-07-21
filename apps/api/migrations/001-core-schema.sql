CREATE TABLE IF NOT EXISTS system_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION bluepulse_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS site_content (
    content_key TEXT PRIMARY KEY,

    data JSONB NOT NULL
        DEFAULT '{}'::JSONB,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW()
);

DROP TRIGGER IF EXISTS
    site_content_set_updated_at
ON site_content;

CREATE TRIGGER
    site_content_set_updated_at
BEFORE UPDATE
ON site_content
FOR EACH ROW
EXECUTE FUNCTION
    bluepulse_set_updated_at();

CREATE TABLE IF NOT EXISTS site_navigation (
    id SMALLINT PRIMARY KEY
        DEFAULT 1,

    data JSONB NOT NULL
        DEFAULT '{}'::JSONB,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    CONSTRAINT site_navigation_singleton
        CHECK (id = 1)
);

DROP TRIGGER IF EXISTS
    site_navigation_set_updated_at
ON site_navigation;

CREATE TRIGGER
    site_navigation_set_updated_at
BEFORE UPDATE
ON site_navigation
FOR EACH ROW
EXECUTE FUNCTION
    bluepulse_set_updated_at();

CREATE TABLE IF NOT EXISTS home_layout (
    id SMALLINT PRIMARY KEY
        DEFAULT 1,

    data JSONB NOT NULL
        DEFAULT '{}'::JSONB,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    CONSTRAINT home_layout_singleton
        CHECK (id = 1)
);

DROP TRIGGER IF EXISTS
    home_layout_set_updated_at
ON home_layout;

CREATE TRIGGER
    home_layout_set_updated_at
BEFORE UPDATE
ON home_layout
FOR EACH ROW
EXECUTE FUNCTION
    bluepulse_set_updated_at();

CREATE TABLE IF NOT EXISTS footer_settings (
    id SMALLINT PRIMARY KEY
        DEFAULT 1,

    data JSONB NOT NULL
        DEFAULT '{}'::JSONB,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    CONSTRAINT footer_settings_singleton
        CHECK (id = 1)
);

DROP TRIGGER IF EXISTS
    footer_settings_set_updated_at
ON footer_settings;

CREATE TRIGGER
    footer_settings_set_updated_at
BEFORE UPDATE
ON footer_settings
FOR EACH ROW
EXECUTE FUNCTION
    bluepulse_set_updated_at();

CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY,

    title TEXT NOT NULL,

    slug TEXT NOT NULL UNIQUE,

    template TEXT NOT NULL
        DEFAULT 'blank',

    status TEXT NOT NULL
        DEFAULT 'draft',

    blocks JSONB NOT NULL
        DEFAULT '[]'::JSONB,

    theme JSONB NOT NULL
        DEFAULT '{}'::JSONB,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    published_at TIMESTAMPTZ,

    deleted_at TIMESTAMPTZ,

    CONSTRAINT pages_status_valid
        CHECK (
            status IN (
                'draft',
                'published'
            )
        ),

    CONSTRAINT pages_slug_not_empty
        CHECK (
            LENGTH(
                TRIM(slug)
            ) > 0
        )
);

CREATE INDEX IF NOT EXISTS
    pages_status_index
ON pages (
    status
);

CREATE INDEX IF NOT EXISTS
    pages_updated_at_index
ON pages (
    updated_at DESC
);

CREATE INDEX IF NOT EXISTS
    pages_deleted_at_index
ON pages (
    deleted_at
);

DROP TRIGGER IF EXISTS
    pages_set_updated_at
ON pages;

CREATE TRIGGER
    pages_set_updated_at
BEFORE UPDATE
ON pages
FOR EACH ROW
EXECUTE FUNCTION
    bluepulse_set_updated_at();

CREATE TABLE IF NOT EXISTS page_versions (
    id BIGSERIAL PRIMARY KEY,

    page_id TEXT NOT NULL
        REFERENCES pages(id)
        ON DELETE CASCADE,

    version_number INTEGER NOT NULL,

    snapshot JSONB NOT NULL,

    change_type TEXT NOT NULL
        DEFAULT 'save',

    created_by TEXT,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    CONSTRAINT page_versions_number_positive
        CHECK (
            version_number > 0
        ),

    CONSTRAINT page_versions_unique
        UNIQUE (
            page_id,
            version_number
        )
);

CREATE INDEX IF NOT EXISTS
    page_versions_page_index
ON page_versions (
    page_id,
    version_number DESC
);

INSERT INTO system_meta (
    key,
    value
)
VALUES (
    'application_name',
    'BluePulse Nexus'
)
ON CONFLICT (key)
DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();

INSERT INTO system_meta (
    key,
    value
)
VALUES (
    'schema_version',
    '1'
)
ON CONFLICT (key)
DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();

INSERT INTO site_navigation (
    id,
    data
)
VALUES (
    1,
    '{}'::JSONB
)
ON CONFLICT (id)
DO NOTHING;

INSERT INTO home_layout (
    id,
    data
)
VALUES (
    1,
    '{}'::JSONB
)
ON CONFLICT (id)
DO NOTHING;

INSERT INTO footer_settings (
    id,
    data
)
VALUES (
    1,
    '{}'::JSONB
)
ON CONFLICT (id)
DO NOTHING;