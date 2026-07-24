import runtimeConfig from "../config/runtimeConfig.js";

import {
    createRobotsTxt,
    createSitemapEntries,
    createSitemapXml,
    listPublishedSeoPages
} from "../seo/seoService.js";

function applyPublicDocumentHeaders(
    reply,
    contentType
) {
    reply.header(
        "Content-Type",
        contentType
    );

    reply.header(
        "Cache-Control",
        runtimeConfig.production
            ? "public, max-age=900, stale-while-revalidate=3600"
            : "no-store"
    );

    reply.header(
        "X-Content-Type-Options",
        "nosniff"
    );
}

export default async function seoRoutes(
    fastify
) {
    fastify.get(
        "/robots.txt",
        async (
            request,
            reply
        ) => {
            applyPublicDocumentHeaders(
                reply,
                "text/plain; charset=utf-8"
            );

            return createRobotsTxt({
                baseUrl:
                    runtimeConfig.publicUrl
            });
        }
    );

    fastify.get(
        "/sitemap.xml",
        async (
            request,
            reply
        ) => {
            const pages =
                await listPublishedSeoPages(
                    fastify.database
                );

            const entries =
                createSitemapEntries({
                    baseUrl:
                        runtimeConfig.publicUrl,

                    pages
                });

            applyPublicDocumentHeaders(
                reply,
                "application/xml; charset=utf-8"
            );

            return createSitemapXml(
                entries
            );
        }
    );
}
