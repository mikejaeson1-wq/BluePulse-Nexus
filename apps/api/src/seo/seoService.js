function normalizeText(
    value,
    fallback = ""
) {
    const normalizedValue =
        String(
            value ?? ""
        ).trim();

    return normalizedValue ||
        fallback;
}

function normalizeBaseUrl(
    value
) {
    return normalizeText(
        value,
        "http://127.0.0.1:5173"
    ).replace(
        /\/+$/,
        ""
    );
}

function normalizeSlug(
    value
) {
    return String(
        value ?? ""
    )
        .trim()
        .replace(
            /^\/+/,
            ""
        )
        .replace(
            /\/+$/,
            ""
        );
}

function normalizeDate(
    value
) {
    if (!value) {
        return "";
    }

    const date =
        new Date(
            value
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    return date
        .toISOString()
        .slice(
            0,
            10
        );
}

function getSeoSettings(
    theme
) {
    if (
        !theme ||
        typeof theme !==
            "object" ||
        Array.isArray(
            theme
        )
    ) {
        return {};
    }

    const pageSettings =
        theme.pageSettings;

    if (
        !pageSettings ||
        typeof pageSettings !==
            "object" ||
        Array.isArray(
            pageSettings
        )
    ) {
        return {};
    }

    const seo =
        pageSettings.seo;

    return (
        seo &&
        typeof seo ===
            "object" &&
        !Array.isArray(
            seo
        )
    )
        ? seo
        : {};
}

function isPageIndexable(
    page
) {
    const seo =
        getSeoSettings(
            page?.theme
        );

    return seo.indexable !==
        false;
}

function getCanonicalPath(
    page
) {
    const seo =
        getSeoSettings(
            page?.theme
        );

    const canonicalUrl =
        normalizeText(
            seo.canonicalUrl
        );

    if (!canonicalUrl) {
        return `/${normalizeSlug(
            page.slug
        )}`;
    }

    try {
        const parsedUrl =
            new URL(
                canonicalUrl,
                "http://bluepulse.local"
            );

        if (
            parsedUrl.origin ===
            "http://bluepulse.local"
        ) {
            return [
                parsedUrl.pathname,
                parsedUrl.search
            ].join("");
        }

        return parsedUrl.href;
    } catch {
        return `/${normalizeSlug(
            page.slug
        )}`;
    }
}

function resolvePublicUrl(
    baseUrl,
    value
) {
    const normalizedBaseUrl =
        normalizeBaseUrl(
            baseUrl
        );

    try {
        return new URL(
            value,
            `${normalizedBaseUrl}/`
        ).href;
    } catch {
        return `${normalizedBaseUrl}/${normalizeSlug(
            value
        )}`;
    }
}

export function escapeXml(
    value
) {
    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&apos;"
        );
}

export async function listPublishedSeoPages(
    database
) {
    if (
        !database ||
        typeof database.query !==
            "function"
    ) {
        throw new Error(
            "Es wurde keine gültige Datenbankverbindung bereitgestellt."
        );
    }

    const result =
        await database.query(`
            SELECT
                slug,
                theme,
                updated_at,
                published_at
            FROM pages
            WHERE
                status = 'published'
                AND deleted_at IS NULL
            ORDER BY slug ASC
        `);

    return (
        result.rows ??
        []
    )
        .filter(
            isPageIndexable
        )
        .map(
            (
                row
            ) => ({
                slug:
                    normalizeSlug(
                        row.slug
                    ),

                canonicalPath:
                    getCanonicalPath(
                        row
                    ),

                lastModified:
                    normalizeDate(
                        row.updated_at ??
                        row.published_at
                    )
            })
        )
        .filter(
            (
                page
            ) =>
                Boolean(
                    page.slug
                )
        );
}

export function createSitemapEntries({
    baseUrl,
    pages = [],
    homeLastModified = ""
}) {
    const normalizedBaseUrl =
        normalizeBaseUrl(
            baseUrl
        );

    const entries = [
        {
            url:
                `${normalizedBaseUrl}/`,

            lastModified:
                normalizeDate(
                    homeLastModified
                ),

            changeFrequency:
                "weekly",

            priority:
                "1.0"
        }
    ];

    const seenUrls =
        new Set([
            entries[0].url
        ]);

    pages.forEach(
        (
            page
        ) => {
            const url =
                resolvePublicUrl(
                    normalizedBaseUrl,
                    page.canonicalPath ??
                    `/${page.slug}`
                );

            if (
                seenUrls.has(
                    url
                )
            ) {
                return;
            }

            seenUrls.add(
                url
            );

            entries.push({
                url,

                lastModified:
                    normalizeDate(
                        page.lastModified
                    ),

                changeFrequency:
                    "monthly",

                priority:
                    "0.8"
            });
        }
    );

    return entries;
}

export function createSitemapXml(
    entries
) {
    const urls =
        (
            Array.isArray(
                entries
            )
                ? entries
                : []
        )
            .map(
                (
                    entry
                ) => {
                    const lines = [
                        "    <url>",
                        `        <loc>${escapeXml(
                            entry.url
                        )}</loc>`
                    ];

                    if (
                        entry.lastModified
                    ) {
                        lines.push(
                            `        <lastmod>${escapeXml(
                                entry.lastModified
                            )}</lastmod>`
                        );
                    }

                    if (
                        entry.changeFrequency
                    ) {
                        lines.push(
                            `        <changefreq>${escapeXml(
                                entry.changeFrequency
                            )}</changefreq>`
                        );
                    }

                    if (
                        entry.priority
                    ) {
                        lines.push(
                            `        <priority>${escapeXml(
                                entry.priority
                            )}</priority>`
                        );
                    }

                    lines.push(
                        "    </url>"
                    );

                    return lines.join(
                        "\n"
                    );
                }
            )
            .join(
                "\n"
            );

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        urls,
        "</urlset>",
        ""
    ].join(
        "\n"
    );
}

export function createRobotsTxt({
    baseUrl
}) {
    const normalizedBaseUrl =
        normalizeBaseUrl(
            baseUrl
        );

    return [
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin",
        "Disallow: /admin/",
        "Disallow: /api/admin",
        "Disallow: /api/admin/",
        "",
        `Sitemap: ${normalizedBaseUrl}/sitemap.xml`,
        ""
    ].join(
        "\n"
    );
}
