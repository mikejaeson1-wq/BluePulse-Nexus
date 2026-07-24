export const SITE_NAME =
    "BluePulse Tierschutz";

export const SITE_LEGAL_NAME =
    "BluePulse Tierschutz n.e.V.";

export const SITE_TAGLINE =
    "Every Life Matters";

export const SITE_EMAIL =
    "bluepulsekontakt@gmail.com";

export const SITE_DEFAULT_TITLE =
    "BluePulse Tierschutz – Every Life Matters";

export const SITE_DEFAULT_DESCRIPTION =
    "BluePulse Tierschutz setzt sich für Tiere, Natur, Aufklärung und gemeinschaftliches Engagement ein. Gemeinsam geben wir Tieren und ihrer Umwelt eine Stimme.";

function createPageSettings({
    title,
    description,
    canonicalUrl,
    indexable,
    followLinks,
    socialTitle,
    socialDescription,
    socialImage = "",
    socialImageAlt = ""
}) {
    return {
        seo: {
            title,
            description,
            canonicalUrl,
            indexable,
            followLinks
        },

        social: {
            title:
                socialTitle ??
                title,

            description:
                socialDescription ??
                description,

            image:
                socialImage,

            imageAlt:
                socialImageAlt
        },

        navigation: {
            includeInNavigation:
                false,

            label:
                "",

            parentId:
                "",

            order:
                100,

            highlighted:
                false,

            openInNewTab:
                false
        }
    };
}

export const HOME_SEO_PAGE =
    Object.freeze({
        id:
            "website-home",

        title:
            SITE_DEFAULT_TITLE,

        slug:
            "",

        status:
            "published",

        theme: {
            pageSettings:
                createPageSettings({
                    title:
                        SITE_DEFAULT_TITLE,

                    description:
                        SITE_DEFAULT_DESCRIPTION,

                    canonicalUrl:
                        "/",

                    indexable:
                        true,

                    followLinks:
                        true
                })
        }
    });

export const ADMIN_SEO_PAGE =
    Object.freeze({
        id:
            "nexus-admin",

        title:
            "BluePulse Nexus",

        slug:
            "admin",

        status:
            "draft",

        theme: {
            pageSettings:
                createPageSettings({
                    title:
                        "BluePulse Nexus",

                    description:
                        "Interner Verwaltungsbereich von BluePulse Tierschutz.",

                    canonicalUrl:
                        "/admin",

                    indexable:
                        false,

                    followLinks:
                        false
                })
        }
    });

export function createNotFoundSeoPage(
    pathname = ""
) {
    return {
        id:
            "website-not-found",

        title:
            "Seite nicht gefunden | BluePulse Tierschutz",

        slug:
            String(
                pathname ??
                ""
            )
                .replace(
                    /^\/+/,
                    ""
                )
                .replace(
                    /\/+$/,
                    ""
                ) ||
            "404",

        status:
            "draft",

        theme: {
            pageSettings:
                createPageSettings({
                    title:
                        "Seite nicht gefunden | BluePulse Tierschutz",

                    description:
                        "Die angeforderte Seite wurde nicht gefunden.",

                    canonicalUrl:
                        "",

                    indexable:
                        false,

                    followLinks:
                        false
                })
        }
    };
}
