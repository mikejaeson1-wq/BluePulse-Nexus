import assert from "node:assert/strict";

import {
    test
} from "node:test";

import {
    createRobotsTxt,
    createSitemapEntries,
    createSitemapXml,
    escapeXml,
    listPublishedSeoPages
} from "../src/seo/seoService.js";

test(
    "XML-Sonderzeichen werden sicher maskiert",
    () => {
        assert.equal(
            escapeXml(
                'https://example.de/?a=1&b="<test>"'
            ),
            "https://example.de/?a=1&amp;b=&quot;&lt;test&gt;&quot;"
        );
    }
);

test(
    "robots.txt sperrt CMS und verweist auf die Sitemap",
    () => {
        const robots =
            createRobotsTxt({
                baseUrl:
                    "https://blue-pulse.de/"
            });

        assert.match(
            robots,
            /Disallow: \/admin/
        );

        assert.match(
            robots,
            /Sitemap: https:\/\/blue-pulse\.de\/sitemap\.xml/
        );
    }
);

test(
    "Sitemap enthält Startseite und eindeutige veröffentlichte Seiten",
    () => {
        const entries =
            createSitemapEntries({
                baseUrl:
                    "https://blue-pulse.de/",

                pages: [
                    {
                        slug:
                            "impressum",

                        canonicalPath:
                            "/impressum",

                        lastModified:
                            "2026-07-24"
                    },
                    {
                        slug:
                            "impressum",

                        canonicalPath:
                            "/impressum",

                        lastModified:
                            "2026-07-24"
                    },
                    {
                        slug:
                            "datenschutz",

                        canonicalPath:
                            "/datenschutz"
                    }
                ]
            });

        assert.equal(
            entries.length,
            3
        );

        assert.equal(
            entries[0].url,
            "https://blue-pulse.de/"
        );

        assert.equal(
            entries[1].url,
            "https://blue-pulse.de/impressum"
        );
    }
);

test(
    "Sitemap-XML enthält gültige URL-Einträge",
    () => {
        const xml =
            createSitemapXml([
                {
                    url:
                        "https://blue-pulse.de/",

                    changeFrequency:
                        "weekly",

                    priority:
                        "1.0"
                }
            ]);

        assert.match(
            xml,
            /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/
        );

        assert.match(
            xml,
            /<loc>https:\/\/blue-pulse\.de\/<\/loc>/
        );
    }
);

test(
    "nur veröffentlichte, indexierbare Seiten werden für SEO übernommen",
    async () => {
        const database = {
            async query() {
                return {
                    rows: [
                        {
                            slug:
                                "impressum",

                            theme:
                                {},

                            updated_at:
                                "2026-07-24T12:00:00.000Z",

                            published_at:
                                "2026-07-24T11:00:00.000Z"
                        },
                        {
                            slug:
                                "intern",

                            theme: {
                                pageSettings: {
                                    seo: {
                                        indexable:
                                            false
                                    }
                                }
                            },

                            updated_at:
                                "2026-07-24T12:00:00.000Z"
                        },
                        {
                            slug:
                                "datenschutz",

                            theme: {
                                pageSettings: {
                                    seo: {
                                        canonicalUrl:
                                            "/datenschutz"
                                    }
                                }
                            },

                            published_at:
                                "2026-07-23T12:00:00.000Z"
                        }
                    ]
                };
            }
        };

        const pages =
            await listPublishedSeoPages(
                database
            );

        assert.deepEqual(
            pages,
            [
                {
                    slug:
                        "impressum",

                    canonicalPath:
                        "/impressum",

                    lastModified:
                        "2026-07-24"
                },
                {
                    slug:
                        "datenschutz",

                    canonicalPath:
                        "/datenschutz",

                    lastModified:
                        "2026-07-23"
                }
            ]
        );
    }
);
