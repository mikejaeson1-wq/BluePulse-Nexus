import "./SeoLegalCenter.css";

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
    refreshPages
} from "@cms/modules/pages/services/pageService";

import {
    getPageSettings
} from "@shared/pages/pageSettings";

import {
    getRobotsText,
    getSitemapXml
} from "@shared/seo/seoEndpointService";

const LEGAL_PAGE_DEFINITIONS = [
    {
        id:
            "imprint",

        label:
            "Impressum",

        slugs: [
            "impressum"
        ],

        icon:
            "bi-building"
    },
    {
        id:
            "privacy",

        label:
            "Datenschutz",

        slugs: [
            "datenschutz",
            "datenschutzerklaerung"
        ],

        icon:
            "bi-shield-lock"
    }
];

function normalizeSlug(
    value
) {
    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase()
        .replace(
            /^\/+|\/+$/g,
            ""
        );
}

function getLegalPage(
    pages,
    definition
) {
    return pages.find(
        (
            page
        ) =>
            definition.slugs.includes(
                normalizeSlug(
                    page.slug
                )
            )
    ) ??
    null;
}

function analyzePublishedPage(
    page
) {
    const settings =
        getPageSettings(
            page
        );

    const checks = {
        title:
            Boolean(
                String(
                    settings.seo.title ??
                    page.title ??
                    ""
                ).trim()
            ),

        description:
            String(
                settings.seo.description ??
                ""
            ).trim().length >=
            70,

        indexable:
            settings.seo.indexable !==
            false,

        socialTitle:
            Boolean(
                String(
                    settings.social.title ??
                    settings.seo.title ??
                    page.title ??
                    ""
                ).trim()
            ),

        socialDescription:
            Boolean(
                String(
                    settings.social.description ??
                    settings.seo.description ??
                    ""
                ).trim()
            ),

        socialImage:
            Boolean(
                String(
                    settings.social.image ??
                    ""
                ).trim()
            )
    };

    const passed =
        Object.values(
            checks
        ).filter(
            Boolean
        ).length;

    return {
        page,
        settings,
        checks,
        passed,
        total:
            Object.keys(
                checks
            ).length
    };
}

function StatusIcon({
    passed
}) {
    return (
        <i
            className={
                passed
                    ? "bi bi-check-circle-fill seo-center__check seo-center__check--passed"
                    : "bi bi-exclamation-circle-fill seo-center__check seo-center__check--warning"
            }
            aria-hidden="true"
        />
    );
}

