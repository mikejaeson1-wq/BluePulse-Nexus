import pg from "pg";

import runtimeConfig from "../config/runtimeConfig.js";

const {
    Pool
} = pg;

const JSON_QUERY_WRAPPED =
    Symbol(
        "bluepulse-json-query-wrapped"
    );

const JSON_PARAMETER_PATTERN =
    /\$(\d+)\s*::\s*JSONB/gi;

function normalizeJsonParameters(
    queryText,
    values
) {
    if (
        typeof queryText !==
            "string" ||
        !Array.isArray(values) ||
        values.length === 0
    ) {
        return values;
    }

    const jsonParameterIndexes =
        new Set();

    for (
        const match
        of queryText.matchAll(
            JSON_PARAMETER_PATTERN
        )
    ) {
        jsonParameterIndexes.add(
            Number.parseInt(
                match[1],
                10
            ) - 1
        );
    }

    if (
        jsonParameterIndexes.size ===
        0
    ) {
        return values;
    }

    return values.map(
        (
            value,
            index
        ) => {
            if (
                !jsonParameterIndexes.has(
                    index
                )
            ) {
                return value;
            }

            if (
                value === undefined
            ) {
                return null;
            }

            if (
                typeof value ===
                "string"
            ) {
                return value;
            }

            return JSON.stringify(
                value
            );
        }
    );
}

function wrapDatabaseQuery(
    target
) {
    if (
        !target ||
        typeof target.query !==
            "function" ||
        target[
            JSON_QUERY_WRAPPED
        ]
    ) {
        return target;
    }

    const originalQuery =
        target.query.bind(
            target
        );

    target.query =
        function jsonSafeQuery(
            queryOrConfig,
            values,
            callback
        ) {
            if (
                typeof queryOrConfig ===
                "string"
            ) {
                if (
                    arguments.length ===
                    1
                ) {
                    return originalQuery(
                        queryOrConfig
                    );
                }

                if (
                    typeof values ===
                    "function"
                ) {
                    return originalQuery(
                        queryOrConfig,
                        values
                    );
                }

                const normalizedValues =
                    normalizeJsonParameters(
                        queryOrConfig,
                        values
                    );

                if (
                    typeof callback ===
                    "function"
                ) {
                    return originalQuery(
                        queryOrConfig,
                        normalizedValues,
                        callback
                    );
                }

                return originalQuery(
                    queryOrConfig,
                    normalizedValues
                );
            }

            if (
                queryOrConfig &&
                typeof queryOrConfig ===
                    "object" &&
                typeof queryOrConfig.text ===
                    "string"
            ) {
                const normalizedConfig = {
                    ...queryOrConfig,

                    values:
                        normalizeJsonParameters(
                            queryOrConfig.text,
                            queryOrConfig
                                .values
                        )
                };

                if (
                    typeof values ===
                    "function"
                ) {
                    return originalQuery(
                        normalizedConfig,
                        values
                    );
                }

                return originalQuery(
                    normalizedConfig
                );
            }

            return originalQuery(
                queryOrConfig,
                values,
                callback
            );
        };

    Object.defineProperty(
        target,
        JSON_QUERY_WRAPPED,
        {
            value: true,

            enumerable: false,

            configurable: false,

            writable: false
        }
    );

    return target;
}

function createJsonSafePool(
    options
) {
    const pool =
        wrapDatabaseQuery(
            new Pool(options)
        );

    const originalConnect =
        pool.connect.bind(
            pool
        );

    pool.connect =
        async function jsonSafeConnect(
            ...argumentsList
        ) {
            const client =
                await originalConnect(
                    ...argumentsList
                );

            return wrapDatabaseQuery(
                client
            );
        };

    return pool;
}

export function createDatabasePool({
    connectionString =
        runtimeConfig.database.url,

    maximumConnections =
        runtimeConfig.database
            .poolMaximum,

    connectionTimeoutMilliseconds =
        runtimeConfig.database
            .connectionTimeoutMilliseconds,

    idleTimeoutMilliseconds =
        runtimeConfig.database
            .idleTimeoutMilliseconds
} = {}) {
    return createJsonSafePool({
        connectionString,

        max:
            maximumConnections,

        connectionTimeoutMillis:
            connectionTimeoutMilliseconds,

        idleTimeoutMillis:
            idleTimeoutMilliseconds,

        application_name:
            runtimeConfig
                .applicationName
    });
}

export async function inspectDatabase(
    database
) {
    if (
        !database ||
        typeof database.query !==
            "function"
    ) {
        throw new Error(
            "Es wurde keine gültige Datenbankverbindung bereitgestellt."
        );
    }

    const startedAt =
        Date.now();

    const result =
        await database.query(
            `
                SELECT
                    current_database() AS database_name,
                    current_user AS database_user,
                    NOW()::TEXT AS server_time
            `
        );

    const row =
        result.rows?.[0] ?? {};

    return {
        connected: true,

        name:
            row.database_name ??
            "unknown",

        user:
            row.database_user ??
            "unknown",

        serverTime:
            row.server_time ??
            null,

        latencyMilliseconds:
            Math.max(
                0,
                Date.now() -
                    startedAt
            )
    };
}

export async function readSystemMetadata(
    database
) {
    const result =
        await database.query(
            `
                SELECT
                    key,
                    value,
                    updated_at
                FROM system_meta
                ORDER BY key ASC
            `
        );

    return result.rows.map(
        (row) => ({
            key:
                row.key,

            value:
                row.value,

            updatedAt:
                row.updated_at
        })
    );
}