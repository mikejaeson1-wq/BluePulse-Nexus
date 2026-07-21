import path from "node:path";

function normalizeText(
    value,
    fallback
) {
    const normalizedValue =
        String(value ?? "").trim();

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
            String(value ?? ""),
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

const nodeEnvironment =
    normalizeText(
        process.env.NODE_ENV,
        "development"
    );

const mediaStorageDirectory =
    path.resolve(
        normalizeText(
            process.env
                .MEDIA_STORAGE_DIR,
            "./storage/media"
        )
    );

export const runtimeConfig =
    Object.freeze({
        nodeEnvironment,

        production:
            nodeEnvironment ===
            "production",

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

        logLevel:
            normalizeText(
                process.env.LOG_LEVEL,
                nodeEnvironment ===
                    "production"
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
                            100 * 1024 *
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
        }
    });

export default runtimeConfig;