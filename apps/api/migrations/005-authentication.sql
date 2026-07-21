CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY
        DEFAULT gen_random_uuid(),

    username TEXT NOT NULL,
    email TEXT NOT NULL,
    display_name TEXT NOT NULL,

    password_hash TEXT NOT NULL,

    role TEXT NOT NULL
        DEFAULT 'editor',

    is_active BOOLEAN NOT NULL
        DEFAULT TRUE,

    last_login_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    CONSTRAINT users_username_not_empty
        CHECK (
            LENGTH(
                TRIM(username)
            ) > 0
        ),

    CONSTRAINT users_username_format
        CHECK (
            username ~
            '^[a-z0-9][a-z0-9._-]{2,39}$'
        ),

    CONSTRAINT users_email_not_empty
        CHECK (
            LENGTH(
                TRIM(email)
            ) > 0
        ),

    CONSTRAINT users_display_name_not_empty
        CHECK (
            LENGTH(
                TRIM(display_name)
            ) > 0
        ),

    CONSTRAINT users_role_allowed
        CHECK (
            role IN (
                'administrator',
                'editor',
                'media_manager'
            )
        )
);

CREATE UNIQUE INDEX IF NOT EXISTS
    users_username_unique_index
ON users (
    LOWER(username)
);

CREATE UNIQUE INDEX IF NOT EXISTS
    users_email_unique_index
ON users (
    LOWER(email)
);

CREATE INDEX IF NOT EXISTS
    users_role_index
ON users (
    role
);

CREATE INDEX IF NOT EXISTS
    users_active_index
ON users (
    is_active
);

DROP TRIGGER IF EXISTS
    users_set_updated_at
ON users;

CREATE TRIGGER
    users_set_updated_at
BEFORE UPDATE
ON users
FOR EACH ROW
EXECUTE FUNCTION
    bluepulse_set_updated_at();


CREATE TABLE IF NOT EXISTS auth_sessions (
    id UUID PRIMARY KEY
        DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    token_hash CHAR(64) NOT NULL
        UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,

    last_seen_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    user_agent TEXT,
    ip_address TEXT,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS
    auth_sessions_user_index
ON auth_sessions (
    user_id
);

CREATE INDEX IF NOT EXISTS
    auth_sessions_expiry_index
ON auth_sessions (
    expires_at
);

CREATE INDEX IF NOT EXISTS
    auth_sessions_last_seen_index
ON auth_sessions (
    last_seen_at DESC
);

INSERT INTO system_meta (
    key,
    value
)
VALUES (
    'schema_version',
    '5'
)
ON CONFLICT (key)
DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();