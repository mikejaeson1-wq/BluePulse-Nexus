import pg from "pg";

import runtimeConfig from "../config/runtimeConfig.js";

const {
    Pool
} = pg;

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
    return new Pool({
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