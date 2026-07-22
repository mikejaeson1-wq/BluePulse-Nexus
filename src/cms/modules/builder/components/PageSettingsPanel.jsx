import "./PageSettingsPanel.css";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    generateSlug
} from "@cms/modules/pages/services/pageService";

import {
    getPageSettings,
    setPageSettings
} from "@shared/pages/pageSettings";

import PageSettingsNavigation from "./PageSettingsNavigation";

const TABS = [
    {
        id:
            "general",

        label:
            "Allgemein",

        icon:
            "bi-file-earmark-text"
    },

    {
        id:
            "seo",

        label:
            "SEO",

        icon:
            "bi-search"
    },

    {
        id:
            "social",

        label:
            "Social Media",

        icon:
            "bi-share"
    },

    {
        id:
            "navigation",

        label:
            "Navigation",

        icon:
            "bi-list-nested"
    }
];

function CharacterCounter({
    value,
    recommendedMaximum
}) {
    const length =
        String(
            value ??
            ""
        ).length;

    return (
        <span
            className={
                length >
                recommendedMaximum
                    ? "page-settings__counter page-settings__counter--warning"
                    : "page-settings__counter"
            }
        >
            {
                length
            } / {
                recommendedMaximum
            }
        </span>
    );
}

function resolvePreviewUrl(
    page
) {
    const origin =
        globalThis.location
            ?.origin ??
        "https://blue-pulse.de";

    return `${origin}/${page?.slug || "seite"}`;
}

