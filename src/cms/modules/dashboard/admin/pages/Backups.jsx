import "./Backups.css";

import {
    useRef,
    useState
} from "react";

import AdminPage from "../components/AdminPage";

import Button from "@shared/ui/Button";

import {
    createNexusBackup,
    downloadNexusBackup,
    formatBackupFileSize,
    inspectNexusBackup,
    restoreNexusBackup
} from "@cms/modules/backup/services/nexusBackupService";

function formatDate(value) {
    if (!value) {
        return "Unbekannt";
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

export default function Backups() {
    const fileInputRef =
        useRef(null);

    const [
        selectedFile,
        setSelectedFile
    ] = useState(null);

    const [
        inspection,
        setInspection
    ] = useState(null);

    const [
        creating,
        setCreating
    ] = useState(false);

    const [
        inspecting,
        setInspecting
    ] = useState(false);

    const [
        restoring,
        setRestoring
    ] = useState(false);

    const [
        dragActive,
        setDragActive
    ] = useState(false);

    const [
        progress,
        setProgress
    ] = useState({
        value: 0,
        message: ""
    });

    const [
        notice,
        setNotice
    ] = useState("");

    const [
        error,
        setError
    ] = useState("");

    const busy =
        creating ||
        inspecting ||
        restoring;

    function updateProgress({
        progress: nextProgress,
        message
    }) {
        setProgress({
            value:
                nextProgress,
            message:
                message ?? ""
        });
    }

    function resetMessages() {
        setNotice("");
        setError("");
    }

    async function handleCreateBackup() {
        setCreating(true);
        resetMessages();

        setProgress({
            value: 0,
            message:
                "Backup wird vorbereitet …"
        });

        try {
            const backup =
                await createNexusBackup({
                    onProgress:
                        updateProgress
                });

            downloadNexusBackup(
                backup
            );

            setNotice(
                `Backup „${backup.fileName}“ wurde erstellt und heruntergeladen.`
            );
        } catch (backupError) {
            setError(
                backupError.message ??
                "Das Backup konnte nicht erstellt werden."
            );
        } finally {
            setCreating(false);
        }
    }

    async function selectBackupFile(
        file
    ) {
        if (!file) {
            return;
        }

        setSelectedFile(
            file
        );

        setInspection(null);
        setInspecting(true);
        resetMessages();

        setProgress({
            value: 0,
            message:
                "Backup wird geprüft …"
        });

        try {
            const result =
                await inspectNexusBackup(
                    file,
                    {
                        onProgress:
                            updateProgress
                    }
                );

            setInspection(
                result
            );

            setNotice(
                "Das Backup ist gültig und kann wiederhergestellt werden."
            );
        } catch (inspectionError) {
            setSelectedFile(null);

            setError(
                inspectionError.message ??
                "Die Backup-Datei konnte nicht geprüft werden."
            );
        } finally {
            setInspecting(false);
        }
    }

    function handleFileInput(
        event
    ) {
        const file =
            event.target.files?.[0];

        selectBackupFile(
            file
        );

        event.target.value = "";
    }

    function handleDragOver(
        event
    ) {
        event.preventDefault();

        if (!busy) {
            setDragActive(true);
        }
    }

    function handleDragLeave(
        event
    ) {
        event.preventDefault();

        if (
            event.currentTarget.contains(
                event.relatedTarget
            )
        ) {
            return;
        }

        setDragActive(false);
    }

    function handleDrop(event) {
        event.preventDefault();

        setDragActive(false);

        if (busy) {
            return;
        }

        const file =
            event.dataTransfer
                .files?.[0];

        selectBackupFile(
            file
        );
    }

    function clearSelectedFile() {
        setSelectedFile(null);
        setInspection(null);
        setProgress({
            value: 0,
            message: ""
        });

        resetMessages();
    }

    async function handleRestore() {
        if (
            !selectedFile ||
            !inspection
        ) {
            return;
        }

        const confirmed =
            globalThis.confirm(
                [
                    "Backup wirklich wiederherstellen?",
                    "",
                    "Dabei werden die aktuellen Inhalte, Seiten, Einstellungen und Medien durch den Stand aus dem Backup ersetzt.",
                    "",
                    "Erstelle vorher ein aktuelles Backup, wenn du den jetzigen Stand behalten möchtest."
                ].join("\n")
            );

        if (!confirmed) {
            return;
        }

        setRestoring(true);
        resetMessages();

        setProgress({
            value: 0,
            message:
                "Wiederherstellung wird vorbereitet …"
        });

        try {
            const result =
                await restoreNexusBackup(
                    selectedFile,
                    {
                        onProgress:
                            updateProgress
                    }
                );

            setNotice(
                `${result.restoredStorageEntries} Speicherbereiche und ${result.restoredMediaAssets} Medien wurden wiederhergestellt. Nexus wird neu geladen …`
            );

            globalThis.setTimeout(
                () => {
                    globalThis.location.reload();
                },
                1300
            );
        } catch (restoreError) {
            setError(
                restoreError.message ??
                "Das Backup konnte nicht wiederhergestellt werden."
            );

            setRestoring(false);
        }
    }

    return (
        <AdminPage
            title="Sicherungen"
            description="Nexus-Inhalte und Medien vollständig sichern oder wiederherstellen."
        >
            {
                error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )
            }

            {
                notice && (
                    <div className="alert alert-success">
                        {notice}
                    </div>
                )
            }

            {
                busy && (
                    <section className="backup-progress">
                        <div className="backup-progress__header">
                            <strong>
                                {
                                    progress.message ||
                                    "Vorgang läuft …"
                                }
                            </strong>

                            <span>
                                {progress.value} %
                            </span>
                        </div>

                        <div
                            className="backup-progress__track"
                            role="progressbar"
                            aria-valuenow={
                                progress.value
                            }
                            aria-valuemin="0"
                            aria-valuemax="100"
                        >
                            <div
                                className="backup-progress__value"
                                style={{
                                    width:
                                        `${progress.value}%`
                                }}
                            />
                        </div>
                    </section>
                )
            }

            <div className="backup-grid">
                <section className="backup-card">
                    <div className="backup-card__icon">
                        <i
                            className="bi bi-cloud-arrow-down"
                            aria-hidden="true"
                        />
                    </div>

                    <div className="backup-card__content">
                        <span className="backup-card__eyebrow">
                            Export
                        </span>

                        <h2>
                            Vollständiges Backup
                        </h2>

                        <p>
                            Speichert alle Website-Inhalte, Builder-Seiten,
                            Navigationseinstellungen, Layouts und Medien in
                            einer ZIP-Datei.
                        </p>

                        <div className="backup-card__information">
                            <div>
                                <i
                                    className="bi bi-database-check"
                                    aria-hidden="true"
                                />

                                <span>
                                    Inhalte und Einstellungen
                                </span>
                            </div>

                            <div>
                                <i
                                    className="bi bi-images"
                                    aria-hidden="true"
                                />

                                <span>
                                    Originale Mediendateien
                                </span>
                            </div>

                            <div>
                                <i
                                    className="bi bi-shield-check"
                                    aria-hidden="true"
                                />

                                <span>
                                    Keine Passwörter oder Sessions
                                </span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            onClick={
                                handleCreateBackup
                            }
                            disabled={busy}
                        >
                            {
                                creating
                                    ? "Backup wird erstellt …"
                                    : "Backup herunterladen"
                            }
                        </Button>
                    </div>
                </section>

                <section className="backup-card">
                    <div className="backup-card__icon backup-card__icon--restore">
                        <i
                            className="bi bi-cloud-arrow-up"
                            aria-hidden="true"
                        />
                    </div>

                    <div className="backup-card__content">
                        <span className="backup-card__eyebrow">
                            Import
                        </span>

                        <h2>
                            Backup wiederherstellen
                        </h2>

                        <p>
                            Prüft eine Nexus-Sicherung und ersetzt anschließend
                            die aktuellen lokalen Inhalte und Medien.
                        </p>

                        <div
                            className={
                                dragActive
                                    ? "backup-dropzone backup-dropzone--active"
                                    : "backup-dropzone"
                            }
                            onDragOver={
                                handleDragOver
                            }
                            onDragLeave={
                                handleDragLeave
                            }
                            onDrop={
                                handleDrop
                            }
                        >
                            <i
                                className="bi bi-file-earmark-zip"
                                aria-hidden="true"
                            />

                            <strong>
                                ZIP-Backup hierher ziehen
                            </strong>

                            <span>
                                oder eine Datei auswählen
                            </span>

                            <Button
                                type="button"
                                variant="secondary"
                                disabled={busy}
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                            >
                                Backup auswählen
                            </Button>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".zip,application/zip,application/x-zip-compressed"
                            hidden
                            onChange={
                                handleFileInput
                            }
                        />
                    </div>
                </section>
            </div>

            {
                selectedFile &&
                inspection && (
                    <section className="backup-inspection">
                        <div className="backup-inspection__header">
                            <div>
                                <span className="backup-card__eyebrow">
                                    Geprüfte Sicherung
                                </span>

                                <h2>
                                    {
                                        selectedFile.name
                                    }
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="backup-inspection__close"
                                onClick={
                                    clearSelectedFile
                                }
                                disabled={restoring}
                                aria-label="Ausgewählte Sicherung entfernen"
                            >
                                <i
                                    className="bi bi-x-lg"
                                    aria-hidden="true"
                                />
                            </button>
                        </div>

                        <div className="backup-inspection__stats">
                            <article>
                                <i
                                    className="bi bi-calendar3"
                                    aria-hidden="true"
                                />

                                <div>
                                    <span>
                                        Erstellt
                                    </span>

                                    <strong>
                                        {
                                            formatDate(
                                                inspection
                                                    .manifest
                                                    .createdAt
                                            )
                                        }
                                    </strong>
                                </div>
                            </article>

                            <article>
                                <i
                                    className="bi bi-hdd"
                                    aria-hidden="true"
                                />

                                <div>
                                    <span>
                                        Dateigröße
                                    </span>

                                    <strong>
                                        {
                                            formatBackupFileSize(
                                                selectedFile.size
                                            )
                                        }
                                    </strong>
                                </div>
                            </article>

                            <article>
                                <i
                                    className="bi bi-database"
                                    aria-hidden="true"
                                />

                                <div>
                                    <span>
                                        Speicherbereiche
                                    </span>

                                    <strong>
                                        {
                                            inspection
                                                .storageEntryCount
                                        }
                                    </strong>
                                </div>
                            </article>

                            <article>
                                <i
                                    className="bi bi-images"
                                    aria-hidden="true"
                                />

                                <div>
                                    <span>
                                        Medien
                                    </span>

                                    <strong>
                                        {
                                            inspection
                                                .mediaAssetCount
                                        }
                                    </strong>
                                </div>
                            </article>

                            <article>
                                <i
                                    className="bi bi-box"
                                    aria-hidden="true"
                                />

                                <div>
                                    <span>
                                        Backup-Version
                                    </span>

                                    <strong>
                                        {
                                            inspection
                                                .manifest
                                                .formatVersion
                                        }
                                    </strong>
                                </div>
                            </article>

                            <article>
                                <i
                                    className="bi bi-code-square"
                                    aria-hidden="true"
                                />

                                <div>
                                    <span>
                                        Nexus-Version
                                    </span>

                                    <strong>
                                        {
                                            inspection
                                                .manifest
                                                .application
                                                ?.version ??
                                            "Unbekannt"
                                        }
                                    </strong>
                                </div>
                            </article>
                        </div>

                        <div className="backup-inspection__warning">
                            <i
                                className="bi bi-exclamation-triangle"
                                aria-hidden="true"
                            />

                            <div>
                                <strong>
                                    Aktuelle Daten werden ersetzt
                                </strong>

                                <p>
                                    Erstelle vor der Wiederherstellung ein
                                    aktuelles Backup, sofern der momentane Stand
                                    nicht verloren gehen darf.
                                </p>
                            </div>
                        </div>

                        <div className="backup-inspection__actions">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={
                                    clearSelectedFile
                                }
                                disabled={restoring}
                            >
                                Abbrechen
                            </Button>

                            <Button
                                type="button"
                                onClick={
                                    handleRestore
                                }
                                disabled={restoring}
                            >
                                {
                                    restoring
                                        ? "Wird wiederhergestellt …"
                                        : "Sicherung wiederherstellen"
                                }
                            </Button>
                        </div>
                    </section>
                )
            }

            <section className="backup-notes">
                <div>
                    <i
                        className="bi bi-lightbulb"
                        aria-hidden="true"
                    />

                    <div>
                        <h2>
                            Empfohlene Sicherungszeitpunkte
                        </h2>

                        <p>
                            Erstelle ein Backup vor größeren Builder-Änderungen,
                            vor Datenmigrationen und bevor Nexus später auf den
                            VPS übertragen wird.
                        </p>
                    </div>
                </div>

                <div>
                    <i
                        className="bi bi-lock"
                        aria-hidden="true"
                    />

                    <div>
                        <h2>
                            Sicher aufbewahren
                        </h2>

                        <p>
                            Die ZIP-Datei kann sämtliche öffentlichen Inhalte
                            und hochgeladenen Medien enthalten. Bewahre sie
                            deshalb nicht öffentlich zugänglich auf.
                        </p>
                    </div>
                </div>
            </section>
        </AdminPage>
    );
}