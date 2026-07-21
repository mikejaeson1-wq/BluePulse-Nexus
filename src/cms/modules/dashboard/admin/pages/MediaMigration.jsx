import "./MediaMigration.css";

import {
    useEffect,
    useState
} from "react";

import AdminPage from "../components/AdminPage";

import Button from "@shared/ui/Button";

import {
    inspectMediaMigration,
    migrateLocalMediaAssets
} from "@cms/modules/migration/services/mediaMigrationService";

import {
    formatFileSize
} from "@shared/media/mediaService";

function MigrationStat({
    icon,
    label,
    value,
    note
}) {
    return (
        <article className="media-migration-stat">
            <i
                className={
                    `bi ${icon}`
                }
                aria-hidden="true"
            />

            <div>
                <span>
                    {label}
                </span>

                <strong>
                    {value}
                </strong>

                {
                    note && (
                        <small>
                            {note}
                        </small>
                    )
                }
            </div>
        </article>
    );
}

function getProgressLabel(
    progress
) {
    if (!progress) {
        return "";
    }

    const statusLabels = {
        uploading:
            "Wird übertragen",

        completed:
            "Übertragen",

        skipped:
            "Bereits vorhanden",

        failed:
            "Fehlgeschlagen"
    };

    return (
        statusLabels[
            progress.status
        ] ??
        progress.status
    );
}

