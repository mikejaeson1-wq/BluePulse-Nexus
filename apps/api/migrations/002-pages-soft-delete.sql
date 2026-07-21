ALTER TABLE pages
DROP CONSTRAINT IF EXISTS pages_slug_key;

CREATE UNIQUE INDEX IF NOT EXISTS
    pages_active_slug_unique
ON pages (
    slug
)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS
    pages_published_slug_index
ON pages (
    slug
)
WHERE
    status = 'published'
    AND deleted_at IS NULL;

INSERT INTO system_meta (
    key,
    value
)
VALUES (
    'schema_version',
    '2'
)
ON CONFLICT (key)
DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();