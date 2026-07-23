CREATE TABLE IF NOT EXISTS contact_messages (
    id BIGSERIAL PRIMARY KEY,

    sender_name TEXT NOT NULL,

    sender_email TEXT NOT NULL,

    subject TEXT NOT NULL,

    message TEXT NOT NULL,

    status TEXT NOT NULL
        DEFAULT 'new',

    read_at TIMESTAMPTZ,

    responded_at TIMESTAMPTZ,

    internal_note TEXT,

    privacy_accepted_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    source_path TEXT,

    user_agent TEXT,

    ip_hash CHAR(64),

    last_updated_by_user_id UUID,

    last_updated_by_name TEXT,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    CONSTRAINT contact_messages_sender_name_length
        CHECK (
            LENGTH(
                TRIM(sender_name)
            ) BETWEEN 2 AND 120
        ),

    CONSTRAINT contact_messages_sender_email_length
        CHECK (
            LENGTH(
                TRIM(sender_email)
            ) BETWEEN 3 AND 254
        ),

    CONSTRAINT contact_messages_subject_length
        CHECK (
            LENGTH(
                TRIM(subject)
            ) BETWEEN 3 AND 180
        ),

    CONSTRAINT contact_messages_message_length
        CHECK (
            LENGTH(
                TRIM(message)
            ) BETWEEN 20 AND 5000
        ),

    CONSTRAINT contact_messages_status_allowed
        CHECK (
            status IN (
                'new',
                'in_progress',
                'answered',
                'closed',
                'spam'
            )
        ),

    CONSTRAINT contact_messages_internal_note_length
        CHECK (
            internal_note IS NULL OR
            LENGTH(internal_note) <= 10000
        ),

    CONSTRAINT contact_messages_source_path_length
        CHECK (
            source_path IS NULL OR
            LENGTH(source_path) <= 500
        ),

    CONSTRAINT contact_messages_user_agent_length
        CHECK (
            user_agent IS NULL OR
            LENGTH(user_agent) <= 1000
        ),

    CONSTRAINT contact_messages_ip_hash_format
        CHECK (
            ip_hash IS NULL OR
            ip_hash ~ '^[0-9a-f]{64}$'
        )
);

CREATE INDEX IF NOT EXISTS
    contact_messages_created_at_index
ON contact_messages (
    created_at DESC,
    id DESC
);

CREATE INDEX IF NOT EXISTS
    contact_messages_status_index
ON contact_messages (
    status,
    created_at DESC
);

CREATE INDEX IF NOT EXISTS
    contact_messages_unread_index
ON contact_messages (
    created_at DESC
)
WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS
    contact_messages_email_index
ON contact_messages (
    sender_email,
    created_at DESC
);

CREATE INDEX IF NOT EXISTS
    contact_messages_ip_hash_index
ON contact_messages (
    ip_hash,
    created_at DESC
)
WHERE ip_hash IS NOT NULL;

CREATE OR REPLACE FUNCTION
    bluepulse_touch_contact_message_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS
    contact_messages_touch_updated_at
ON contact_messages;

CREATE TRIGGER
    contact_messages_touch_updated_at
BEFORE UPDATE
ON contact_messages
FOR EACH ROW
EXECUTE FUNCTION
    bluepulse_touch_contact_message_updated_at();

INSERT INTO system_meta (
    key,
    value
)
VALUES (
    'schema_version',
    '7'
)
ON CONFLICT (key)
DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();
