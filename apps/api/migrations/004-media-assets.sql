CREATE TABLE IF NOT EXISTS media_assets (
    id TEXT PRIMARY KEY,

    storage_key TEXT NOT NULL
        UNIQUE,

    name TEXT NOT NULL,

    original_name TEXT NOT NULL,

    mime_type TEXT NOT NULL,

    file_size BIGINT NOT NULL,

    width INTEGER,

    height INTEGER,

    alt_text TEXT NOT NULL
        DEFAULT '',

    caption TEXT NOT NULL
        DEFAULT '',

    checksum_sha256 TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    CONSTRAINT media_assets_name_not_empty
        CHECK (
            LENGTH(
                TRIM(name)
            ) > 0
        ),

    CONSTRAINT media_assets_original_name_not_empty
        CHECK (
            LENGTH(
                TRIM(original_name)
            ) > 0
        ),

    CONSTRAINT media_assets_file_size_positive
        CHECK (
            file_size > 0
        ),

    CONSTRAINT media_assets_width_positive
        CHECK (
            width IS NULL
            OR width > 0
        ),

    CONSTRAINT media_assets_height_positive
        CHECK (
            height IS NULL
            OR height > 0
        )
);

CREATE INDEX IF NOT EXISTS
    media_assets_created_at_index
ON media_assets (
    created_at DESC
);

CREATE INDEX IF NOT EXISTS
    media_assets_mime_type_index
ON media_assets (
    mime_type
);

DROP TRIGGER IF EXISTS
    media_assets_set_updated_at
ON media_assets;

CREATE TRIGGER
    media_assets_set_updated_at
BEFORE UPDATE
ON media_assets
FOR EACH ROW
EXECUTE FUNCTION
    bluepulse_set_updated_at();

INSERT INTO system_meta (
    key,
    value
)
VALUES (
    'schema_version',
    '4'
)
ON CONFLICT (key)
DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();