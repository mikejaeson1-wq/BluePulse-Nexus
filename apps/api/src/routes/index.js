import adminSiteRoutes from "./adminSiteRoutes.js";
import healthRoutes from "./healthRoutes.js";
import migrationRoutes from "./migrationRoutes.js";
import pageRoutes from "./pageRoutes.js";
import publicSiteRoutes from "./publicSiteRoutes.js";
import systemRoutes from "./systemRoutes.js";
import versionRoutes from "./versionRoutes.js";

export default async function apiRoutes(
    fastify
) {
    await fastify.register(
        healthRoutes
    );

    await fastify.register(
        versionRoutes
    );

    await fastify.register(
        systemRoutes
    );

    await fastify.register(
        publicSiteRoutes
    );

    await fastify.register(
        adminSiteRoutes
    );

    await fastify.register(
        migrationRoutes
    );

    await fastify.register(
        pageRoutes
    );
}