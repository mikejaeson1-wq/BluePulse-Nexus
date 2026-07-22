import {
    useEffect,
    useMemo,
    useState
} from "react";

import AdminPage from "../components/AdminPage";

import Button from "@shared/ui/Button";

import {
    getFooterRepository
} from "@shared/data/repositories";

const footerRepository =
    getFooterRepository();

const EMPTY_SETTINGS = {
    brandPrimary: "",
    brandSecondary: "",
    legalName: "",
    slogan: "",
    description: "",
    email: "",
    location: "",
    copyrightText: "",
    showNavigation: true,
    showContact: true,
    showDonationButton: true,
    socialLinks: [],
    legalLinks: []
};

function cloneValue(value) {
    if (
        typeof globalThis.structuredClone ===
        "function"
    ) {
        return globalThis.structuredClone(
            value
        );
    }

    return JSON.parse(
        JSON.stringify(value)
    );
}

function serializeValue(value) {
    return JSON.stringify(value);
}

function createId(prefix) {
    if (
        globalThis.crypto
            ?.randomUUID
    ) {
        return `${prefix}-${globalThis.crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
}

function LoadingState() {
    return (
        <div
            className="d-flex align-items-center justify-content-center gap-3 py-5"
            role="status"
            aria-live="polite"
        >
            <span
                className="spinner-border text-info"
                aria-hidden="true"
            />

            <span>
                Footer-Einstellungen werden aus Nexus geladen …
            </span>
        </div>
    );
}

function TextField({
    label,
    value,
    onChange,
    type = "text",
    className =
        "col-md-6 mb-3",
    placeholder = "",
    disabled = false
}) {
    return (
        <div
            className={
                className
            }
        >
            <label className="form-label">
                {label}
            </label>

            <input
                type={
                    type
                }
                className="form-control"
                value={
                    value ?? ""
                }
                placeholder={
                    placeholder
                }
                disabled={
                    disabled
                }
                onChange={
                    (event) =>
                        onChange(
                            event.target.value
                        )
                }
            />
        </div>
    );
}

function LinkCollectionEditor({
    title,
    description,
    collectionName,
    items,
    showIcon = false,
    disabled = false,
    onChange,
    onAdd,
    onRemove,
    onMove
}) {
    return (
        <section className="mb-5">
            <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                <div>
                    <h2>
                        {title}
                    </h2>

                    <p className="text-secondary mb-0">
                        {description}
                    </p>
                </div>

                <Button
                    type="button"
                    size="sm"
                    disabled={
                        disabled
                    }
                    onClick={
                        onAdd
                    }
                >
                    <i
                        className="bi bi-plus-lg"
                        aria-hidden="true"
                    />

                    Link
                </Button>
            </div>

            {
                items.length ===
                    0 && (
                    <div className="alert alert-secondary">
                        Noch keine Links vorhanden.
                    </div>
                )
            }

            {
                items.map(
                    (
                        item,
                        index
                    ) => (
                        <article
                            key={
                                item.id
                            }
                            className="card bg-dark border-secondary mb-3"
                        >
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                                    <div className="form-check">
                                        <input
                                            id={
                                                `${collectionName}-${item.id}-enabled`
                                            }
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={
                                                Boolean(
                                                    item.enabled
                                                )
                                            }
                                            disabled={
                                                disabled
                                            }
                                            onChange={
                                                (
                                                    event
                                                ) =>
                                                    onChange(
                                                        item.id,
                                                        "enabled",
                                                        event
                                                            .target
                                                            .checked
                                                    )
                                            }
                                        />

                                        <label
                                            className="form-check-label"
                                            htmlFor={
                                                `${collectionName}-${item.id}-enabled`
                                            }
                                        >
                                            Link anzeigen
                                        </label>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            disabled={
                                                disabled ||
                                                index ===
                                                    0
                                            }
                                            onClick={
                                                () =>
                                                    onMove(
                                                        item.id,
                                                        -1
                                                    )
                                            }
                                        >
                                            ↑
                                        </Button>

                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            disabled={
                                                disabled ||
                                                index ===
                                                    items.length -
                                                    1
                                            }
                                            onClick={
                                                () =>
                                                    onMove(
                                                        item.id,
                                                        1
                                                    )
                                            }
                                        >
                                            ↓
                                        </Button>

                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            disabled={
                                                disabled
                                            }
                                            onClick={
                                                () =>
                                                    onRemove(
                                                        item.id
                                                    )
                                            }
                                        >
                                            Entfernen
                                        </Button>
                                    </div>
                                </div>

                                <div className="row">
                                    {
                                        showIcon && (
                                            <div className="col-md-3 mb-3">
                                                <label className="form-label">
                                                    Icon-Klasse
                                                </label>

                                                <input
                                                    className="form-control"
                                                    value={
                                                        item.icon ??
                                                        ""
                                                    }
                                                    disabled={
                                                        disabled
                                                    }
                                                    placeholder="bi bi-discord"
                                                    onChange={
                                                        (
                                                            event
                                                        ) =>
                                                            onChange(
                                                                item.id,
                                                                "icon",
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                    }
                                                />
                                            </div>
                                        )
                                    }

                                    <div
                                        className={
                                            showIcon
                                                ? "col-md-3 mb-3"
                                                : "col-md-5 mb-3"
                                        }
                                    >
                                        <label className="form-label">
                                            Bezeichnung
                                        </label>

                                        <input
                                            className="form-control"
                                            value={
                                                item.label ??
                                                ""
                                            }
                                            disabled={
                                                disabled
                                            }
                                            onChange={
                                                (
                                                    event
                                                ) =>
                                                    onChange(
                                                        item.id,
                                                        "label",
                                                        event
                                                            .target
                                                            .value
                                                    )
                                            }
                                        />
                                    </div>

                                    <div
                                        className={
                                            showIcon
                                                ? "col-md-6 mb-3"
                                                : "col-md-7 mb-3"
                                        }
                                    >
                                        <label className="form-label">
                                            Link-Ziel
                                        </label>

                                        <input
                                            className="form-control"
                                            value={
                                                item.href ??
                                                ""
                                            }
                                            disabled={
                                                disabled
                                            }
                                            placeholder="https://… oder /seite"
                                            onChange={
                                                (
                                                    event
                                                ) =>
                                                    onChange(
                                                        item.id,
                                                        "href",
                                                        event
                                                            .target
                                                            .value
                                                    )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </article>
                    )
                )
            }
        </section>
    );
}

export default function FooterSettings() {
    const [
        settings,
        setSettings
    ] =
        useState(
            EMPTY_SETTINGS
        );

    const [
        savedSettings,
        setSavedSettings
    ] =
        useState(
            EMPTY_SETTINGS
        );

    const [
        loading,
        setLoading
    ] =
        useState(true);

    const [
        saving,
        setSaving
    ] =
        useState(false);

    const [
        resetting,
        setResetting
    ] =
        useState(false);

    const [
        error,
        setError
    ] =
        useState("");

    const [
        message,
        setMessage
    ] =
        useState("");

    const busy =
        saving ||
        resetting;

    const hasUnsavedChanges =
        useMemo(
            () =>
                !loading &&
                serializeValue(
                    settings
                ) !==
                    serializeValue(
                        savedSettings
                    ),
            [
                settings,
                savedSettings,
                loading
            ]
        );

    useEffect(() => {
        let active =
            true;

        const controller =
            new AbortController();

        async function loadFooter() {
            setLoading(true);
            setError("");
            setMessage("");

            try {
                const loadedSettings =
                    await footerRepository.get({
                        signal:
                            controller.signal
                    });

                if (
                    !active ||
                    controller.signal
                        .aborted
                ) {
                    return;
                }

                const nextSettings = {
                    ...EMPTY_SETTINGS,
                    ...(
                        loadedSettings ??
                        {}
                    ),

                    socialLinks:
                        Array.isArray(
                            loadedSettings
                                ?.socialLinks
                        )
                            ? loadedSettings
                                .socialLinks
                            : [],

                    legalLinks:
                        Array.isArray(
                            loadedSettings
                                ?.legalLinks
                        )
                            ? loadedSettings
                                .legalLinks
                            : []
                };

                setSettings(
                    cloneValue(
                        nextSettings
                    )
                );

                setSavedSettings(
                    cloneValue(
                        nextSettings
                    )
                );
            } catch (
                loadError
            ) {
                if (
                    loadError?.name ===
                        "AbortError" ||
                    controller.signal
                        .aborted
                ) {
                    return;
                }

                if (active) {
                    setSettings(
                        cloneValue(
                            EMPTY_SETTINGS
                        )
                    );

                    setSavedSettings(
                        cloneValue(
                            EMPTY_SETTINGS
                        )
                    );

                    setError(
                        loadError.message ??
                        "Die Footer-Einstellungen konnten nicht geladen werden."
                    );
                }
            } finally {
                if (
                    active &&
                    !controller.signal
                        .aborted
                ) {
                    setLoading(false);
                }
            }
        }

        loadFooter();

        return () => {
            active =
                false;

            controller.abort();
        };
    }, []);

    useEffect(() => {
        function handleBeforeUnload(
            event
        ) {
            if (
                !hasUnsavedChanges
            ) {
                return;
            }

            event.preventDefault();
            event.returnValue =
                "";
        }

        globalThis.window.addEventListener(
            "beforeunload",
            handleBeforeUnload
        );

        return () => {
            globalThis.window.removeEventListener(
                "beforeunload",
                handleBeforeUnload
            );
        };
    }, [
        hasUnsavedChanges
    ]);

    function clearFeedback() {
        setMessage("");
        setError("");
    }

    function updateField(
        field,
        value
    ) {
        setSettings(
            (
                currentSettings
            ) => ({
                ...currentSettings,
                [field]:
                    value
            })
        );

        clearFeedback();
    }

    function updateLink(
        collectionName,
        linkId,
        field,
        value
    ) {
        setSettings(
            (
                currentSettings
            ) => ({
                ...currentSettings,

                [collectionName]:
                    (
                        currentSettings[
                            collectionName
                        ] ?? []
                    ).map(
                        (link) =>
                            link.id ===
                            linkId
                                ? {
                                    ...link,
                                    [field]:
                                        value
                                }
                                : link
                    )
            })
        );

        clearFeedback();
    }

    function addLink(
        collectionName,
        type
    ) {
        const newLink = {
            id:
                createId(
                    type
                ),

            icon:
                type ===
                    "social"
                    ? "bi bi-link-45deg"
                    : "",

            label:
                "Neuer Link",

            href:
                "",

            enabled:
                false
        };

        setSettings(
            (
                currentSettings
            ) => ({
                ...currentSettings,

                [collectionName]: [
                    ...(
                        currentSettings[
                            collectionName
                        ] ?? []
                    ),
                    newLink
                ]
            })
        );

        clearFeedback();
    }

    function removeLink(
        collectionName,
        linkId
    ) {
        const link =
            (
                settings[
                    collectionName
                ] ?? []
            ).find(
                (
                    currentLink
                ) =>
                    currentLink.id ===
                    linkId
            );

        if (
            !globalThis.confirm(
                `„${link?.label ?? "Diesen Link"}“ entfernen?`
            )
        ) {
            return;
        }

        setSettings(
            (
                currentSettings
            ) => ({
                ...currentSettings,

                [collectionName]:
                    (
                        currentSettings[
                            collectionName
                        ] ?? []
                    ).filter(
                        (currentLink) =>
                            currentLink.id !==
                            linkId
                    )
            })
        );

        clearFeedback();
    }

    function moveLink(
        collectionName,
        linkId,
        direction
    ) {
        setSettings(
            (
                currentSettings
            ) => {
                const links = [
                    ...(
                        currentSettings[
                            collectionName
                        ] ?? []
                    )
                ];

                const currentIndex =
                    links.findIndex(
                        (link) =>
                            link.id ===
                            linkId
                    );

                const nextIndex =
                    currentIndex +
                    direction;

                if (
                    currentIndex ===
                        -1 ||
                    nextIndex <
                        0 ||
                    nextIndex >=
                        links.length
                ) {
                    return currentSettings;
                }

                [
                    links[
                        currentIndex
                    ],
                    links[
                        nextIndex
                    ]
                ] = [
                    links[
                        nextIndex
                    ],
                    links[
                        currentIndex
                    ]
                ];

                return {
                    ...currentSettings,
                    [collectionName]:
                        links
                };
            }
        );

        clearFeedback();
    }

    async function saveFooter(
        event
    ) {
        event.preventDefault();

        if (
            busy ||
            !hasUnsavedChanges
        ) {
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        try {
            const savedSettings =
                await footerRepository.update(
                    settings
                );

            const nextSettings = {
                ...EMPTY_SETTINGS,
                ...savedSettings,

                socialLinks:
                    Array.isArray(
                        savedSettings
                            ?.socialLinks
                    )
                        ? savedSettings
                            .socialLinks
                        : [],

                legalLinks:
                    Array.isArray(
                        savedSettings
                            ?.legalLinks
                    )
                        ? savedSettings
                            .legalLinks
                        : []
            };

            setSettings(
                cloneValue(
                    nextSettings
                )
            );

            setSavedSettings(
                cloneValue(
                    nextSettings
                )
            );

            setMessage(
                footerRepository.mode ===
                    "api"
                    ? "Footer wurde in PostgreSQL gespeichert."
                    : "Footer wurde gespeichert."
            );
        } catch (
            saveError
        ) {
            setError(
                saveError.message ??
                "Der Footer konnte nicht gespeichert werden."
            );
        } finally {
            setSaving(false);
        }
    }

    async function restoreDefaults() {
        if (busy) {
            return;
        }

        if (
            !globalThis.confirm(
                "Footer auf die Standardwerte zurücksetzen?"
            )
        ) {
            return;
        }

        setResetting(true);
        setError("");
        setMessage("");

        try {
            const defaultSettings =
                await footerRepository.reset();

            const nextSettings = {
                ...EMPTY_SETTINGS,
                ...defaultSettings,

                socialLinks:
                    Array.isArray(
                        defaultSettings
                            ?.socialLinks
                    )
                        ? defaultSettings
                            .socialLinks
                        : [],

                legalLinks:
                    Array.isArray(
                        defaultSettings
                            ?.legalLinks
                    )
                        ? defaultSettings
                            .legalLinks
                        : []
            };

            setSettings(
                cloneValue(
                    nextSettings
                )
            );

            setSavedSettings(
                cloneValue(
                    nextSettings
                )
            );

            setMessage(
                footerRepository.mode ===
                    "api"
                    ? "Footer-Standardwerte wurden in PostgreSQL wiederhergestellt."
                    : "Standardwerte wurden wiederhergestellt."
            );
        } catch (
            resetError
        ) {
            setError(
                resetError.message ??
                "Die Footer-Standardwerte konnten nicht wiederhergestellt werden."
            );
        } finally {
            setResetting(false);
        }
    }

    function openWebsite() {
        globalThis.window.open(
            "/#footer",
            "_blank",
            "noopener,noreferrer"
        );
    }

    return (
        <AdminPage
            title="Footer"
            description={
                footerRepository.mode ===
                    "api"
                    ? "Globale Informationen, Links und Social-Media-Kanäle direkt in PostgreSQL verwalten."
                    : "Globale Informationen, Links und Social-Media-Kanäle verwalten."
            }
            action={
                <Button
                    variant="secondary"
                    onClick={
                        openWebsite
                    }
                >
                    Footer ansehen
                </Button>
            }
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

            {
                hasUnsavedChanges && (
                    <div className="alert alert-warning">
                        Es gibt ungespeicherte Änderungen.
                    </div>
                )
            }

            {
                loading ? (
                    <LoadingState />
                ) : (
                    <form
                        onSubmit={
                            saveFooter
                        }
                    >
                        <fieldset
                            disabled={
                                busy
                            }
                            className="border-0 p-0 m-0"
                        >
                            <section className="mb-5">
                                <h2 className="mb-3">
                                    Organisation
                                </h2>

                                <div className="row">
                                    <TextField
                                        label="Logo – erster Teil"
                                        value={
                                            settings.brandPrimary
                                        }
                                        className="col-md-3 mb-3"
                                        disabled={
                                            busy
                                        }
                                        onChange={
                                            (value) =>
                                                updateField(
                                                    "brandPrimary",
                                                    value
                                                )
                                        }
                                    />

                                    <TextField
                                        label="Logo – zweiter Teil"
                                        value={
                                            settings.brandSecondary
                                        }
                                        className="col-md-3 mb-3"
                                        disabled={
                                            busy
                                        }
                                        onChange={
                                            (value) =>
                                                updateField(
                                                    "brandSecondary",
                                                    value
                                                )
                                        }
                                    />

                                    <TextField
                                        label="Vollständiger Vereinsname"
                                        value={
                                            settings.legalName
                                        }
                                        className="col-md-6 mb-3"
                                        disabled={
                                            busy
                                        }
                                        onChange={
                                            (value) =>
                                                updateField(
                                                    "legalName",
                                                    value
                                                )
                                        }
                                    />

                                    <TextField
                                        label="Motto"
                                        value={
                                            settings.slogan
                                        }
                                        disabled={
                                            busy
                                        }
                                        onChange={
                                            (value) =>
                                                updateField(
                                                    "slogan",
                                                    value
                                                )
                                        }
                                    />

                                    <TextField
                                        label="E-Mail"
                                        type="email"
                                        value={
                                            settings.email
                                        }
                                        disabled={
                                            busy
                                        }
                                        onChange={
                                            (value) =>
                                                updateField(
                                                    "email",
                                                    value
                                                )
                                        }
                                    />

                                    <div className="col-12 mb-3">
                                        <label className="form-label">
                                            Beschreibung
                                        </label>

                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            value={
                                                settings.description ??
                                                ""
                                            }
                                            disabled={
                                                busy
                                            }
                                            onChange={
                                                (
                                                    event
                                                ) =>
                                                    updateField(
                                                        "description",
                                                        event
                                                            .target
                                                            .value
                                                    )
                                            }
                                        />
                                    </div>

                                    <TextField
                                        label="Standort"
                                        value={
                                            settings.location
                                        }
                                        disabled={
                                            busy
                                        }
                                        onChange={
                                            (value) =>
                                                updateField(
                                                    "location",
                                                    value
                                                )
                                        }
                                    />

                                    <TextField
                                        label="Copyright-Text"
                                        value={
                                            settings.copyrightText
                                        }
                                        disabled={
                                            busy
                                        }
                                        onChange={
                                            (value) =>
                                                updateField(
                                                    "copyrightText",
                                                    value
                                                )
                                        }
                                    />
                                </div>
                            </section>

                            <section className="mb-5">
                                <h2 className="mb-3">
                                    Sichtbarkeit
                                </h2>

                                <div className="d-flex flex-column gap-3">
                                    <div className="form-check">
                                        <input
                                            id="footer-show-navigation"
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={
                                                Boolean(
                                                    settings.showNavigation
                                                )
                                            }
                                            disabled={
                                                busy
                                            }
                                            onChange={
                                                (
                                                    event
                                                ) =>
                                                    updateField(
                                                        "showNavigation",
                                                        event
                                                            .target
                                                            .checked
                                                    )
                                            }
                                        />

                                        <label
                                            className="form-check-label"
                                            htmlFor="footer-show-navigation"
                                        >
                                            Hauptnavigation im Footer anzeigen
                                        </label>
                                    </div>

                                    <div className="form-check">
                                        <input
                                            id="footer-show-contact"
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={
                                                Boolean(
                                                    settings.showContact
                                                )
                                            }
                                            disabled={
                                                busy
                                            }
                                            onChange={
                                                (
                                                    event
                                                ) =>
                                                    updateField(
                                                        "showContact",
                                                        event
                                                            .target
                                                            .checked
                                                    )
                                            }
                                        />

                                        <label
                                            className="form-check-label"
                                            htmlFor="footer-show-contact"
                                        >
                                            Kontaktdaten anzeigen
                                        </label>
                                    </div>

                                    <div className="form-check">
                                        <input
                                            id="footer-show-donation"
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={
                                                Boolean(
                                                    settings
                                                        .showDonationButton
                                                )
                                            }
                                            disabled={
                                                busy
                                            }
                                            onChange={
                                                (
                                                    event
                                                ) =>
                                                    updateField(
                                                        "showDonationButton",
                                                        event
                                                            .target
                                                            .checked
                                                    )
                                            }
                                        />

                                        <label
                                            className="form-check-label"
                                            htmlFor="footer-show-donation"
                                        >
                                            Spendenbutton anzeigen
                                        </label>
                                    </div>
                                </div>
                            </section>

                            <LinkCollectionEditor
                                title="Social Media"
                                description="Discord, Instagram, Facebook und weitere Plattformen."
                                collectionName="socialLinks"
                                items={
                                    settings.socialLinks ??
                                    []
                                }
                                showIcon
                                disabled={
                                    busy
                                }
                                onAdd={
                                    () =>
                                        addLink(
                                            "socialLinks",
                                            "social"
                                        )
                                }
                                onChange={
                                    (
                                        id,
                                        field,
                                        value
                                    ) =>
                                        updateLink(
                                            "socialLinks",
                                            id,
                                            field,
                                            value
                                        )
                                }
                                onRemove={
                                    (id) =>
                                        removeLink(
                                            "socialLinks",
                                            id
                                        )
                                }
                                onMove={
                                    (
                                        id,
                                        direction
                                    ) =>
                                        moveLink(
                                            "socialLinks",
                                            id,
                                            direction
                                        )
                                }
                            />

                            <LinkCollectionEditor
                                title="Rechtliche Links"
                                description="Links werden erst angezeigt, wenn sie aktiviert sind."
                                collectionName="legalLinks"
                                items={
                                    settings.legalLinks ??
                                    []
                                }
                                disabled={
                                    busy
                                }
                                onAdd={
                                    () =>
                                        addLink(
                                            "legalLinks",
                                            "legal"
                                        )
                                }
                                onChange={
                                    (
                                        id,
                                        field,
                                        value
                                    ) =>
                                        updateLink(
                                            "legalLinks",
                                            id,
                                            field,
                                            value
                                        )
                                }
                                onRemove={
                                    (id) =>
                                        removeLink(
                                            "legalLinks",
                                            id
                                        )
                                }
                                onMove={
                                    (
                                        id,
                                        direction
                                    ) =>
                                        moveLink(
                                            "legalLinks",
                                            id,
                                            direction
                                        )
                                }
                            />
                        </fieldset>

                        <div className="d-flex flex-wrap gap-2">
                            <Button
                                type="submit"
                                disabled={
                                    busy ||
                                    !hasUnsavedChanges
                                }
                            >
                                {
                                    saving ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm"
                                                aria-hidden="true"
                                            />

                                            Wird gespeichert …
                                        </>
                                    ) : (
                                        <>
                                            <i
                                                className="bi bi-database-check"
                                                aria-hidden="true"
                                            />

                                            Footer speichern
                                        </>
                                    )
                                }
                            </Button>

                            <Button
                                type="button"
                                variant="secondary"
                                disabled={
                                    busy
                                }
                                onClick={
                                    restoreDefaults
                                }
                            >
                                {
                                    resetting ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm"
                                                aria-hidden="true"
                                            />

                                            Wird zurückgesetzt …
                                        </>
                                    ) : (
                                        "Standardwerte"
                                    )
                                }
                            </Button>
                        </div>
                    </form>
                )
            }
        </AdminPage>
    );
}