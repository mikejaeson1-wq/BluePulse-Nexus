import healthRoutes from "./healthRoutes.js";
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
}