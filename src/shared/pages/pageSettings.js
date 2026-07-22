const DEFAULT_SEO_SETTINGS = {
    title:
        "",

    description:
        "",

    canonicalUrl:
        "",

    indexable:
        true,

    followLinks:
        true
};

const DEFAULT_SOCIAL_SETTINGS = {
    title:
        "",

    description:
        "",

    image:
        "",

    imageAlt:
        ""
};

const DEFAULT_NAVIGATION_SETTINGS = {
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
};

export const DEFAULT_PAGE_SETTINGS =
    Object.freeze({
        seo:
            Object.freeze({
                ...DEFAULT_SEO_SETTINGS
            }),

        social:
            Object.freeze({
                ...DEFAULT_SOCIAL_SETTINGS
            }),

        navigation:
            Object.freeze({
                ...DEFAULT_NAVIGATION_SETTINGS
            })
    });

function isPlainObject(
    value
) {
    return Boolean(
        value &&
        typeof value ===
            "object" &&
        !Array.isArray(
            value
        )
    );
}

function normalizeText(
    value
) {
    return String(
        value ??
        ""
    ).trim();
}

function normalizeOrder(
    value
) {
    const order =
        Number.parseInt(
            value,
            10
        );

    if (
        !Number.isInteger(
            order
        )
    ) {
        return 100;
    }

    return Math.min(
        Math.max(
            order,
            0
        ),
        9999
    );
}

export function getPageTheme(
    page
) {
    return isPlainObject(
        page?.theme
    )
        ? page.theme
        : {};
}

export function hasExplicitPageSettingsSection(
    page,
    section
) {
    const theme =
        getPageTheme(
            page
        );

    return Boolean(
        isPlainObject(
            theme.pageSettings
        ) &&
        isPlainObject(
            theme.pageSettings[
                section
            ]
        )
    );
}

export function hasExplicitPageNavigationSettings(
    page
) {
    return hasExplicitPageSettingsSection(
        page,
        "navigation"
    );
}

export function normalizePageSettings(
    value
) {
    const source =
        isPlainObject(
            value
        )
            ? value
            : {};

    const seo =
        isPlainObject(
            source.seo
        )
            ? source.seo
            : {};

    const social =
        isPlainObject(
            source.social
        )
            ? source.social
            : {};

    const navigation =
        isPlainObject(
            source.navigation
        )
            ? source.navigation
            : {};

    return {
        seo: {
            title:
                normalizeText(
                    seo.title
                ),

            description:
                normalizeText(
                    seo.description
                ),

            canonicalUrl:
                normalizeText(
                    seo.canonicalUrl
                ),

            indexable:
                seo.indexable !==
                false,

            followLinks:
                seo.followLinks !==
                false
        },

        social: {
            title:
                normalizeText(
                    social.title
                ),

            description:
                normalizeText(
                    social.description
                ),

            image:
                normalizeText(
                    social.image
                ),

            imageAlt:
                normalizeText(
                    social.imageAlt
                )
        },

        navigation: {
            includeInNavigation:
                Boolean(
                    navigation
                        .includeInNavigation
                ),

            label:
                normalizeText(
                    navigation.label
                ),

            parentId:
                normalizeText(
                    navigation.parentId
                ),

            order:
                normalizeOrder(
                    navigation.order
                ),

            highlighted:
                Boolean(
                    navigation.highlighted
                ),

            openInNewTab:
                Boolean(
                    navigation.openInNewTab
                )
        }
    };
}

export function getPageSettings(
    page
) {
    const theme =
        getPageTheme(
            page
        );

    return normalizePageSettings(
        theme.pageSettings
    );
}

export function setPageSettings(
    page,
    settings
) {
    const theme =
        getPageTheme(
            page
        );

    return {
        ...page,

        theme: {
            ...theme,

            pageSettings:
                normalizePageSettings(
                    settings
                )
        }
    };
}

export function getResolvedPageMetadata(
    page
) {
    const settings =
        getPageSettings(
            page
        );

    const pageTitle =
        normalizeText(
            page?.title
        ) ||
        "BluePulse";

    const seoTitle =
        settings.seo.title ||
        pageTitle;

    const socialTitle =
        settings.social.title ||
        seoTitle;

    const socialDescription =
        settings.social
            .description ||
        settings.seo
            .description;

    return {
        title:
            seoTitle,

        description:
            settings.seo
                .description,

        canonicalUrl:
            settings.seo
                .canonicalUrl,

        indexable:
            settings.seo
                .indexable,

        followLinks:
            settings.seo
                .followLinks,

        social: {
            title:
                socialTitle,

            description:
                socialDescription,

            image:
                settings.social
                    .image,

            imageAlt:
                settings.social
                    .imageAlt
        },

        navigation:
            settings.navigation
    };
}