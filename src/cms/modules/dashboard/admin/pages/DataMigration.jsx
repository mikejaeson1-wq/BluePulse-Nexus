import "./DataMigration.css";

import {
    useEffect,
    useState
} from "react";

import AdminPage from "../components/AdminPage";

import Button from "@shared/ui/Button";

import {
    getDataMode
} from "@shared/data/dataMode";

import {
    getApiMigrationStatus,
    inspectLocalBrowserData,
    migrateLocalBrowserData
} from "@cms/modules/migration/services/browserMigrationService";

function formatDate(value) {
    if (!value) {
        return "Noch nicht ausgeführt";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }

    return date.toLocaleString(
        "de-DE",
        {
            dateStyle: "long",
            timeStyle: "short"
        }
    );
}

function formatFileSize(bytes) {
    const numericBytes =
        Number(bytes) || 0;

    if (numericBytes === 0) {
        return "0 B";
    }

    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];

    const unitIndex =
        Math.min(
            Math.floor(
                Math.log(
                    numericBytes
                ) /
                Math.log(1024)
            ),
            units.length - 1
        );

    const value =
        numericBytes /
        1024 ** unitIndex;

    return `${value.toLocaleString(
        "de-DE",
        {
            maximumFractionDigits: 2
        }
    )} ${units[unitIndex]}`;
}

