import {
    buildApp
} from "./app.js";

import runtimeConfig from "./config/runtimeConfig.js";

import {
    inspectDatabase
} from "./database/database.js";

const fastify =
    buildApp();

let shuttingDown = false;

async function startServer() {
    try {
        const address =
            await fastify.listen({
                host:
                    runtimeConfig.host,

                port:
                    runtimeConfig.port
            });

        fastify.log.info(
            {
                address,

                environment:
                    runtimeConfig
                        .nodeEnvironment,

                version:
                    runtimeConfig
                        .applicationVersion
            },
            "BluePulse Nexus API wurde gestartet."
        );

        try {
            const database =
                await inspectDatabase(
                    fastify.database
                );

            fastify.log.info(
                {
                    database:
                        database.name,

                    user:
                        database.user,

                    latencyMilliseconds:
                        database
                            .latencyMilliseconds
                },
                "PostgreSQL-Verbindung wurde hergestellt."
            );
        } catch (error) {
            fastify.log.warn(
                {
                    error
                },
                "API läuft, PostgreSQL ist jedoch noch nicht erreichbar."
            );
        }
    } catch (error) {
        fastify.log.error(
            error,
            "BluePulse Nexus API konnte nicht gestartet werden."
        );

        process.exitCode = 1;
    }
}

async function stopServer(
    signal
) {
    if (shuttingDown) {
        return;
    }

    shuttingDown = true;

    fastify.log.info(
        {
            signal
        },
        "BluePulse Nexus API wird beendet."
    );

    try {
        await fastify.close();

        fastify.log.info(
            "BluePulse Nexus API wurde ordnungsgemäß beendet."
        );

        process.exit(0);
    } catch (error) {
        fastify.log.error(
            error,
            "BluePulse Nexus API konnte nicht ordnungsgemäß beendet werden."
        );

        process.exit(1);
    }
}

process.on(
    "SIGINT",
    () => {
        stopServer(
            "SIGINT"
        );
    }
);

process.on(
    "SIGTERM",
    () => {
        stopServer(
            "SIGTERM"
        );
    }
);

startServer();