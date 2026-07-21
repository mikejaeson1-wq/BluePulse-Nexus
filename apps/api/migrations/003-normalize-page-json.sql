UPDATE pages
SET blocks = '[]'::JSONB
WHERE
    JSONB_TYPEOF(blocks)
    IS DISTINCT FROM 'array';

UPDATE pages
SET theme = '{}'::JSONB
WHERE
    JSONB_TYPEOF(theme)
    IS DISTINCT FROM 'object';

UPDATE page_versions
SET snapshot = '{}'::JSONB
WHERE
    JSONB_TYPEOF(snapshot)
    IS DISTINCT FROM 'object';

UPDATE page_versions
SET snapshot =
    JSONB_SET(
        snapshot,
        '{blocks}',
        '[]'::JSONB,
        TRUE
    )
WHERE
    JSONB_TYPEOF(
        snapshot -> 'blocks'
    )
    IS DISTINCT FROM 'array';

UPDATE page_versions
SET snapshot =
    JSONB_SET(
        snapshot,
        '{theme}',
        '{}'::JSONB,
        TRUE
    )
WHERE
    JSONB_TYPEOF(
        snapshot -> 'theme'
    )
    IS DISTINCT FROM 'object';

INSERT INTO system_meta (
    key,
    value
)
VALUES (
    'schema_version',
    '3'
)
ON CONFLICT (key)
DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();