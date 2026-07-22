CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,

    actor_user_id UUID,

    actor_username TEXT,

    actor_display_name TEXT,

    actor_role TEXT,

    action TEXT NOT NULL,

    entity_type TEXT NOT NULL,

    entity_id TEXT,

    entity_label TEXT,

    summary TEXT NOT NULL,

    request_method TEXT NOT NULL,

    request_path TEXT NOT NULL,

    metadata JSONB NOT NULL
        DEFAULT '{}'::JSONB,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    CONSTRAINT audit_log_action_not_empty
        CHECK (
            LENGTH(
                TRIM(action)
            ) > 0
        ),

    CONSTRAINT audit_log_entity_type_not_empty
        CHECK (
            LENGTH(
                TRIM(entity_type)
            ) > 0
        ),

    CONSTRAINT audit_log_summary_not_empty
        CHECK (
            LENGTH(
                TRIM(summary)
            ) > 0
        ),

    CONSTRAINT audit_log_request_method_not_empty
        CHECK (
            LENGTH(
                TRIM(request_method)
            ) > 0
        ),

    CONSTRAINT audit_log_request_path_not_empty
        CHECK (
            LENGTH(
                TRIM(request_path)
            ) > 0
        )
);

CREATE INDEX IF NOT EXISTS
    audit_log_created_at_index
ON audit_log (
    created_at DESC
);

CREATE INDEX IF NOT EXISTS
    audit_log_actor_user_index
ON audit_log (
    actor_user_id,
    created_at DESC
);

CREATE INDEX IF NOT EXISTS
    audit_log_action_index
ON audit_log (
    action,
    created_at DESC
);

CREATE INDEX IF NOT EXISTS
    audit_log_entity_index
ON audit_log (
    entity_type,
    entity_id,
    created_at DESC
);

CREATE OR REPLACE FUNCTION
    bluepulse_prevent_audit_log_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION
        'Audit-Einträge dürfen nicht verändert oder gelöscht werden.';
END;
$$;

DROP TRIGGER IF EXISTS
    audit_log_prevent_update_or_delete
ON audit_log;

CREATE TRIGGER
    audit_log_prevent_update_or_delete
BEFORE UPDATE OR DELETE
ON audit_log
FOR EACH ROW
EXECUTE FUNCTION
    bluepulse_prevent_audit_log_mutation();

DROP TRIGGER IF EXISTS
    audit_log_prevent_truncate
ON audit_log;

CREATE TRIGGER
    audit_log_prevent_truncate
BEFORE TRUNCATE
ON audit_log
FOR EACH STATEMENT
EXECUTE FUNCTION
    bluepulse_prevent_audit_log_mutation();

INSERT INTO system_meta (
    key,
    value
)
VALUES (
    'schema_version',
    '6'
)
ON CONFLICT (key)
DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();