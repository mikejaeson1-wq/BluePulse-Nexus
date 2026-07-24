import {
    access,
    readdir
} from "node:fs/promises";

import path from "node:path";

import runtimeConfig from "../config/runtimeConfig.js";

import {
    createDatabasePool
} from "../database/database.js";

import {
    getMigrationStatus
} from "../database/migrationService.js";

import {
    evaluateLaunchReadiness
} from "./launchReadiness.js";

async function fileExists(
    filePath
) {
    try {
        await access(
            filePath
        );

        return true;
    } catch {
        return false;
    }
}

async function readSnapshot(
    database
) {
    const [
        contentResult,
        navigationResult,
        layoutResult,
        footerResult,
        pagesResult,
        mediaResult,
        administratorResult,
        migrations
    ] =
        await Promise.all([
            database.query(`
                SELECT
                    content_key,
                    data
                FROM site_content
                ORDER BY content_key ASC
            `),

            database.query(`
                SELECT data
                FROM site_navigation
                WHERE id = 1
                LIMIT 1
            `),

            database.query(`
                SELECT data
                FROM home_layout
                WHERE id = 1
                LIMIT 1
            `),

            database.query(`
                SELECT data
                FROM footer_settings
                WHERE id = 1
                LIMIT 1
            `),

            database.query(`
                SELECT
                    id,
                    title,
                    slug,
                    status,
                    blocks,
                    theme
                FROM pages
                WHERE deleted_at IS NULL
                ORDER BY slug ASC
            `),

            database.query(`
                SELECT
                    id,
                    storage_key,
                    mime_type,
                    alt_text
                FROM media_assets
                ORDER BY id ASC
            `),

            database.query(`
                SELECT COUNT(*)::INTEGER AS count
                FROM users
                WHERE
                    is_active = TRUE
                    AND role = 'administrator'
            `),

            getMigrationStatus(
                database
            )
        ]);

    const content =
        contentResult.rows.reduce(
            (
                values,
                row
            ) => {
                values[
                    row.content_key
                ] =
                    row.data ?? {};

                return values;
            },
            {}
        );

    const media =
        await Promise.all(
            mediaResult.rows.map(
                async (
                    row
                ) => ({
                    id:
                        row.id,

                    storageKey:
                        row.storage_key,

                    mimeType:
                        row.mime_type,

                    altText:
                        row.alt_text,

                    fileExists:
                        await fileExists(
                            path.join(
                                runtimeConfig
                                    .media
                                    .storageDirectory,
                                row.storage_key
                            )
                        )
                })
            )
        );

    let storedFileNames = [];

    try {
        const directoryEntries =
            await readdir(
                runtimeConfig
                    .media
                    .storageDirectory,
                {
                    withFileTypes:
                        true
                }
            );

        storedFileNames =
            directoryEntries
                .filter(
                    (entry) =>
                        entry.isFile() &&
                        !entry.name
                            .startsWith(
                                "."
                            ) &&
                        !entry.name
                            .includes(
                                ".deleting-"
                            )
                )
                .map(
                    (entry) =>
                        entry.name
                );
    } catch (error) {
        if (
            error?.code !==
            "ENOENT"
        ) {
            throw error;
        }
    }

    const databaseStorageKeys =
        new Set(
            media.map(
                (asset) =>
                    asset.storageKey
            )
        );

    return {
        content,

        navigation:
            navigationResult
                .rows?.[0]
                ?.data ?? {},

        homeLayout:
            layoutResult
                .rows?.[0]
                ?.data ?? {},

        footer:
            footerResult
                .rows?.[0]
                ?.data ?? {},

        pages:
            pagesResult.rows,

        media,

        orphanMediaFiles:
            storedFileNames.filter(
                (fileName) =>
                    !databaseStorageKeys.has(
                        fileName
                    )
            ),

        activeAdministratorCount:
            administratorResult
                .rows?.[0]
                ?.count ?? 0,

        migrations
    };
}

function printResult(
    result
) {
    console.log("");
    console.log(
        "BluePulse Launch-Audit"
    );

    console.log(
        "======================"
    );

    for (
        const check
        of result.checks
    ) {
        const label = {
            ok:
                "OK",

            warning:
                "WARNUNG",

            blocker:
                "BLOCKER"
        }[
            check.level
        ];

        console.log(
            `[${label}] ${check.message}`
        );

        if (check.hint) {
            console.log(
                `          Loesung: ${check.hint}`
            );
        }
    }

    console.log("");
    console.log(
        `Ergebnis: ${result.totals.ok} OK, ${result.totals.warnings} Warnungen, ${result.totals.blockers} Blocker.`
    );

    if (result.ready) {
        console.log(
            "Der CMS-Datenstand ist fuer die Staging-Abnahme bereit."
        );
    } else {
        console.log(
            "Der Launch bleibt gesperrt, bis alle Blocker behoben sind."
        );
    }

    console.log("");
}

const database =
    createDatabasePool();

try {
    const snapshot =
        await readSnapshot(
            database
        );

    const result =
        evaluateLaunchReadiness(
            snapshot,
            {
                publicUrl:
                    runtimeConfig
                        .publicUrl,

                emailEnabled:
                    runtimeConfig
                        .email
                        .enabled,

                requireHttps:
                    runtimeConfig
                        .auth
                        .secureCookie
            }
        );

    printResult(
        result
    );

    if (!result.ready) {
        process.exitCode = 1;
    }
} catch (error) {
    console.error("");
    console.error(
        "Launch-Audit fehlgeschlagen:"
    );

    console.error(
        error.message
    );

    process.exitCode = 1;
} finally {
    await database.end();
}
