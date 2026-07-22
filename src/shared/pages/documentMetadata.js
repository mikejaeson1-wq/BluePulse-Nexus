import {
    getResolvedPageMetadata
} from "./pageSettings";

function resolveUrl(
    value,
    fallback = ""
) {
    const normalizedValue =
        String(
            value ??
            ""
        ).trim();

    const normalizedFallback =
        String(
            fallback ??
            ""
        ).trim();

    const candidate =
        normalizedValue ||
        normalizedFallback;

    if (!candidate) {
        return "";
    }

    try {
        return new URL(
            candidate,
            globalThis.location
                ?.origin ??
            "http://localhost"
        ).href;
    } catch {
        return candidate;
    }
}

function createCanonicalUrl(
    page,
    explicitCanonicalUrl
) {
    const fallbackPath =
        page?.slug
            ? `/${page.slug}`
            : globalThis.location
                ?.pathname ??
            "/";

    return resolveUrl(
        explicitCanonicalUrl,
        fallbackPath
    );
}

function setMetaElement({
    selector,
    attribute,
    attributeValue,
    content
}) {
    if (
        typeof document ===
        "undefined"
    ) {
        return () => {};
    }

    const normalizedContent =
        String(
            content ??
            ""
        ).trim();

    if (!normalizedContent) {
        return () => {};
    }

    let element =
        document.head.querySelector(
            selector
        );

    const created =
        !element;

    if (!element) {
        element =
            document.createElement(
                "meta"
            );

        element.setAttribute(
            attribute,
            attributeValue
        );

        document.head.appendChild(
            element
        );
    }

    const previousContent =
        element.getAttribute(
            "content"
        );

    element.setAttribute(
        "content",
        normalizedContent
    );

    return () => {
        if (created) {
            element.remove();

            return;
        }

        if (
            previousContent ===
            null
        ) {
            element.removeAttribute(
                "content"
            );

            return;
        }

        element.setAttribute(
            "content",
            previousContent
        );
    };
}

function setLinkElement({
    selector,
    rel,
    href
}) {
    if (
        typeof document ===
        "undefined"
    ) {
        return () => {};
    }

    const normalizedHref =
        String(
            href ??
            ""
        ).trim();

    if (!normalizedHref) {
        return () => {};
    }

    let element =
        document.head.querySelector(
            selector
        );

    const created =
        !element;

    if (!element) {
        element =
            document.createElement(
                "link"
            );

        element.setAttribute(
            "rel",
            rel
        );

        document.head.appendChild(
            element
        );
    }

    const previousHref =
        element.getAttribute(
            "href"
        );

    element.setAttribute(
        "href",
        normalizedHref
    );

    return () => {
        if (created) {
            element.remove();

            return;
        }

        if (
            previousHref ===
            null
        ) {
            element.removeAttribute(
                "href"
            );

            return;
        }

        element.setAttribute(
            "href",
            previousHref
        );
    };
}

export function applyPageDocumentMetadata(
    page
) {
    if (
        typeof document ===
        "undefined"
    ) {
        return () => {};
    }

    const metadata =
        getResolvedPageMetadata(
            page
        );

    const previousTitle =
        document.title;

    document.title =
        metadata.title;

    const canonicalUrl =
        createCanonicalUrl(
            page,
            metadata.canonicalUrl
        );

    const socialImage =
        resolveUrl(
            metadata.social.image
        );

    const robotsContent =
        [
            metadata.indexable
                ? "index"
                : "noindex",

            metadata.followLinks
                ? "follow"
                : "nofollow"
        ].join(
            ", "
        );

    const cleanupFunctions = [
        setMetaElement({
            selector:
                'meta[name="description"]',

            attribute:
                "name",

            attributeValue:
                "description",

            content:
                metadata.description
        }),

        setMetaElement({
            selector:
                'meta[name="robots"]',

            attribute:
                "name",

            attributeValue:
                "robots",

            content:
                robotsContent
        }),

        setLinkElement({
            selector:
                'link[rel="canonical"]',

            rel:
                "canonical",

            href:
                canonicalUrl
        }),

        setMetaElement({
            selector:
                'meta[property="og:type"]',

            attribute:
                "property",

            attributeValue:
                "og:type",

            content:
                "website"
        }),

        setMetaElement({
            selector:
                'meta[property="og:title"]',

            attribute:
                "property",

            attributeValue:
                "og:title",

            content:
                metadata.social
                    .title
        }),

        setMetaElement({
            selector:
                'meta[property="og:description"]',

            attribute:
                "property",

            attributeValue:
                "og:description",

            content:
                metadata.social
                    .description
        }),

        setMetaElement({
            selector:
                'meta[property="og:url"]',

            attribute:
                "property",

            attributeValue:
                "og:url",

            content:
                canonicalUrl
        }),

        setMetaElement({
            selector:
                'meta[property="og:image"]',

            attribute:
                "property",

            attributeValue:
                "og:image",

            content:
                socialImage
        }),

        setMetaElement({
            selector:
                'meta[property="og:image:alt"]',

            attribute:
                "property",

            attributeValue:
                "og:image:alt",

            content:
                metadata.social
                    .imageAlt
        }),

        setMetaElement({
            selector:
                'meta[name="twitter:card"]',

            attribute:
                "name",

            attributeValue:
                "twitter:card",

            content:
                socialImage
                    ? "summary_large_image"
                    : "summary"
        }),

        setMetaElement({
            selector:
                'meta[name="twitter:title"]',

            attribute:
                "name",

            attributeValue:
                "twitter:title",

            content:
                metadata.social
                    .title
        }),

        setMetaElement({
            selector:
                'meta[name="twitter:description"]',

            attribute:
                "name",

            attributeValue:
                "twitter:description",

            content:
                metadata.social
                    .description
        }),

        setMetaElement({
            selector:
                'meta[name="twitter:image"]',

            attribute:
                "name",

            attributeValue:
                "twitter:image",

            content:
                socialImage
        }),

        setMetaElement({
            selector:
                'meta[name="twitter:image:alt"]',

            attribute:
                "name",

            attributeValue:
                "twitter:image:alt",

            content:
                metadata.social
                    .imageAlt
        })
    ];

    return () => {
        document.title =
            previousTitle;

        cleanupFunctions
            .reverse()
            .forEach(
                (cleanup) => {
                    cleanup();
                }
            );
    };
}