export default function PageSettingsPanel({
    open,
    page,
    onChange,
    onClose
}) {
    const [
        activeTab,
        setActiveTab
    ] =
        useState(
            "general"
        );

    useEffect(() => {
        if (!open) {
            setActiveTab(
                "general"
            );
        }
    }, [
        open
    ]);

    const settings =
        useMemo(
            () =>
                getPageSettings(
                    page
                ),
            [
                page
            ]
        );

    if (
        !open ||
        !page
    ) {
        return null;
    }

    function updatePageField(
        field,
        value
    ) {
        onChange({
            ...page,

            [field]:
                value
        });
    }

    function updateSetting(
        section,
        field,
        value
    ) {
        const nextSettings = {
            ...settings,

            [section]: {
                ...settings[
                    section
                ],

                [field]:
                    value
            }
        };

        onChange(
            setPageSettings(
                page,
                nextSettings
            )
        );
    }

    const resolvedSeoTitle =
        settings.seo.title ||
        page.title ||
        "Seitentitel";

    const resolvedSocialTitle =
        settings.social.title ||
        resolvedSeoTitle;

    const resolvedSocialDescription =
        settings.social.description ||
        settings.seo.description ||
        "Hier erscheint die Social-Media-Beschreibung der Seite.";

    return (
        <div
            className="page-settings"
            role="dialog"
            aria-modal="true"
            aria-label="Seiteneinstellungen"
        >
            <button
                type="button"
                className="page-settings__backdrop"
                aria-label="Seiteneinstellungen schließen"
                onClick={
                    onClose
                }
            />

            <section className="page-settings__panel">
                <header className="page-settings__header">
                    <div>
                        <span>
                            Builder 2.0
                        </span>

                        <h2>
                            Seiteneinstellungen
                        </h2>

                        <small>
                            /{
                                page.slug
                            }
                        </small>
                    </div>

                    <button
                        type="button"
                        className="page-settings__close"
                        onClick={
                            onClose
                        }
                        aria-label="Schließen"
                        title="Schließen"
                    >
                        <i
                            className="bi bi-x-lg"
                            aria-hidden="true"
                        />
                    </button>
                </header>

                <nav
                    className="page-settings__tabs"
                    aria-label="Einstellungsbereiche"
                >
                    {
                        TABS.map(
                            (tab) => (
                                <button
                                    key={
                                        tab.id
                                    }
                                    type="button"
                                    className={
                                        activeTab ===
                                        tab.id
                                            ? "page-settings__tab page-settings__tab--active"
                                            : "page-settings__tab"
                                    }
                                    onClick={
                                        () =>
                                            setActiveTab(
                                                tab.id
                                            )
                                    }
                                >
                                    <i
                                        className={
                                            `bi ${tab.icon}`
                                        }
                                        aria-hidden="true"
                                    />

                                    {
                                        tab.label
                                    }
                                </button>
                            )
                        )
                    }
                </nav>

                <div className="page-settings__body">
                    {
                        activeTab ===
                        "general" && (
                            <section className="page-settings__section">
                                <div className="page-settings__section-heading">
                                    <h3>
                                        Allgemeine Seitendaten
                                    </h3>

                                    <p>
                                        Titel, Adresse und Seitentyp werden gemeinsam mit dem Builder-Inhalt gespeichert.
                                    </p>
                                </div>

                                <div className="page-settings__field">
                                    <label htmlFor="builder-page-title">
                                        Seitentitel
                                    </label>

                                    <input
                                        id="builder-page-title"
                                        className="form-control"
                                        value={
                                            page.title ??
                                            ""
                                        }
                                        maxLength="250"
                                        onChange={
                                            (event) =>
                                                updatePageField(
                                                    "title",
                                                    event.target.value
                                                )
                                        }
                                    />
                                </div>

                                <div className="page-settings__field">
                                    <label htmlFor="builder-page-slug">
                                        Seitenadresse
                                    </label>

                                    <div className="input-group">
                                        <span className="input-group-text">
                                            /
                                        </span>

                                        <input
                                            id="builder-page-slug"
                                            className="form-control"
                                            value={
                                                page.slug ??
                                                ""
                                            }
                                            maxLength="180"
                                            onChange={
                                                (event) =>
                                                    updatePageField(
                                                        "slug",
                                                        generateSlug(
                                                            event.target.value
                                                        )
                                                    )
                                            }
                                        />
                                    </div>

                                    <small>
                                        Öffentliche Adresse: {
                                            resolvePreviewUrl(
                                                page
                                            )
                                        }
                                    </small>
                                </div>

                                <div className="page-settings__field">
                                    <label htmlFor="builder-page-template">
                                        Template
                                    </label>

                                    <select
                                        id="builder-page-template"
                                        className="form-select"
                                        value={
                                            page.template ??
                                            "default"
                                        }
                                        onChange={
                                            (event) =>
                                                updatePageField(
                                                    "template",
                                                    event.target.value
                                                )
                                        }
                                    >
                                        <option value="default">
                                            Standardseite
                                        </option>

                                        <option value="landing">
                                            Landingpage
                                        </option>

                                        <option value="blank">
                                            Leere Seite
                                        </option>
                                    </select>
                                </div>

                                <div className="page-settings__information">
                                    <i
                                        className="bi bi-clock-history"
                                        aria-hidden="true"
                                    />

                                    Änderungen an den Seiteneinstellungen werden ebenfalls im Versionsverlauf gespeichert.
                                </div>
                            </section>
                        )
                    }

                    {
                        activeTab ===
                        "seo" && (
                            <section className="page-settings__section">
                                <div className="page-settings__section-heading">
                                    <h3>
                                        Suchmaschinen
                                    </h3>

                                    <p>
                                        Lege fest, wie die Seite in Suchergebnissen beschrieben und von Suchmaschinen behandelt wird.
                                    </p>
                                </div>

                                <div className="page-settings__field">
                                    <div className="page-settings__label-row">
                                        <label htmlFor="builder-seo-title">
                                            SEO-Titel
                                        </label>

                                        <CharacterCounter
                                            value={
                                                settings.seo.title
                                            }
                                            recommendedMaximum={
                                                60
                                            }
                                        />
                                    </div>

                                    <input
                                        id="builder-seo-title"
                                        className="form-control"
                                        value={
                                            settings.seo.title
                                        }
                                        maxLength="120"
                                        placeholder={
                                            page.title
                                        }
                                        onChange={
                                            (event) =>
                                                updateSetting(
                                                    "seo",
                                                    "title",
                                                    event.target.value
                                                )
                                        }
                                    />

                                    <small>
                                        Leer lassen, um den normalen Seitentitel zu verwenden.
                                    </small>
                                </div>

                                <div className="page-settings__field">
                                    <div className="page-settings__label-row">
                                        <label htmlFor="builder-seo-description">
                                            Meta-Beschreibung
                                        </label>

                                        <CharacterCounter
                                            value={
                                                settings.seo.description
                                            }
                                            recommendedMaximum={
                                                160
                                            }
                                        />
                                    </div>

                                    <textarea
                                        id="builder-seo-description"
                                        className="form-control"
                                        rows="5"
                                        value={
                                            settings.seo.description
                                        }
                                        maxLength="320"
                                        onChange={
                                            (event) =>
                                                updateSetting(
                                                    "seo",
                                                    "description",
                                                    event.target.value
                                                )
                                        }
                                    />
                                </div>

                                <div className="page-settings__field">
                                    <label htmlFor="builder-canonical-url">
                                        Kanonische URL
                                    </label>

                                    <input
                                        id="builder-canonical-url"
                                        className="form-control"
                                        type="url"
                                        value={
                                            settings.seo.canonicalUrl
                                        }
                                        placeholder={
                                            resolvePreviewUrl(
                                                page
                                            )
                                        }
                                        onChange={
                                            (event) =>
                                                updateSetting(
                                                    "seo",
                                                    "canonicalUrl",
                                                    event.target.value
                                                )
                                        }
                                    />

                                    <small>
                                        Leer lassen, um automatisch die öffentliche Seitenadresse zu verwenden.
                                    </small>
                                </div>

                                <div className="page-settings__switch">
                                    <div>
                                        <strong>
                                            Suchmaschinen-Indexierung
                                        </strong>

                                        <span>
                                            Erlaubt Suchmaschinen, diese Seite in Suchergebnissen anzuzeigen.
                                        </span>
                                    </div>

                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={
                                            settings.seo.indexable
                                        }
                                        onChange={
                                            (event) =>
                                                updateSetting(
                                                    "seo",
                                                    "indexable",
                                                    event.target.checked
                                                )
                                        }
                                    />
                                </div>

                                <div className="page-settings__switch">
                                    <div>
                                        <strong>
                                            Links verfolgen
                                        </strong>

                                        <span>
                                            Erlaubt Suchmaschinen, den Links auf dieser Seite zu folgen.
                                        </span>
                                    </div>

                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={
                                            settings.seo.followLinks
                                        }
                                        onChange={
                                            (event) =>
                                                updateSetting(
                                                    "seo",
                                                    "followLinks",
                                                    event.target.checked
                                                )
                                        }
                                    />
                                </div>

                                <div className="page-settings__search-preview">
                                    <span className="page-settings__search-url">
                                        {
                                            settings.seo.canonicalUrl ||
                                            resolvePreviewUrl(
                                                page
                                            )
                                        }
                                    </span>

                                    <strong>
                                        {
                                            resolvedSeoTitle
                                        }
                                    </strong>

                                    <p>
                                        {
                                            settings.seo.description ||
                                            "Noch keine Meta-Beschreibung hinterlegt."
                                        }
                                    </p>
                                </div>
                            </section>
                        )
                    }

                    {
                        activeTab ===
                        "social" && (
                            <section className="page-settings__section">
                                <div className="page-settings__section-heading">
                                    <h3>
                                        Social-Media-Vorschau
                                    </h3>

                                    <p>
                                        Diese Angaben werden für Open Graph und Twitter Cards ausgegeben.
                                    </p>
                                </div>

                                <div className="page-settings__field">
                                    <div className="page-settings__label-row">
                                        <label htmlFor="builder-social-title">
                                            Social-Media-Titel
                                        </label>

                                        <CharacterCounter
                                            value={
                                                settings.social.title
                                            }
                                            recommendedMaximum={
                                                65
                                            }
                                        />
                                    </div>

                                    <input
                                        id="builder-social-title"
                                        className="form-control"
                                        value={
                                            settings.social.title
                                        }
                                        maxLength="120"
                                        placeholder={
                                            resolvedSeoTitle
                                        }
                                        onChange={
                                            (event) =>
                                                updateSetting(
                                                    "social",
                                                    "title",
                                                    event.target.value
                                                )
                                        }
                                    />
                                </div>

                                <div className="page-settings__field">
                                    <div className="page-settings__label-row">
                                        <label htmlFor="builder-social-description">
                                            Social-Media-Beschreibung
                                        </label>

                                        <CharacterCounter
                                            value={
                                                settings.social.description
                                            }
                                            recommendedMaximum={
                                                200
                                            }
                                        />
                                    </div>

                                    <textarea
                                        id="builder-social-description"
                                        className="form-control"
                                        rows="4"
                                        value={
                                            settings.social.description
                                        }
                                        maxLength="320"
                                        placeholder={
                                            settings.seo.description
                                        }
                                        onChange={
                                            (event) =>
                                                updateSetting(
                                                    "social",
                                                    "description",
                                                    event.target.value
                                                )
                                        }
                                    />
                                </div>

                                <div className="page-settings__field">
                                    <label htmlFor="builder-social-image">
                                        Vorschaubild
                                    </label>

                                    <input
                                        id="builder-social-image"
                                        className="form-control"
                                        value={
                                            settings.social.image
                                        }
                                        placeholder="https://… oder /api/media/…"
                                        onChange={
                                            (event) =>
                                                updateSetting(
                                                    "social",
                                                    "image",
                                                    event.target.value
                                                )
                                        }
                                    />
                                </div>

                                <div className="page-settings__field">
                                    <label htmlFor="builder-social-image-alt">
                                        Bildbeschreibung
                                    </label>

                                    <input
                                        id="builder-social-image-alt"
                                        className="form-control"
                                        value={
                                            settings.social.imageAlt
                                        }
                                        maxLength="250"
                                        onChange={
                                            (event) =>
                                                updateSetting(
                                                    "social",
                                                    "imageAlt",
                                                    event.target.value
                                                )
                                        }
                                    />
                                </div>

                                <article className="page-settings__social-preview">
                                    <div className="page-settings__social-image">
                                        {
                                            settings.social.image ? (
                                                <img
                                                    src={
                                                        settings.social.image
                                                    }
                                                    alt={
                                                        settings.social.imageAlt ||
                                                        ""
                                                    }
                                                />
                                            ) : (
                                                <div>
                                                    <i
                                                        className="bi bi-image"
                                                        aria-hidden="true"
                                                    />

                                                    Kein Vorschaubild
                                                </div>
                                            )
                                        }
                                    </div>

                                    <div className="page-settings__social-content">
                                        <span>
                                            blue-pulse.de
                                        </span>

                                        <strong>
                                            {
                                                resolvedSocialTitle
                                            }
                                        </strong>

                                        <p>
                                            {
                                                resolvedSocialDescription
                                            }
                                        </p>
                                    </div>
                                </article>
                            </section>
                        )
                    }

                    {
                        activeTab ===
                        "navigation" && (
                            <PageSettingsNavigation
                                page={
                                    page
                                }
                                settings={
                                    settings
                                }
                                updateSetting={
                                    updateSetting
                                }
                            />
                        )
                    }
                </div>

                <footer className="page-settings__footer">
                    <span>
                        Änderungen werden beim normalen Speichern oder Veröffentlichen übernommen.
                    </span>

                    <button
                        type="button"
                        className="btn btn-info"
                        onClick={
                            onClose
                        }
                    >
                        Fertig
                    </button>
                </footer>
            </section>
        </div>
    );
}