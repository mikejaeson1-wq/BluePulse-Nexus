import path from "node:path";

function normalizeText(
    value,
    fallback
) {
    const normalizedValue =
        String(
            value ?? ""
        ).trim();

    return normalizedValue ||
        fallback;
}

function normalizeInteger(
    value,
    fallback,
    {
        minimum = 1,
        maximum =
            Number.MAX_SAFE_INTEGER
    } = {}
) {
    const numericValue =
        Number.parseInt(
            String(
                value ?? ""
            ),
            10
        );

    if (
        !Number.isInteger(
            numericValue
        ) ||
        numericValue < minimum ||
        numericValue > maximum
    ) {
        return fallback;
    }

    return numericValue;
}

function normalizeBoolean(
    value,
    fallback
) {
    if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
    ) {
        return fallback;
    }

    const normalizedValue =
        String(value)
            .trim()
            .toLowerCase();

    if (
        [
            "1",
            "true",
            "yes",
            "on"
        ].includes(
            normalizedValue
        )
    ) {
        return true;
    }

    if (
        [
            "0",
            "false",
            "no",
            "off"
        ].includes(
            normalizedValue
        )
    ) {
        return false;
    }

    return fallback;
}

function normalizeUrl(
    value,
    fallback
) {
    return normalizeText(
        value,
        fallback
    ).replace(
        /\/+$/,
        ""
    );
}

const nodeEnvironment =
    normalizeText(
        process.env.NODE_ENV,
        "development"
    );

const production =
    nodeEnvironment ===
    "production";

const mediaStorageDirectory =
    path.resolve(
        normalizeText(
            process.env
                .MEDIA_STORAGE_DIR,
            "./storage/media"
        )
    );

const mailUser =
    normalizeText(
        process.env.MAIL_USER,
        ""
    );

