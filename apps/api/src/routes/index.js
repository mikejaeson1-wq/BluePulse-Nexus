import adminSiteRoutes from "./adminSiteRoutes.js";
import auditRoutes from "./auditRoutes.js";
import authRoutes from "./authRoutes.js";
import contactRoutes from "./contactRoutes.js";
import healthRoutes from "./healthRoutes.js";
import mediaRoutes from "./mediaRoutes.js";
import migrationRoutes from "./migrationRoutes.js";
import pageRoutes from "./pageRoutes.js";
import pageTrashRoutes from "./pageTrashRoutes.js";
import publicSiteRoutes from "./publicSiteRoutes.js";
import systemRoutes from "./systemRoutes.js";
import userRoutes from "./userRoutes.js";
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
        authRoutes
    );

    await fastify.register(
        contactRoutes
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
        auditRoutes
    );

    await fastify.register(
        pageTrashRoutes
    );

    await fastify.register(
        pageRoutes
    );

    await fastify.register(
        mediaRoutes
    );

    await fastify.register(
        userRoutes
    );
}