export default function MediaMigration() {
    const [
        inspection,
        setInspection
    ] = useState(null);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        migrating,
        setMigrating
    ] = useState(false);

    const [
        backupConfirmed,
        setBackupConfirmed
    ] = useState(false);

    const [
        progress,
        setProgress
    ] = useState(null);

    const [
        migrationResult,
        setMigrationResult
    ] = useState(null);

    const [
        error,
        setError
    ] = useState("");

    const [
        message,
        setMessage
    ] = useState("");

    async function loadInspection() {
        setLoading(true);
        setError("");

        try {
            const result =
                await inspectMediaMigration();

            setInspection(
                result
            );
        } catch (loadError) {
            setInspection(null);

            setError(
                loadError.message ??
                "Die lokalen und serverseitigen Medien konnten nicht geprüft werden."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadInspection();
    }, []);

    async function handleMigration() {
        if (
            !inspection ||
            !backupConfirmed ||
            migrating
        ) {
            return;
        }

        const confirmed =
            globalThis.confirm(
                [
                    "Lokale Medien jetzt auf den Server übertragen?",
                    "",
                    "Alle vorhandenen Medien-IDs werden unverändert übernommen.",
                    "Die lokalen IndexedDB-Dateien bleiben weiterhin erhalten."
                ].join("\n")
            );

        if (!confirmed) {
            return;
        }

        setMigrating(true);
        setError("");
        setMessage("");
        setMigrationResult(null);
        setProgress(null);

        try {
            const result =
                await migrateLocalMediaAssets(
                    inspection
                        .localAssets,
                    {
                        onProgress:
                            setProgress
                    }
                );

            setMigrationResult(
                result
            );

            if (
                result.failed.length ===
                0
            ) {
                setMessage(
                    `${result.transferred.length} Medien wurden übertragen. ${result.skipped.length} waren bereits vorhanden.`
                );
            } else {
                setError(
                    `${result.failed.length} Medien konnten nicht übertragen werden. Die erfolgreichen Dateien bleiben gespeichert; ein erneuter Durchlauf setzt die Migration fort.`
                );
            }

            await loadInspection();
        } catch (migrationError) {
            setError(
                migrationError.message ??
                "Die Medienmigration ist fehlgeschlagen."
            );
        } finally {
            setMigrating(false);
        }
    }

    const progressPercentage =
        progress?.total
            ? Math.round(
                (
                    progress.current /
                    progress.total
                ) *
                100
            )
            : 0;

    return (
        <AdminPage
            title="Medienmigration"
            description="Lokale IndexedDB-Medien mit unveränderten IDs auf den Nexus-Server übertragen."
        >
            {
                error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )
            }

            {
                message && (
                    <div className="alert alert-success">
                        {message}
                    </div>
                )
            }

            <section className="media-migration-intro">
                <div className="media-migration-intro__icon">
                    <i
                        className="bi bi-cloud-arrow-up"
                        aria-hidden="true"
                    />
                </div>

                <div>
                    <span className="media-migration-eyebrow">
                        IndexedDB → Server
                    </span>

                    <h2>
                        Medienreferenzen unverändert erhalten
                    </h2>

                    <p>
                        Jede lokale Medien-ID wird unverändert in PostgreSQL
                        übernommen. Referenzen wie <code>media://...</code>
                        müssen dadurch später nicht angepasst werden.
                    </p>
                </div>
            </section>

            {
                loading ? (
                    <div className="media-migration-loading">
                        <div className="spinner-border text-info" />

                        <span>
                            Medienbestände werden verglichen …
                        </span>
                    </div>
                ) : inspection ? (
                    <>
                        <div className="media-migration-columns">
                            <section className="media-migration-panel">
                                <div className="media-migration-panel__header">
                                    <div>
                                        <span className="media-migration-eyebrow">
                                            Quelle
                                        </span>

                                        <h2>
                                            Lokaler Browser
                                        </h2>
                                    </div>

                                    <i
                                        className="bi bi-browser-chrome"
                                        aria-hidden="true"
                                    />
                                </div>

                                <div className="media-migration-stats">
                                    <MigrationStat
                                        icon="bi-images"
                                        label="Lokale Medien"
                                        value={
                                            inspection
                                                .summary
                                                .localCount
                                        }
                                    />

                                    <MigrationStat
                                        icon="bi-device-ssd"
                                        label="Lokale Datenmenge"
                                        value={
                                            formatFileSize(
                                                inspection
                                                    .summary
                                                    .localBytes
                                            )
                                        }
                                    />

                                    <MigrationStat
                                        icon="bi-hourglass-split"
                                        label="Noch zu übertragen"
                                        value={
                                            inspection
                                                .summary
                                                .pendingCount
                                        }
                                    />

                                    <MigrationStat
                                        icon="bi-exclamation-triangle"
                                        label="Nicht lesbar"
                                        value={
                                            inspection
                                                .summary
                                                .unreadableCount
                                        }
                                    />
                                </div>
                            </section>

                            <div className="media-migration-arrow">
                                <i
                                    className="bi bi-arrow-right"
                                    aria-hidden="true"
                                />
                            </div>

                            <section className="media-migration-panel">
                                <div className="media-migration-panel__header">
                                    <div>
                                        <span className="media-migration-eyebrow">
                                            Ziel
                                        </span>

                                        <h2>
                                            Nexus-Server
                                        </h2>
                                    </div>

                                    <i
                                        className="bi bi-hdd-network"
                                        aria-hidden="true"
                                    />
                                </div>

                                <div className="media-migration-stats">
                                    <MigrationStat
                                        icon="bi-database"
                                        label="Servermedien"
                                        value={
                                            inspection
                                                .summary
                                                .serverCount
                                        }
                                    />

                                    <MigrationStat
                                        icon="bi-hdd"
                                        label="Server-Datenmenge"
                                        value={
                                            formatFileSize(
                                                inspection
                                                    .summary
                                                    .serverBytes
                                            )
                                        }
                                    />

                                    <MigrationStat
                                        icon="bi-check-circle"
                                        label="Gleiche IDs vorhanden"
                                        value={
                                            inspection
                                                .summary
                                                .matchingCount
                                        }
                                    />

                                    <MigrationStat
                                        icon="bi-link-45deg"
                                        label="Referenzformat"
                                        value="media://ID"
                                    />
                                </div>
                            </section>
                        </div>

                        {
                            inspection
                                .summary
                                .pendingCount ===
                            0 ? (
                                <section className="media-migration-complete">
                                    <i
                                        className="bi bi-check-circle-fill"
                                        aria-hidden="true"
                                    />

                                    <div>
                                        <strong>
                                            Alle lokalen Medien sind auf dem Server vorhanden
                                        </strong>

                                        <p>
                                            Die IDs stimmen überein. Die lokale
                                            IndexedDB bleibt bis zum Abschluss von
                                            Phase 5C als Sicherheitskopie erhalten.
                                        </p>
                                    </div>
                                </section>
                            ) : (
                                <section className="media-migration-warning">
                                    <i
                                        className="bi bi-shield-check"
                                        aria-hidden="true"
                                    />

                                    <div>
                                        <strong>
                                            Lokale Medien werden nicht gelöscht
                                        </strong>

                                        <p>
                                            Die Übertragung kopiert die Dateien auf
                                            den Server. Der aktuelle lokale
                                            Medienbestand und dein Nexus-Backup
                                            bleiben unverändert.
                                        </p>
                                    </div>
                                </section>
                            )
                        }

                        {
                            progress && (
                                <section className="media-migration-progress">
                                    <div className="media-migration-progress__header">
                                        <div>
                                            <strong>
                                                {
                                                    progress
                                                        .assetName
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    getProgressLabel(
                                                        progress
                                                    )
                                                }
                                            </span>
                                        </div>

                                        <span>
                                            {
                                                progress.current
                                            }
                                            /
                                            {
                                                progress.total
                                            }
                                        </span>
                                    </div>

                                    <div
                                        className="progress"
                                        role="progressbar"
                                        aria-valuenow={
                                            progressPercentage
                                        }
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    >
                                        <div
                                            className="progress-bar"
                                            style={{
                                                width:
                                                    `${progressPercentage}%`
                                            }}
                                        >
                                            {
                                                progressPercentage
                                            }
                                            %
                                        </div>
                                    </div>
                                </section>
                            )
                        }

                        {
                            migrationResult
                                ?.failed
                                ?.length >
                            0 && (
                                <section className="media-migration-failures">
                                    <h2>
                                        Fehlgeschlagene Dateien
                                    </h2>

                                    <ul>
                                        {
                                            migrationResult
                                                .failed
                                                .map(
                                                    (failure) => (
                                                        <li
                                                            key={
                                                                failure.id
                                                            }
                                                        >
                                                            <strong>
                                                                {
                                                                    failure.name ||
                                                                    failure.id
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    failure.message
                                                                }
                                                            </span>
                                                        </li>
                                                    )
                                                )
                                        }
                                    </ul>
                                </section>
                            )
                        }

                        <section className="media-migration-action">
                            <label className="media-migration-confirmation">
                                <input
                                    type="checkbox"
                                    checked={
                                        backupConfirmed
                                    }
                                    disabled={
                                        migrating
                                    }
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            setBackupConfirmed(
                                                event
                                                    .target
                                                    .checked
                                            )
                                    }
                                />

                                <span>
                                    Ich habe ein aktuelles Nexus-Backup mit den
                                    lokalen Medien erstellt.
                                </span>
                            </label>

                            <div className="media-migration-action__buttons">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={
                                        migrating
                                    }
                                    onClick={
                                        loadInspection
                                    }
                                >
                                    Bestände neu prüfen
                                </Button>

                                <Button
                                    type="button"
                                    disabled={
                                        migrating ||
                                        !backupConfirmed ||
                                        inspection
                                            .summary
                                            .pendingCount ===
                                            0
                                    }
                                    onClick={
                                        handleMigration
                                    }
                                >
                                    {
                                        migrating
                                            ? "Medien werden übertragen …"
                                            : "Lokale Medien übertragen"
                                    }
                                </Button>
                            </div>
                        </section>
                    </>
                ) : null
            }
        </AdminPage>
    );
}