export const runtimeConfig =
    Object.freeze({
        nodeEnvironment,

        production,

        host:
            normalizeText(
                process.env.API_HOST,
                "127.0.0.1"
            ),

        port:
            normalizeInteger(
                process.env.API_PORT,
                3001,
                {
                    minimum: 1,
                    maximum: 65535
                }
            ),

        applicationName:
            normalizeText(
                process.env.APP_NAME,
                "BluePulse Nexus API"
            ),

        applicationVersion:
            normalizeText(
                process.env.APP_VERSION,
                "0.3.0-alpha.0"
            ),

        publicUrl:
            normalizeUrl(
                process.env.APP_PUBLIC_URL,
                "http://127.0.0.1:5173"
            ),

        logLevel:
            normalizeText(
                process.env.LOG_LEVEL,
                production
                    ? "info"
                    : "debug"
            ),

        database: {
            url:
                normalizeText(
                    process.env.DATABASE_URL,
                    "postgresql://bluepulse:bluepulse_dev_change_me@127.0.0.1:5432/bluepulse_nexus"
                ),

            poolMaximum:
                normalizeInteger(
                    process.env
                        .DATABASE_POOL_MAX,
                    10,
                    {
                        minimum: 1,
                        maximum: 50
                    }
                ),

            connectionTimeoutMilliseconds:
                normalizeInteger(
                    process.env
                        .DATABASE_CONNECTION_TIMEOUT_MS,
                    5000,
                    {
                        minimum: 500,
                        maximum: 60000
                    }
                ),

            idleTimeoutMilliseconds:
                normalizeInteger(
                    process.env
                        .DATABASE_IDLE_TIMEOUT_MS,
                    30000,
                    {
                        minimum: 1000,
                        maximum: 300000
                    }
                )
        },

        media: {
            storageDirectory:
                mediaStorageDirectory,

            maximumFileSizeBytes:
                normalizeInteger(
                    process.env
                        .MEDIA_MAX_FILE_SIZE_BYTES,
                    15 * 1024 * 1024,
                    {
                        minimum:
                            1024,

                        maximum:
                            100 *
                            1024 *
                            1024
                    }
                ),

            allowedMimeTypes:
                Object.freeze([
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/gif",
                    "image/avif",
                    "application/pdf"
                ])
        },

        auth: {
            required:
                normalizeBoolean(
                    process.env
                        .AUTH_REQUIRED,
                    true
                ),

            cookieName:
                normalizeText(
                    process.env
                        .AUTH_COOKIE_NAME,
                    "bluepulse_nexus_session"
                ),

            secureCookie:
                normalizeBoolean(
                    process.env
                        .AUTH_COOKIE_SECURE,
                    production
                ),

            sessionTtlSeconds:
                normalizeInteger(
                    process.env
                        .AUTH_SESSION_TTL_SECONDS,
                    7 * 24 * 60 * 60,
                    {
                        minimum:
                            60 * 60,

                        maximum:
                            30 *
                            24 *
                            60 *
                            60
                    }
                )
        },

        contact: {
            rateLimitMaximum:
                normalizeInteger(
                    process.env
                        .CONTACT_RATE_LIMIT_MAX,
                    5,
                    {
                        minimum: 1,
                        maximum: 100
                    }
                ),

            rateLimitWindowMilliseconds:
                normalizeInteger(
                    process.env
                        .CONTACT_RATE_LIMIT_WINDOW_MS,
                    15 * 60 * 1000,
                    {
                        minimum:
                            10 * 1000,

                        maximum:
                            24 *
                            60 *
                            60 *
                            1000
                    }
                ),

            duplicateWindowSeconds:
                normalizeInteger(
                    process.env
                        .CONTACT_DUPLICATE_WINDOW_SECONDS,
                    60,
                    {
                        minimum: 1,
                        maximum: 3600
                    }
                ),

            ipHashSecret:
                normalizeText(
                    process.env
                        .CONTACT_IP_HASH_SECRET,
                    production
                        ? "change-this-contact-ip-hash-secret"
                        : "bluepulse-contact-development-secret"
                )
        },

        email: {
            enabled:
                normalizeBoolean(
                    process.env.MAIL_ENABLED,
                    false
                ),

            host:
                normalizeText(
                    process.env.MAIL_HOST,
                    "smtp.gmail.com"
                ),

            port:
                normalizeInteger(
                    process.env.MAIL_PORT,
                    465,
                    {
                        minimum: 1,
                        maximum: 65535
                    }
                ),

            secure:
                normalizeBoolean(
                    process.env.MAIL_SECURE,
                    true
                ),

            user:
                mailUser,

            password:
                normalizeText(
                    process.env.MAIL_PASSWORD,
                    ""
                ),

            fromName:
                normalizeText(
                    process.env.MAIL_FROM_NAME,
                    "BluePulse Tierschutz"
                ),

            fromAddress:
                normalizeText(
                    process.env.MAIL_FROM_ADDRESS,
                    mailUser
                ),

            contactNotificationTo:
                normalizeText(
                    process.env
                        .CONTACT_NOTIFICATION_TO,
                    "bluepulsekontakt@gmail.com"
                ),

            contactSubjectPrefix:
                normalizeText(
                    process.env
                        .CONTACT_NOTIFICATION_SUBJECT_PREFIX,
                    "[BluePulse Kontakt]"
                ),

            tlsRejectUnauthorized:
                normalizeBoolean(
                    process.env
                        .MAIL_TLS_REJECT_UNAUTHORIZED,
                    true
                ),

            connectionTimeoutMilliseconds:
                normalizeInteger(
                    process.env
                        .MAIL_CONNECTION_TIMEOUT_MS,
                    10000,
                    {
                        minimum: 1000,
                        maximum: 120000
                    }
                ),

            greetingTimeoutMilliseconds:
                normalizeInteger(
                    process.env
                        .MAIL_GREETING_TIMEOUT_MS,
                    10000,
                    {
                        minimum: 1000,
                        maximum: 120000
                    }
                ),

            socketTimeoutMilliseconds:
                normalizeInteger(
                    process.env
                        .MAIL_SOCKET_TIMEOUT_MS,
                    20000,
                    {
                        minimum: 1000,
                        maximum: 300000
                    }
                )
        }
    });

export default runtimeConfig;