export default function SeoLegalCenter() {
    const [
        pages,
        setPages
    ] =
        useState([]);

    const [
        robotsText,
        setRobotsText
    ] =
        useState("");

    const [
        sitemapXml,
        setSitemapXml
    ] =
        useState("");

    const [
        loading,
        setLoading
    ] =
        useState(true);

    const [
        error,
        setError
    ] =
        useState("");

    const publishedPages =
        useMemo(
            () =>
                pages.filter(
                    (
                        page
                    ) =>
                        page.status ===
                        "published"
                ),
            [
                pages
            ]
        );

    const analyses =
        useMemo(
            () =>
                publishedPages.map(
                    analyzePublishedPage
                ),
            [
                publishedPages
            ]
        );

    const legalPages =
        useMemo(
            () =>
                LEGAL_PAGE_DEFINITIONS.map(
                    (
                        definition
                    ) => ({
                        ...definition,

                        page:
                            getLegalPage(
                                pages,
                                definition
                            )
                    })
                ),
            [
                pages
            ]
        );

    const readyPageCount =
        analyses.filter(
            (
                analysis
            ) =>
                analysis.passed ===
                analysis.total
        ).length;

    const sitemapPageCount =
        (
            sitemapXml.match(
                /<url>/g
            ) ??
            []
        ).length;

    async function loadDiagnostics() {
        setLoading(
            true
        );

        setError(
            ""
        );

        try {
            const [
                loadedPages,
                loadedRobotsText,
                loadedSitemapXml
            ] =
                await Promise.all([
                    Promise.resolve(
                        refreshPages()
                    ),

                    getRobotsText(),

                    getSitemapXml()
                ]);

            setPages(
                Array.isArray(
                    loadedPages
                )
                    ? loadedPages
                    : []
            );

            setRobotsText(
                loadedRobotsText
            );

            setSitemapXml(
                loadedSitemapXml
            );
        } catch (
            loadError
        ) {
            setError(
                loadError?.message ??
                "Die SEO-Diagnose konnte nicht geladen werden."
            );
        } finally {
            setLoading(
                false
            );
        }
    }

    useEffect(() => {
        loadDiagnostics();
    }, []);

    return (
        <AdminPage
            title="SEO & Recht"
            description="Indexierung, Sitemap, Seitendaten und rechtliche Pflichtseiten kontrollieren."
            action={
                <button
                    type="button"
                    className="seo-center__refresh"
                    disabled={
                        loading
                    }
                    onClick={
                        loadDiagnostics
                    }
                >
                    <i
                        className="bi bi-arrow-clockwise"
                        aria-hidden="true"
                    />

                    Neu prüfen
                </button>
            }
        >
            <div className="seo-center">
                {
                    error && (
                        <div
                            className="seo-center__alert seo-center__alert--error"
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

                <section className="seo-center__overview">
                    <article>
                        <span>
                            <i
                                className="bi bi-files"
                                aria-hidden="true"
                            />
                        </span>

                        <div>
                            <strong>
                                {
                                    publishedPages.length
                                }
                            </strong>

                            <small>
                                veröffentlichte Seiten
                            </small>
                        </div>
                    </article>

                    <article>
                        <span>
                            <i
                                className="bi bi-search-heart"
                                aria-hidden="true"
                            />
                        </span>

                        <div>
                            <strong>
                                {
                                    readyPageCount
                                } / {
                                    analyses.length
                                }
                            </strong>

                            <small>
                                vollständig gepflegt
                            </small>
                        </div>
                    </article>

                    <article>
                        <span>
                            <i
                                className="bi bi-diagram-3"
                                aria-hidden="true"
                            />
                        </span>

                        <div>
                            <strong>
                                {
                                    sitemapPageCount
                                }
                            </strong>

                            <small>
                                Sitemap-Adressen
                            </small>
                        </div>
                    </article>

                    <article>
                        <span>
                            <i
                                className="bi bi-shield-check"
                                aria-hidden="true"
                            />
                        </span>

                        <div>
                            <strong>
                                {
                                    legalPages.filter(
                                        (
                                            item
                                        ) =>
                                            item.page?.status ===
                                            "published"
                                    ).length
                                } / {
                                    legalPages.length
                                }
                            </strong>

                            <small>
                                Pflichtseiten veröffentlicht
                            </small>
                        </div>
                    </article>
                </section>

                <section className="seo-center__grid">
                    <article className="seo-center__panel">
                        <header>
                            <div>
                                <span>
                                    Technische Indexierung
                                </span>

                                <h2>
                                    Robots und Sitemap
                                </h2>
                            </div>

                            <i
                                className="bi bi-robot"
                                aria-hidden="true"
                            />
                        </header>

                        <div className="seo-center__endpoint-list">
                            <a
                                href="/robots.txt"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <i
                                    className="bi bi-filetype-txt"
                                    aria-hidden="true"
                                />

                                <div>
                                    <strong>
                                        robots.txt
                                    </strong>

                                    <small>
                                        {
                                            robotsText.includes(
                                                "Sitemap:"
                                            )
                                                ? "Sitemap-Verweis vorhanden"
                                                : "Sitemap-Verweis fehlt"
                                        }
                                    </small>
                                </div>

                                <StatusIcon
                                    passed={
                                        robotsText.includes(
                                            "Disallow: /admin"
                                        ) &&
                                        robotsText.includes(
                                            "Sitemap:"
                                        )
                                    }
                                />
                            </a>

                            <a
                                href="/sitemap.xml"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <i
                                    className="bi bi-filetype-xml"
                                    aria-hidden="true"
                                />

                                <div>
                                    <strong>
                                        sitemap.xml
                                    </strong>

                                    <small>
                                        {
                                            sitemapPageCount
                                        } öffentliche Adressen
                                    </small>
                                </div>

                                <StatusIcon
                                    passed={
                                        sitemapXml.includes(
                                            "<urlset"
                                        ) &&
                                        sitemapPageCount >
                                        0
                                    }
                                />
                            </a>
                        </div>

                        <div className="seo-center__information">
                            <i
                                className="bi bi-info-circle"
                                aria-hidden="true"
                            />

                            Lokal verwenden beide Dateien noch `http://127.0.0.1:5173`. Beim VPS-Start wird `APP_PUBLIC_URL` auf die endgültige HTTPS-Domain gesetzt.
                        </div>
                    </article>

                    <article className="seo-center__panel">
                        <header>
                            <div>
                                <span>
                                    Rechtliche Seiten
                                </span>

                                <h2>
                                    Pflichtseiten
                                </h2>
                            </div>

                            <i
                                className="bi bi-journal-check"
                                aria-hidden="true"
                            />
                        </header>

                        <div className="seo-center__legal-list">
                            {
                                legalPages.map(
                                    (
                                        item
                                    ) => {
                                        const exists =
                                            Boolean(
                                                item.page
                                            );

                                        const published =
                                            item.page?.status ===
                                            "published";

                                        return (
                                            <div
                                                key={
                                                    item.id
                                                }
                                                className="seo-center__legal-item"
                                            >
                                                <span>
                                                    <i
                                                        className={
                                                            `bi ${item.icon}`
                                                        }
                                                        aria-hidden="true"
                                                    />
                                                </span>

                                                <div>
                                                    <strong>
                                                        {
                                                            item.label
                                                        }
                                                    </strong>

                                                    <small>
                                                        {
                                                            !exists
                                                                ? "Seite fehlt"
                                                                : published
                                                                    ? `Veröffentlicht unter /${item.page.slug}`
                                                                    : "Vorhanden, aber noch Entwurf"
                                                        }
                                                    </small>
                                                </div>

                                                {
                                                    item.page ? (
                                                        <Link
                                                            to={
                                                                `/admin/pages/${item.page.id}`
                                                            }
                                                        >
                                                            Bearbeiten
                                                        </Link>
                                                    ) : (
                                                        <Link to="/admin/pages">
                                                            Anlegen
                                                        </Link>
                                                    )
                                                }

                                                <StatusIcon
                                                    passed={
                                                        published
                                                    }
                                                />
                                            </div>
                                        );
                                    }
                                )
                            }
                        </div>

                        <div className="seo-center__warning">
                            <i
                                className="bi bi-exclamation-triangle"
                                aria-hidden="true"
                            />

                            Das Nexus prüft Vorhandensein und Veröffentlichung, ersetzt aber keine individuelle rechtliche Prüfung der Inhalte.
                        </div>
                    </article>
                </section>

                <section className="seo-center__panel">
                    <header>
                        <div>
                            <span>
                                Builder-Seiten
                            </span>

                            <h2>
                                SEO-Vollständigkeit
                            </h2>
                        </div>

                        <i
                            className="bi bi-card-checklist"
                            aria-hidden="true"
                        />
                    </header>

                    {
                        loading ? (
                            <div className="seo-center__empty">
                                <span className="spinner-border text-info" />

                                Seiten werden geprüft …
                            </div>
                        ) : analyses.length ===
                            0 ? (
                            <div className="seo-center__empty">
                                <i
                                    className="bi bi-file-earmark-x"
                                    aria-hidden="true"
                                />

                                Noch keine veröffentlichten Builder-Seiten vorhanden.
                            </div>
                        ) : (
                            <div className="seo-center__table-wrapper">
                                <table className="seo-center__table">
                                    <thead>
                                        <tr>
                                            <th>
                                                Seite
                                            </th>

                                            <th>
                                                Titel
                                            </th>

                                            <th>
                                                Beschreibung
                                            </th>

                                            <th>
                                                Index
                                            </th>

                                            <th>
                                                Social
                                            </th>

                                            <th>
                                                Bild
                                            </th>

                                            <th>
                                                Ergebnis
                                            </th>

                                            <th>
                                                Aktion
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {
                                            analyses.map(
                                                (
                                                    analysis
                                                ) => (
                                                    <tr
                                                        key={
                                                            analysis.page.id
                                                        }
                                                    >
                                                        <td>
                                                            <strong>
                                                                {
                                                                    analysis.page.title
                                                                }
                                                            </strong>

                                                            <small>
                                                                /{
                                                                    analysis.page.slug
                                                                }
                                                            </small>
                                                        </td>

                                                        <td>
                                                            <StatusIcon
                                                                passed={
                                                                    analysis.checks.title
                                                                }
                                                            />
                                                        </td>

                                                        <td>
                                                            <StatusIcon
                                                                passed={
                                                                    analysis.checks.description
                                                                }
                                                            />
                                                        </td>

                                                        <td>
                                                            <StatusIcon
                                                                passed={
                                                                    analysis.checks.indexable
                                                                }
                                                            />
                                                        </td>

                                                        <td>
                                                            <StatusIcon
                                                                passed={
                                                                    analysis.checks.socialTitle &&
                                                                    analysis.checks.socialDescription
                                                                }
                                                            />
                                                        </td>

                                                        <td>
                                                            <StatusIcon
                                                                passed={
                                                                    analysis.checks.socialImage
                                                                }
                                                            />
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={
                                                                    analysis.passed ===
                                                                    analysis.total
                                                                        ? "seo-center__score seo-center__score--complete"
                                                                        : "seo-center__score"
                                                                }
                                                            >
                                                                {
                                                                    analysis.passed
                                                                } / {
                                                                    analysis.total
                                                                }
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <Link
                                                                to={
                                                                    `/admin/pages/${analysis.page.id}`
                                                                }
                                                            >
                                                                SEO öffnen
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                )
                                            )
                                        }
                                    </tbody>
                                </table>
                            </div>
                        )
                    }

                    <div className="seo-center__legend">
                        <span>
                            <StatusIcon
                                passed={
                                    true
                                }
                            />

                            vorhanden
                        </span>

                        <span>
                            <StatusIcon
                                passed={
                                    false
                                }
                            />

                            prüfen oder ergänzen
                        </span>

                        <small>
                            Social-Media-Bilder sind empfohlen, aber nicht für die Aufnahme in die Sitemap erforderlich.
                        </small>
                    </div>
                </section>
            </div>
        </AdminPage>
    );
}
