import {
    useState
} from "react";

import AdminPage from "../components/AdminPage";

import Button from "@shared/ui/Button";

import {
    getFooterSettings,
    resetFooterSettings,
    updateFooterSettings
} from "@shared/footer/footerService";

function cloneValue(value) {
    if (
        typeof globalThis.structuredClone ===
        "function"
    ) {
        return globalThis.structuredClone(value);
    }

    return JSON.parse(
        JSON.stringify(value)
    );
}

function createId(prefix) {
    if (globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
    }

    return `${prefix}-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
}

function LinkCollectionEditor({
    title,
    description,
    collectionName,
    items,
    showIcon = false,
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
                    onClick={onAdd}
                >
                    + Link
                </Button>
            </div>

            {
                items.length === 0 && (
                    <div className="alert alert-secondary">
                        Noch keine Links vorhanden.
                    </div>
                )
            }

            {
                items.map((item, index) => (
                    <article
                        key={item.id}
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
                                            item.enabled
                                        }
                                        onChange={(event) =>
                                            onChange(
                                                item.id,
                                                "enabled",
                                                event.target.checked
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
                                            index === 0
                                        }
                                        onClick={() =>
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
                                            index ===
                                            items.length - 1
                                        }
                                        onClick={() =>
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
                                        onClick={() =>
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
                                                    item.icon
                                                }
                                                onChange={(event) =>
                                                    onChange(
                                                        item.id,
                                                        "icon",
                                                        event.target.value
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
                                            item.label
                                        }
                                        onChange={(event) =>
                                            onChange(
                                                item.id,
                                                "label",
                                                event.target.value
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
                                            item.href
                                        }
                                        placeholder="https://… oder /seite"
                                        onChange={(event) =>
                                            onChange(
                                                item.id,
                                                "href",
                                                event.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </article>
                ))
            }
        </section>
    );
}

export default function FooterSettings() {
    const [
        settings,
        setSettings
    ] = useState(
        () => getFooterSettings()
    );

    const [
        message,
        setMessage
    ] = useState("");

    function updateField(field, value) {
        setSettings(
            (currentSettings) => ({
                ...currentSettings,
                [field]: value
            })
        );

        setMessage("");
    }

    function updateLink(
        collectionName,
        linkId,
        field,
        value
    ) {
        setSettings(
            (currentSettings) => ({
                ...currentSettings,

                [collectionName]:
                    currentSettings[
                        collectionName
                    ].map((link) =>
                        link.id === linkId
                            ? {
                                ...link,
                                [field]: value
                            }
                            : link
                    )
            })
        );

        setMessage("");
    }

    function addLink(
        collectionName,
        type
    ) {
        const newLink = {
            id: createId(type),
            icon:
                type === "social"
                    ? "bi-link-45deg"
                    : "",
            label: "Neuer Link",
            href: "",
            enabled: false
        };

        setSettings(
            (currentSettings) => ({
                ...currentSettings,

                [collectionName]: [
                    ...currentSettings[
                        collectionName
                    ],
                    newLink
                ]
            })
        );

        setMessage("");
    }

    function removeLink(
        collectionName,
        linkId
    ) {
        setSettings(
            (currentSettings) => ({
                ...currentSettings,

                [collectionName]:
                    currentSettings[
                        collectionName
                    ].filter(
                        (link) =>
                            link.id !== linkId
                    )
            })
        );

        setMessage("");
    }

    function moveLink(
        collectionName,
        linkId,
        direction
    ) {
        setSettings(
            (currentSettings) => {
                const links = [
                    ...currentSettings[
                        collectionName
                    ]
                ];

                const currentIndex =
                    links.findIndex(
                        (link) =>
                            link.id === linkId
                    );

                const nextIndex =
                    currentIndex + direction;

                if (
                    currentIndex === -1 ||
                    nextIndex < 0 ||
                    nextIndex >= links.length
                ) {
                    return currentSettings;
                }

                [
                    links[currentIndex],
                    links[nextIndex]
                ] = [
                    links[nextIndex],
                    links[currentIndex]
                ];

                return {
                    ...currentSettings,
                    [collectionName]: links
                };
            }
        );

        setMessage("");
    }

    function saveFooter(event) {
        event.preventDefault();

        const savedSettings =
            updateFooterSettings(
                settings
            );

        setSettings(
            cloneValue(savedSettings)
        );

        setMessage(
            "Footer wurde gespeichert."
        );
    }

    function restoreDefaults() {
        if (
            !confirm(
                "Footer auf die Standardwerte zurücksetzen?"
            )
        ) {
            return;
        }

        const defaultSettings =
            resetFooterSettings();

        setSettings(
            cloneValue(
                defaultSettings
            )
        );

        setMessage(
            "Standardwerte wurden wiederhergestellt."
        );
    }

    function openWebsite() {
        window.open(
            "/#footer",
            "_blank",
            "noopener,noreferrer"
        );
    }

    return (
        <AdminPage
            title="Footer"
            description="Globale Informationen, Links und Social-Media-Kanäle verwalten."
            action={
                <Button
                    variant="secondary"
                    onClick={openWebsite}
                >
                    Footer ansehen
                </Button>
            }
        >
            {
                message && (
                    <div className="alert alert-success">
                        {message}
                    </div>
                )
            }

            <form onSubmit={saveFooter}>
                <section className="mb-5">
                    <h2 className="mb-3">
                        Organisation
                    </h2>

                    <div className="row">
                        <div className="col-md-3 mb-3">
                            <label className="form-label">
                                Logo – erster Teil
                            </label>

                            <input
                                className="form-control"
                                value={
                                    settings.brandPrimary
                                }
                                onChange={(event) =>
                                    updateField(
                                        "brandPrimary",
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="col-md-3 mb-3">
                            <label className="form-label">
                                Logo – zweiter Teil
                            </label>

                            <input
                                className="form-control"
                                value={
                                    settings.brandSecondary
                                }
                                onChange={(event) =>
                                    updateField(
                                        "brandSecondary",
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                Vollständiger Vereinsname
                            </label>

                            <input
                                className="form-control"
                                value={
                                    settings.legalName
                                }
                                onChange={(event) =>
                                    updateField(
                                        "legalName",
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                Motto
                            </label>

                            <input
                                className="form-control"
                                value={
                                    settings.slogan
                                }
                                onChange={(event) =>
                                    updateField(
                                        "slogan",
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                E-Mail
                            </label>

                            <input
                                type="email"
                                className="form-control"
                                value={
                                    settings.email
                                }
                                onChange={(event) =>
                                    updateField(
                                        "email",
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="col-12 mb-3">
                            <label className="form-label">
                                Beschreibung
                            </label>

                            <textarea
                                className="form-control"
                                rows="4"
                                value={
                                    settings.description
                                }
                                onChange={(event) =>
                                    updateField(
                                        "description",
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                Standort
                            </label>

                            <input
                                className="form-control"
                                value={
                                    settings.location
                                }
                                onChange={(event) =>
                                    updateField(
                                        "location",
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                Copyright-Text
                            </label>

                            <input
                                className="form-control"
                                value={
                                    settings.copyrightText
                                }
                                onChange={(event) =>
                                    updateField(
                                        "copyrightText",
                                        event.target.value
                                    )
                                }
                            />
                        </div>
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
                                    settings.showNavigation
                                }
                                onChange={(event) =>
                                    updateField(
                                        "showNavigation",
                                        event.target.checked
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
                                    settings.showContact
                                }
                                onChange={(event) =>
                                    updateField(
                                        "showContact",
                                        event.target.checked
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
                                    settings
                                        .showDonationButton
                                }
                                onChange={(event) =>
                                    updateField(
                                        "showDonationButton",
                                        event.target.checked
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
                        settings.socialLinks
                    }
                    showIcon
                    onAdd={() =>
                        addLink(
                            "socialLinks",
                            "social"
                        )
                    }
                    onChange={(
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
                    onRemove={(id) =>
                        removeLink(
                            "socialLinks",
                            id
                        )
                    }
                    onMove={(id, direction) =>
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
                        settings.legalLinks
                    }
                    onAdd={() =>
                        addLink(
                            "legalLinks",
                            "legal"
                        )
                    }
                    onChange={(
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
                    onRemove={(id) =>
                        removeLink(
                            "legalLinks",
                            id
                        )
                    }
                    onMove={(id, direction) =>
                        moveLink(
                            "legalLinks",
                            id,
                            direction
                        )
                    }
                />

                <div className="d-flex gap-2">
                    <Button type="submit">
                        Footer speichern
                    </Button>

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={
                            restoreDefaults
                        }
                    >
                        Standardwerte
                    </Button>
                </div>
            </form>
        </AdminPage>
    );
}