import {
    getResolvedPageMetadata
} from "@shared/pages/pageSettings";

import {
    SITE_DEFAULT_DESCRIPTION,
    SITE_EMAIL,
    SITE_LEGAL_NAME,
    SITE_NAME,
    SITE_TAGLINE
} from "./siteSeo";

function getOrigin() {
    return globalThis.location
        ?.origin ??
        "http://127.0.0.1:5173";
}

function resolveUrl(
    value,
    fallback = "/"
) {
    const candidate =
        String(
            value ??
            ""
        ).trim() ||
        fallback;

    try {
        return new URL(
            candidate,
            getOrigin()
        ).href;
    } catch {
        return candidate;
    }
}

function serializeStructuredData(
    value
) {
    return JSON.stringify(
        value
    ).replace(
        /</g,
        "\\u003c"
    );
}

function normalizeEntries(
    entries
) {
    return (
        Array.isArray(
            entries
        )
            ? entries
            : [
                entries
            ]
    ).filter(
        Boolean
    );
}

export function applyStructuredData(
    entries,
    {
        scope =
            "page"
    } = {}
) {
    if (
        typeof document ===
        "undefined"
    ) {
        return () => {};
    }

    const normalizedEntries =
        normalizeEntries(
            entries
        );

    const selector =
        `script[data-bluepulse-structured-data="${scope}"]`;

    const previousElements =
        Array.from(
            document.head.querySelectorAll(
                selector
            )
        );

    previousElements.forEach(
        (
            element
        ) => {
            element.remove();
        }
    );

    const createdElements =
        normalizedEntries.map(
            (
                entry,
                index
            ) => {
                const script =
                    document.createElement(
                        "script"
                    );

                script.type =
                    "application/ld+json";

                script.dataset
                    .bluepulseStructuredData =
                    scope;

                script.dataset
                    .bluepulseStructuredIndex =
                    String(
                        index
                    );

                script.textContent =
                    serializeStructuredData(
                        entry
                    );

                document.head.appendChild(
                    script
                );

                return script;
            }
        );

    return () => {
        createdElements.forEach(
            (
                element
            ) => {
                element.remove();
            }
        );

        previousElements.forEach(
            (
                element
            ) => {
                document.head.appendChild(
                    element
                );
            }
        );
    };
}

export function createOrganizationStructuredData() {
    const origin =
        getOrigin();

    return {
        "@context":
            "https://schema.org",

        "@type":
            "Organization",

        "@id":
            `${origin}/#organization`,

        name:
            SITE_LEGAL_NAME,

        alternateName:
            SITE_NAME,

        slogan:
            SITE_TAGLINE,

        url:
            `${origin}/`,

        email:
            SITE_EMAIL,

        areaServed: [
            {
                "@type":
                    "City",

                name:
                    "Dortmund"
            },
            {
                "@type":
                    "Country",

                name:
                    "Deutschland"
            }
        ],

        knowsAbout: [
            "Tierschutz",
            "Tierwohl",
            "Naturschutz",
            "Umweltschutz",
            "Aufklärungsarbeit"
        ]
    };
}

export function createWebsiteStructuredData() {
    const origin =
        getOrigin();

    return {
        "@context":
            "https://schema.org",

        "@type":
            "WebSite",

        "@id":
            `${origin}/#website`,

        url:
            `${origin}/`,

        name:
            SITE_NAME,

        alternateName:
            SITE_LEGAL_NAME,

        description:
            SITE_DEFAULT_DESCRIPTION,

        inLanguage:
            "de-DE",

        publisher: {
            "@id":
                `${origin}/#organization`
        }
    };
}

export function createWebPageStructuredData(
    page
) {
    const metadata =
        getResolvedPageMetadata(
            page
        );

    const pageUrl =
        resolveUrl(
            metadata.canonicalUrl,
            page?.slug
                ? `/${page.slug}`
                : globalThis.location
                    ?.pathname ??
                "/"
        );

    return {
        "@context":
            "https://schema.org",

        "@type":
            "WebPage",

        "@id":
            `${pageUrl}#webpage`,

        url:
            pageUrl,

        name:
            metadata.title,

        description:
            metadata.description ||
            undefined,

        inLanguage:
            "de-DE",

        isPartOf: {
            "@id":
                `${getOrigin()}/#website`
        },

        about: {
            "@id":
                `${getOrigin()}/#organization`
        },

        dateModified:
            page?.updatedAt ||
            page?.publishedAt ||
            undefined
    };
}
