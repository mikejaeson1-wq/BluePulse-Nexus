import "./LegalPageSetup.css";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import AdminPage from "../components/AdminPage";

import {
    createPage,
    refreshPages,
    updatePage
} from "@cms/modules/pages/services/pageService";

import {
    DEFAULT_LEGAL_SETUP,
    LEGAL_SETUP_STORAGE_KEY,
    createImprintPageTemplate,
    createPrivacyPageTemplate,
    normalizeLegalSetup,
    validateLegalSetup
} from "@shared/legal/legalPageTemplates";

function loadStoredSetup() {
    try {
        const value =
            globalThis.localStorage
                ?.getItem(
                    LEGAL_SETUP_STORAGE_KEY
                );

        if (!value) {
            return normalizeLegalSetup(
                DEFAULT_LEGAL_SETUP
            );
        }

        return normalizeLegalSetup(
            JSON.parse(
                value
            )
        );
    } catch {
        return normalizeLegalSetup(
            DEFAULT_LEGAL_SETUP
        );
    }
}

function normalizeSlug(
    value
) {
    return String(
        value ??
        ""
    )
        .trim()
        .toLowerCase()
        .replace(
            /^\/+|\/+$/g,
            ""
        );
}

export default function LegalPageSetup() {
    const [
        setup,
        setSetup
    ] =
        useState(
            loadStoredSetup
        );

    const [
        pages,
        setPages
    ] =
        useState([]);

    const [
        overwriteDrafts,
        setOverwriteDrafts
    ] =
        useState(false);

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
        error,
        setError
    ] =
        useState("");

    const [
        message,
        setMessage
    ] =
        useState("");

    const validation =
        useMemo(
            () =>
                validateLegalSetup(
                    setup
                ),
            [
                setup
            ]
        );

    const imprintPage =
        useMemo(
            () =>
                pages.find(
                    (
                        page
                    ) =>
                        normalizeSlug(
                            page.slug
                        ) ===
                        "impressum"
                ) ??
                null,
            [
                pages
            ]
        );

    const privacyPage =
        useMemo(
            () =>
                pages.find(
                    (
                        page
                    ) =>
                        [
                            "datenschutz",
                            "datenschutzerklaerung"
                        ].includes(
                            normalizeSlug(
                                page.slug
                            )
                        )
                ) ??
                null,
            [
                pages
            ]
        );

    async function loadPages() {
        setLoading(
            true
        );

        setError(
            ""
        );

        try {
            const loadedPages =
                await Promise.resolve(
                    refreshPages()
                );

            setPages(
                Array.isArray(
                    loadedPages
                )
                    ? loadedPages
                    : []
            );
        } catch (
            loadError
        ) {
            setError(
                loadError?.message ??
                "Die vorhandenen Seiten konnten nicht geladen werden."
            );
        } finally {
            setLoading(
                false
            );
        }
    }

    useEffect(() => {
        loadPages();
    }, []);

    useEffect(() => {
        try {
            globalThis.localStorage
                ?.setItem(
                    LEGAL_SETUP_STORAGE_KEY,
                    JSON.stringify(
                        setup
                    )
                );
        } catch {
            // Der Assistent funktioniert auch ohne lokalen Speicher.
        }
    }, [
        setup
    ]);

    function updateField(
        field,
        value
    ) {
        setSetup(
            (
                currentSetup
            ) => ({
                ...currentSetup,

                [field]:
                    value
            })
        );

        setMessage(
            ""
        );
    }

    async function createOrUpdateTemplate(
        template,
        existingPage
    ) {
        if (!existingPage) {
            return createPage(
                template
            );
        }

        if (
            existingPage.status ===
            "published"
        ) {
            return {
                skipped:
                    true,

                reason:
                    `„${existingPage.title}“ ist bereits veröffentlicht und wurde zum Schutz vor unbeabsichtigten Live-Änderungen nicht überschrieben.`
            };
        }

        if (!overwriteDrafts) {
            return {
                skipped:
                    true,

                reason:
                    `Der vorhandene Entwurf „${existingPage.title}“ wurde nicht überschrieben.`
            };
        }

        return updatePage(
            existingPage.id,
            {
                ...template,

                id:
                    existingPage.id,

                status:
                    "draft"
            }
        );
    }

    async function handleGenerate() {
        if (saving) {
            return;
        }

        setSaving(
            true
        );

        setError(
            ""
        );

        setMessage(
            ""
        );

        try {
            const results =
                await Promise.all([
                    createOrUpdateTemplate(
                        createImprintPageTemplate(
                            setup
                        ),
                        imprintPage
                    ),

                    createOrUpdateTemplate(
                        createPrivacyPageTemplate(
                            setup
                        ),
                        privacyPage
                    )
                ]);

            const skippedMessages =
                results
                    .filter(
                        (
                            result
                        ) =>
                            result?.skipped
                    )
                    .map(
                        (
                            result
                        ) =>
                            result.reason
                    );

            await loadPages();

            setMessage(
                skippedMessages.length >
                0
                    ? `Die Rechtseiten wurden verarbeitet. ${skippedMessages.join(
                        " "
                    )}`
                    : "Impressum und Datenschutzerklärung wurden als Builder-Entwürfe angelegt beziehungsweise aktualisiert."
            );
        } catch (
            saveError
        ) {
            setError(
                saveError?.message ??
                "Die Rechtseiten konnten nicht angelegt werden."
            );
        } finally {
            setSaving(
                false
            );
        }
    }

    return (
        <AdminPage
            title="Rechtsseiten-Assistent"
            description="Impressum und Datenschutzerklärung als bearbeitbare Builder-Entwürfe vorbereiten."
            action={
                <Link
                    className="legal-setup__back"
                    to="/admin/seo"
                >
                    <i
                        className="bi bi-arrow-left"
                        aria-hidden="true"
                    />

                    SEO & Recht
                </Link>
            }
        >
            <div className="legal-setup">
                {
                    error && (
                        <div
                            className="legal-setup__alert legal-setup__alert--error"
                            role="alert"
                        >
                            <i
                                className="bi bi-exclamation-circle-fill"
                                aria-hidden="true"
                            />

                            {
                                error
                            }
                        </div>
                    )
                }

                {
                    message && (
                        <div
                            className="legal-setup__alert legal-setup__alert--success"
                            role="status"
                        >
                            <i
                                className="bi bi-check-circle-fill"
                                aria-hidden="true"
                            />

                            {
                                message
                            }
                        </div>
                    )
                }

                <section className="legal-setup__status">
                    <article>
                        <span>
                            <i
                                className="bi bi-building"
                                aria-hidden="true"
                            />
                        </span>

                        <div>
                            <strong>
                                Impressum
                            </strong>

                            <small>
                                {
                                    !imprintPage
                                        ? "Noch nicht angelegt"
                                        : imprintPage.status ===
                                            "published"
                                            ? "Veröffentlicht"
                                            : "Entwurf vorhanden"
                                }
                            </small>
                        </div>

                        {
                            imprintPage && (
                                <Link
                                    to={
                                        `/admin/pages/${imprintPage.id}`
                                    }
                                >
                                    Bearbeiten
                                </Link>
                            )
                        }
                    </article>

                    <article>
                        <span>
                            <i
                                className="bi bi-shield-lock"
                                aria-hidden="true"
                            />
                        </span>

                        <div>
                            <strong>
                                Datenschutz
                            </strong>

                            <small>
                                {
                                    !privacyPage
                                        ? "Noch nicht angelegt"
                                        : privacyPage.status ===
                                            "published"
                                            ? "Veröffentlicht"
                                            : "Entwurf vorhanden"
                                }
                            </small>
                        </div>

                        {
                            privacyPage && (
                                <Link
                                    to={
                                        `/admin/pages/${privacyPage.id}`
                                    }
                                >
                                    Bearbeiten
                                </Link>
                            )
                        }
                    </article>
                </section>

                <div className="legal-setup__layout">
                    <section className="legal-setup__panel">
                        <header>
                            <span>
                                Vereinsangaben
                            </span>

                            <h2>
                                Anbieter und Verantwortliche
                            </h2>
                        </header>

                        <div className="legal-setup__fields">
                            <label>
                                <span>
                                    Vollständiger Vereinsname
                                </span>

                                <input
                                    value={
                                        setup.organizationName
                                    }
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            updateField(
                                                "organizationName",
                                                event.target.value
                                            )
                                    }
                                />
                            </label>

                            <label>
                                <span>
                                    Rechtsform und Status
                                </span>

                                <input
                                    value={
                                        setup.organizationType
                                    }
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            updateField(
                                                "organizationType",
                                                event.target.value
                                            )
                                    }
                                />
                            </label>

                            <label className="legal-setup__field--wide">
                                <span>
                                    Ladungsfähige Vereinsanschrift *
                                </span>

                                <textarea
                                    rows="3"
                                    placeholder="Straße und Hausnummer&#10;PLZ Ort&#10;Deutschland"
                                    value={
                                        setup.serviceAddress
                                    }
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            updateField(
                                                "serviceAddress",
                                                event.target.value
                                            )
                                    }
                                />

                                <small>
                                    Keine bloße Postfachadresse. Erst nach Einrichtung des Impressumsdienstes eintragen.
                                </small>
                            </label>

                            <label className="legal-setup__field--wide">
                                <span>
                                    Vertretungsberechtigte Personen *
                                </span>

                                <textarea
                                    rows="3"
                                    value={
                                        setup.representatives
                                    }
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            updateField(
                                                "representatives",
                                                event.target.value
                                            )
                                    }
                                />

                                <small>
                                    Eine Person pro Zeile.
                                </small>
                            </label>

                            <label>
                                <span>
                                    Kontakt-E-Mail *
                                </span>

                                <input
                                    type="email"
                                    value={
                                        setup.email
                                    }
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            updateField(
                                                "email",
                                                event.target.value
                                            )
                                    }
                                />
                            </label>

                            <label>
                                <span>
                                    Domain
                                </span>

                                <input
                                    value={
                                        setup.website
                                    }
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            updateField(
                                                "website",
                                                event.target.value
                                            )
                                    }
                                />
                            </label>

                            <label>
                                <span>
                                    Redaktionell verantwortlich *
                                </span>

                                <input
                                    placeholder="Vor- und Nachname"
                                    value={
                                        setup.editorialResponsible
                                    }
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            updateField(
                                                "editorialResponsible",
                                                event.target.value
                                            )
                                    }
                                />
                            </label>

                            <label>
                                <span>
                                    Anschrift der verantwortlichen Person
                                </span>

                                <textarea
                                    rows="3"
                                    placeholder="Leer lassen, um die Vereinsanschrift zu verwenden"
                                    value={
                                        setup.editorialAddress
                                    }
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            updateField(
                                                "editorialAddress",
                                                event.target.value
                                            )
                                    }
                                />
                            </label>
                        </div>
                    </section>

                    <section className="legal-setup__panel">
                        <header>
                            <span>
                                Technische Anbieter
                            </span>

                            <h2>
                                Hosting und Datenschutz
                            </h2>
                        </header>

                        <div className="legal-setup__fields">
                            <label>
                                <span>
                                    Hostinganbieter *
                                </span>

                                <input
                                    placeholder="Wird nach VPS-Auswahl ergänzt"
                                    value={
                                        setup.hostingProvider
                                    }
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            updateField(
                                                "hostingProvider",
                                                event.target.value
                                            )
                                    }
                                />
                            </label>

                            <label>
                                <span>
                                    Anschrift des Hosters *
                                </span>

                                <textarea
                                    rows="3"
                                    value={
                                        setup.hostingAddress
                                    }
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            updateField(
                                                "hostingAddress",
                                                event.target.value
                                            )
                                    }
                                />
                            </label>

                            <label className="legal-setup__field--wide">
                                <span>
                                    Datenschutzaufsicht
                                </span>

                                <input
                                    value={
                                        setup.supervisoryAuthority
                                    }
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            updateField(
                                                "supervisoryAuthority",
                                                event.target.value
                                            )
                                    }
                                />
                            </label>

                            <label>
                                <span>
                                    E-Mail der Aufsicht
                                </span>

                                <input
                                    type="email"
                                    value={
                                        setup.supervisoryEmail
                                    }
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            updateField(
                                                "supervisoryEmail",
                                                event.target.value
                                            )
                                    }
                                />
                            </label>
                        </div>

                        <div
                            className={
                                validation.complete
                                    ? "legal-setup__validation legal-setup__validation--complete"
                                    : "legal-setup__validation"
                            }
                        >
                            <i
                                className={
                                    validation.complete
                                        ? "bi bi-check-circle-fill"
                                        : "bi bi-exclamation-triangle-fill"
                                }
                                aria-hidden="true"
                            />

                            <div>
                                <strong>
                                    {
                                        validation.complete
                                            ? "Pflichtangaben sind ausgefüllt"
                                            : "Noch nicht veröffentlichungsbereit"
                                    }
                                </strong>

                                {
                                    validation.complete ? (
                                        <p>
                                            Die Entwürfe können nach inhaltlicher Prüfung im Builder veröffentlicht werden.
                                        </p>
                                    ) : (
                                        <>
                                            <p>
                                                Es fehlen:
                                            </p>

                                            <ul>
                                                {
                                                    validation.missing.map(
                                                        (
                                                            item
                                                        ) => (
                                                            <li
                                                                key={
                                                                    item
                                                                }
                                                            >
                                                                {
                                                                    item
                                                                }
                                                            </li>
                                                        )
                                                    )
                                                }
                                            </ul>
                                        </>
                                    )
                                }
                            </div>
                        </div>
                    </section>
                </div>

                <section className="legal-setup__actions">
                    <label>
                        <input
                            type="checkbox"
                            checked={
                                overwriteDrafts
                            }
                            onChange={
                                (
                                    event
                                ) =>
                                    setOverwriteDrafts(
                                        event.target.checked
                                    )
                            }
                        />

                        <span>
                            Vorhandene, noch unveröffentlichte Rechtseiten mit den neu erzeugten Vorlagen überschreiben
                        </span>
                    </label>

                    <button
                        type="button"
                        disabled={
                            saving ||
                            loading
                        }
                        onClick={
                            handleGenerate
                        }
                    >
                        <i
                            className={
                                saving
                                    ? "bi bi-arrow-repeat"
                                    : "bi bi-journal-plus"
                            }
                            aria-hidden="true"
                        />

                        {
                            saving
                                ? "Entwürfe werden erstellt …"
                                : "Rechtseiten als Entwürfe anlegen"
                        }
                    </button>

                    <p>
                        Bereits veröffentlichte Seiten werden vom Assistenten grundsätzlich nicht überschrieben. Alle Vorlagen müssen vor Veröffentlichung individuell geprüft werden.
                    </p>
                </section>
            </div>
        </AdminPage>
    );
}