function StatCard({
    icon,
    label,
    value,
    note
}) {
    return (
        <article className="data-migration-stat">
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

export default function DataMigration() {
    const [
        inspection,
        setInspection
    ] = useState(null);

    const [
        apiStatus,
        setApiStatus
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
        message,
        setMessage
    ] = useState("");

    const [
        error,
        setError
    ] = useState("");

    const dataMode =
        getDataMode();

    async function loadMigrationInformation() {
        setLoading(true);
        setError("");

        try {
            const localInspection =
                await inspectLocalBrowserData();

            setInspection(
                localInspection
            );

            try {
                const serverStatus =
                    await getApiMigrationStatus();

                setApiStatus(
                    serverStatus
                );
            } catch (apiError) {
                setApiStatus(null);

                setError(
                    [
                        "Die lokalen Daten wurden gelesen, aber die Nexus-API ist nicht erreichbar.",
                        "Starte PostgreSQL und die API mit „npm run dev:api“."
                    ].join(" ")
                );
            }
        } catch (inspectionError) {
            setError(
                inspectionError.message ??
                "Die lokalen Browserdaten konnten nicht geprüft werden."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadMigrationInformation();
    }, []);

    async function handleMigration() {
        if (
            !inspection ||
            !backupConfirmed
        ) {
            return;
        }

        const confirmed =
            globalThis.confirm(
                [
                    "Browserdaten wirklich nach PostgreSQL übertragen?",
                    "",
                    "Vorhandene Website-Inhalte und Builder-Seiten in PostgreSQL werden durch den aktuellen Browserstand ersetzt.",
                    "",
                    "Die lokalen Browserdaten bleiben erhalten."
                ].join("\n")
            );

        if (!confirmed) {
            return;
        }

        setMigrating(true);
        setMessage("");
        setError("");

        try {
            const result =
                await migrateLocalBrowserData(
                    inspection.snapshot
                );

            setMessage(
                [
                    "Migration erfolgreich.",
                    `${result.siteContent} Website-Bereiche und`,
                    `${result.pages} Builder-Seiten wurden nach PostgreSQL übertragen.`
                ].join(" ")
            );

            const nextStatus =
                await getApiMigrationStatus();

            setApiStatus(
                nextStatus
            );
        } catch (migrationError) {
            setError(
                migrationError.message ??
                "Die Browserdaten konnten nicht migriert werden."
            );
        } finally {
            setMigrating(false);
        }
    }

    return (
        <AdminPage
            title="Datenmigration"
            description="Lokale Nexus-Inhalte sicher nach PostgreSQL übertragen."
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

            <section className="data-migration-intro">
                <div className="data-migration-intro__icon">
                    <i
                        className="bi bi-database-up"
                        aria-hidden="true"
                    />
                </div>

                <div>
                    <span className="data-migration-eyebrow">
                        Browser → PostgreSQL
                    </span>

                    <h2>
                        Bestehende Inhalte übernehmen
                    </h2>

                    <p>
                        Nexus liest den aktuellen Stand aus diesem Browser und
                        überträgt ihn in einer Datenbanktransaktion nach
                        PostgreSQL. Erst wenn alle Schritte erfolgreich sind,
                        wird die Migration gespeichert.
                    </p>
                </div>

                <div className="data-migration-mode">
                    <span>
                        Aktueller Datenmodus
                    </span>

                    <strong>
                        {dataMode}
                    </strong>
                </div>
            </section>

            {
                loading ? (
                    <section className="data-migration-loading">
                        <div className="spinner-border text-info" />

                        <span>
                            Lokale Daten und PostgreSQL-Status werden geprüft …
                        </span>
                    </section>
                ) : (
                    <>
                        <div className="data-migration-columns">
                            <section className="data-migration-panel">
                                <div className="data-migration-panel__header">
                                    <div>
                                        <span className="data-migration-eyebrow">
                                            Quelle
                                        </span>

                                        <h2>
                                            Dieser Browser
                                        </h2>
                                    </div>

                                    <i
                                        className="bi bi-browser-chrome"
                                        aria-hidden="true"
                                    />
                                </div>

                                <div className="data-migration-stats">
                                    <StatCard
                                        icon="bi-layout-text-window"
                                        label="Website-Bereiche"
                                        value={
                                            inspection
                                                ?.summary
                                                .siteContent ??
                                            0
                                        }
                                    />

                                    <StatCard
                                        icon="bi-file-earmark-text"
                                        label="Builder-Seiten"
                                        value={
                                            inspection
                                                ?.summary
                                                .pages ??
                                            0
                                        }
                                        note={
                                            `${inspection?.summary.publishedPages ?? 0} veröffentlicht, ${inspection?.summary.draftPages ?? 0} Entwürfe`
                                        }
                                    />

                                    <StatCard
                                        icon="bi-images"
                                        label="Lokale Medien"
                                        value={
                                            inspection
                                                ?.summary
                                                .mediaAssets ??
                                            0
                                        }
                                        note={
                                            formatFileSize(
                                                inspection
                                                    ?.summary
                                                    .mediaTotalBytes
                                            )
                                        }
                                    />

                                    <StatCard
                                        icon="bi-box-arrow-up"
                                        label="JSON-Datenmenge"
                                        value={
                                            formatFileSize(
                                                inspection
                                                    ?.summary
                                                    .payloadBytes
                                            )
                                        }
                                    />
                                </div>
                            </section>

                            <div className="data-migration-arrow">
                                <i
                                    className="bi bi-arrow-right"
                                    aria-hidden="true"
                                />
                            </div>

                            <section className="data-migration-panel">
                                <div className="data-migration-panel__header">
                                    <div>
                                        <span className="data-migration-eyebrow">
                                            Ziel
                                        </span>

                                        <h2>
                                            PostgreSQL
                                        </h2>
                                    </div>

                                    <i
                                        className="bi bi-database-check"
                                        aria-hidden="true"
                                    />
                                </div>

                                {
                                    apiStatus ? (
                                        <div className="data-migration-stats">
                                            <StatCard
                                                icon="bi-layout-text-window"
                                                label="Website-Bereiche"
                                                value={
                                                    apiStatus
                                                        .siteContent
                                                }
                                            />

                                            <StatCard
                                                icon="bi-file-earmark-text"
                                                label="Builder-Seiten"
                                                value={
                                                    apiStatus
                                                        .pages
                                                }
                                                note={
                                                    `${apiStatus.publishedPages} veröffentlicht, ${apiStatus.draftPages} Entwürfe`
                                                }
                                            />

                                            <StatCard
                                                icon="bi-clock-history"
                                                label="Letzte Migration"
                                                value={
                                                    apiStatus
                                                        .migrated
                                                        ? "Ausgeführt"
                                                        : "Noch keine"
                                                }
                                                note={
                                                    formatDate(
                                                        apiStatus
                                                            .migratedAt
                                                    )
                                                }
                                            />

                                            <StatCard
                                                icon="bi-plug"
                                                label="API-Verbindung"
                                                value="Verbunden"
                                            />
                                        </div>
                                    ) : (
                                        <div className="data-migration-offline">
                                            <i
                                                className="bi bi-database-x"
                                                aria-hidden="true"
                                            />

                                            <strong>
                                                PostgreSQL nicht erreichbar
                                            </strong>

                                            <span>
                                                Prüfe Docker und die lokale API.
                                            </span>
                                        </div>
                                    )
                                }
                            </section>
                        </div>

                        <section className="data-migration-warning">
                            <i
                                className="bi bi-images"
                                aria-hidden="true"
                            />

                            <div>
                                <strong>
                                    Medien werden noch nicht übertragen
                                </strong>

                                <p>
                                    Bild- und PDF-Dateien bleiben vorerst in der
                                    lokalen IndexedDB-Medienbibliothek. Inhalte,
                                    Metadaten und Medienreferenzen werden bereits
                                    übertragen. Der eigentliche Datei-Upload folgt
                                    mit dem Server-Medienspeicher.
                                </p>
                            </div>
                        </section>

                        <section className="data-migration-action">
                            <label className="data-migration-confirmation">
                                <input
                                    type="checkbox"
                                    checked={
                                        backupConfirmed
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
                                    disabled={
                                        migrating
                                    }
                                />

                                <span>
                                    Ich habe unter „Sicherungen“ ein aktuelles
                                    Nexus-Backup erstellt.
                                </span>
                            </label>

                            <div className="data-migration-action__buttons">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={
                                        migrating
                                    }
                                    onClick={
                                        loadMigrationInformation
                                    }
                                >
                                    Daten neu prüfen
                                </Button>

                                <Button
                                    type="button"
                                    disabled={
                                        migrating ||
                                        !backupConfirmed ||
                                        !apiStatus ||
                                        !inspection
                                    }
                                    onClick={
                                        handleMigration
                                    }
                                >
                                    {
                                        migrating
                                            ? "Migration läuft …"
                                            : "Nach PostgreSQL übertragen"
                                    }
                                </Button>
                            </div>
                        </section>

                        <section className="data-migration-next">
                            <i
                                className="bi bi-info-circle"
                                aria-hidden="true"
                            />

                            <p>
                                Der Datenmodus bleibt nach der Migration zunächst
                                auf <code>local</code>. Dadurch kannst du Nexus
                                weiter wie bisher verwenden. Auf den API-Modus
                                wechseln wir erst nach der Seiten-API und dem
                                Server-Medienspeicher.
                            </p>
                        </section>
                    </>
                )
            }
        </AdminPage>
    );
}