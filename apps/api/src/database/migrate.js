import {
    createDatabasePool
} from "./database.js";

import {
    getMigrationStatus,
    runMigrations
} from "./migrationService.js";

const showStatus =
    process.argv.includes(
        "--status"
    );

const database =
    createDatabasePool();

async function printMigrationStatus() {
    const status =
        await getMigrationStatus(
            database
        );

    if (
        status.length === 0
    ) {
        console.log(
            "Es wurden keine SQL-Migrationen gefunden."
        );

        return;
    }

    console.table(
        status.map(
            (migration) => ({
                Version:
                    migration.version,

                Name:
                    migration.name,

                Status:
                    migration.status,

                Ausgeführt:
                    migration.appliedAt
                        ? new Date(
                            migration.appliedAt
                        ).toLocaleString(
                            "de-DE"
                        )
                        : "-"
            })
        )
    );

    const changedMigration =
        status.find(
            (migration) =>
                migration.status ===
                "changed"
        );

    if (changedMigration) {
        throw new Error(
            `Migration ${changedMigration.version} wurde nach der Ausführung verändert.`
        );
    }
}

async function migrateDatabase() {
    const result =
        await runMigrations(
            database
        );

    console.log("");
    console.log(
        "BluePulse-Nexus-Datenbankmigration abgeschlossen."
    );

    console.log(
        `Gefunden: ${result.discovered}`
    );

    console.log(
        `Neu ausgeführt: ${result.applied}`
    );

    console.log(
        `Bereits vorhanden: ${result.skipped}`
    );

    if (
        result.migrations.length >
        0
    ) {
        console.log("");

        result.migrations.forEach(
            (migration) => {
                console.log(
                    `✓ ${migration.version} – ${migration.name}`
                );
            }
        );
    }
}

try {
    if (showStatus) {
        await printMigrationStatus();
    } else {
        await migrateDatabase();
    }
} catch (error) {
    console.error("");
    console.error(
        "Datenbankmigration fehlgeschlagen:"
    );

    console.error(
        error.message
    );

    process.exitCode = 1;
} finally {
    await database.end();
}