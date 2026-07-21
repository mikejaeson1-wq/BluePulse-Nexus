import {
    createHash
} from "node:crypto";

import {
    readdir,
    readFile
} from "node:fs/promises";

import {
    fileURLToPath
} from "node:url";

const MIGRATION_FILE_PATTERN =
    /^(\d+)[-_](.+)\.sql$/i;

const MIGRATION_LOCK_KEY =
    "bluepulse_nexus_database_migrations";

const migrationsDirectory =
    fileURLToPath(
        new URL(
            "../../migrations/",
            import.meta.url
        )
    );

function createChecksum(content) {
    return createHash("sha256")
        .update(content)
        .digest("hex");
}

function normalizeMigrationName(
    value
) {
    return String(value ?? "")
        .replace(/[-_]+/g, " ")
        .trim();
}

async function ensureMigrationTable(
    database
) {
    await database.query(`
        CREATE TABLE IF NOT EXISTS nexus_migrations (
            version INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            file_name TEXT NOT NULL,
            checksum TEXT NOT NULL,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
}

async function discoverMigrations() {
    const directoryEntries =
        await readdir(
            migrationsDirectory,
            {
                withFileTypes: true
            }
        );

    const migrations = [];

    for (
        const directoryEntry
        of directoryEntries
    ) {
        if (
            !directoryEntry.isFile()
        ) {
            continue;
        }

        const match =
            directoryEntry.name.match(
                MIGRATION_FILE_PATTERN
            );

        if (!match) {
            continue;
        }

        const version =
            Number.parseInt(
                match[1],
                10
            );

        const content =
            await readFile(
                new URL(
                    `../../migrations/${directoryEntry.name}`,
                    import.meta.url
                ),
                "utf8"
            );

        migrations.push({
            version,

            name:
                normalizeMigrationName(
                    match[2]
                ),

            fileName:
                directoryEntry.name,

            content,

            checksum:
                createChecksum(
                    content
                )
        });
    }

    migrations.sort(
        (
            firstMigration,
            secondMigration
        ) =>
            firstMigration.version -
            secondMigration.version
    );

    const usedVersions =
        new Set();

    migrations.forEach(
        (migration) => {
            if (
                usedVersions.has(
                    migration.version
                )
            ) {
                throw new Error(
                    `Die Migrationsversion ${migration.version} ist doppelt vorhanden.`
                );
            }

            usedVersions.add(
                migration.version
            );
        }
    );

    return migrations;
}

async function readAppliedMigrations(
    database
) {
    const result =
        await database.query(`
            SELECT
                version,
                name,
                file_name,
                checksum,
                applied_at
            FROM nexus_migrations
            ORDER BY version ASC
        `);

    return result.rows.map(
        (row) => ({
            version:
                Number(row.version),

            name:
                row.name,

            fileName:
                row.file_name,

            checksum:
                row.checksum,

            appliedAt:
                row.applied_at
        })
    );
}

function validateAppliedMigration(
    migration,
    appliedMigration
) {
    if (
        migration.checksum ===
        appliedMigration.checksum
    ) {
        return;
    }

    throw new Error(
        [
            `Die bereits ausgeführte Migration ${migration.version} wurde nachträglich verändert.`,
            `Datei: ${migration.fileName}`,
            "Bereits ausgeführte Migrationen dürfen nicht mehr bearbeitet werden."
        ].join(" ")
    );
}

export async function getMigrationStatus(
    database
) {
    await ensureMigrationTable(
        database
    );

    const [
        migrations,
        appliedMigrations
    ] =
        await Promise.all([
            discoverMigrations(),

            readAppliedMigrations(
                database
            )
        ]);

    const appliedMigrationMap =
        new Map(
            appliedMigrations.map(
                (migration) => [
                    migration.version,
                    migration
                ]
            )
        );

    return migrations.map(
        (migration) => {
            const appliedMigration =
                appliedMigrationMap.get(
                    migration.version
                );

            return {
                version:
                    migration.version,

                name:
                    migration.name,

                fileName:
                    migration.fileName,

                status:
                    appliedMigration
                        ? (
                            appliedMigration
                                .checksum ===
                            migration.checksum
                                ? "applied"
                                : "changed"
                        )
                        : "pending",

                appliedAt:
                    appliedMigration
                        ?.appliedAt ??
                    null
            };
        }
    );
}

export async function runMigrations(
    database,
    {
        logger = console
    } = {}
) {
    if (
        !database ||
        typeof database.connect !==
            "function"
    ) {
        throw new Error(
            "Für die Migrationen wurde kein gültiger PostgreSQL-Pool bereitgestellt."
        );
    }

    const client =
        await database.connect();

    let migrationLockAcquired =
        false;

    try {
        await client.query(
            `
                SELECT pg_advisory_lock(
                    hashtext($1)
                )
            `,
            [
                MIGRATION_LOCK_KEY
            ]
        );

        migrationLockAcquired =
            true;

        await ensureMigrationTable(
            client
        );

        const migrations =
            await discoverMigrations();

        const appliedMigrations =
            await readAppliedMigrations(
                client
            );

        const appliedMigrationMap =
            new Map(
                appliedMigrations.map(
                    (migration) => [
                        migration.version,
                        migration
                    ]
                )
            );

        const appliedNow = [];
        const skipped = [];

        for (
            const migration
            of migrations
        ) {
            const appliedMigration =
                appliedMigrationMap.get(
                    migration.version
                );

            if (appliedMigration) {
                validateAppliedMigration(
                    migration,
                    appliedMigration
                );

                skipped.push(
                    migration
                );

                continue;
            }

            logger.info(
                `Migration ${migration.version}: ${migration.name}`
            );

            await client.query(
                "BEGIN"
            );

            try {
                await client.query(
                    migration.content
                );

                await client.query(
                    `
                        INSERT INTO nexus_migrations (
                            version,
                            name,
                            file_name,
                            checksum
                        )
                        VALUES (
                            $1,
                            $2,
                            $3,
                            $4
                        )
                    `,
                    [
                        migration.version,
                        migration.name,
                        migration.fileName,
                        migration.checksum
                    ]
                );

                await client.query(
                    "COMMIT"
                );

                appliedNow.push(
                    migration
                );
            } catch (error) {
                await client.query(
                    "ROLLBACK"
                );

                throw new Error(
                    `Migration ${migration.version} „${migration.name}“ ist fehlgeschlagen: ${error.message}`
                );
            }
        }

        return {
            discovered:
                migrations.length,

            applied:
                appliedNow.length,

            skipped:
                skipped.length,

            migrations:
                appliedNow.map(
                    (migration) => ({
                        version:
                            migration.version,

                        name:
                            migration.name,

                        fileName:
                            migration.fileName
                    })
                )
        };
    } finally {
        if (migrationLockAcquired) {
            try {
                await client.query(
                    `
                        SELECT pg_advisory_unlock(
                            hashtext($1)
                        )
                    `,
                    [
                        MIGRATION_LOCK_KEY
                    ]
                );
            } catch (error) {
                logger.error(
                    "Die PostgreSQL-Migrationssperre konnte nicht aufgehoben werden.",
                    error
                );
            }
        }

        client.release();
    }
}