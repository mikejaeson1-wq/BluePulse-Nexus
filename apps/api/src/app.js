import Fastify from "fastify";

import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";

import runtimeConfig from "./config/runtimeConfig.js";

import {
    registerAuthenticationGuard
} from "./auth/authGuard.js";

import {
    registerAuditHook
} from "./audit/auditHook.js";

import {
    registerPageNavigationHook
} from "./navigation/pageNavigationHook.js";

import {
    createDatabasePool
} from "./database/database.js";

import apiRoutes from "./routes/index.js";

export function buildApp({
    logger,
    databasePool,

    mediaStorageDirectory =
        runtimeConfig
            .media
            .storageDirectory,

    authenticationRequired =
        databasePool
            ? false
            : runtimeConfig
                .auth
                .required
} = {}) {
    const fastify =
        Fastify({
            logger:
                logger !==
                undefined
                    ? logger
                    : {
                        level:
                            runtimeConfig
                                .logLevel
                    },

            trustProxy:
                runtimeConfig
                    .production
        });

    const database =
        databasePool ??
        createDatabasePool();

    const ownsDatabase =
        !databasePool;

    fastify.decorate(
        "database",
        database
    );

    fastify.decorate(
        "mediaStorageDirectory",
        mediaStorageDirectory
    );

    fastify.register(
        cookie
    );

    fastify.register(
        multipart,
        {
            limits: {
                files: 1,
                fields: 20,
                parts: 21,

                fileSize:
                    runtimeConfig
                        .media
                        .maximumFileSizeBytes
            },

            throwFileSizeLimit:
                true
        }
    );

    registerAuthenticationGuard(
        fastify,
        {
            required:
                authenticationRequired
        }
    );

    registerPageNavigationHook(
        fastify
    );

    registerAuditHook(
        fastify
    );

    fastify.addHook(
        "onClose",
        async () => {
            if (
                ownsDatabase &&
                typeof database.end ===
                    "function"
            ) {
                await database.end();
            }
        }
    );

    fastify.get(
        "/",
        async () => ({
            name:
                runtimeConfig
                    .applicationName,

            version:
                runtimeConfig
                    .applicationVersion,

            status:
                "running"
        })
    );

    fastify.register(
        apiRoutes,
        {
            prefix:
                "/api"
        }
    );

    fastify.setNotFoundHandler(
        async (
            request,
            reply
        ) => {
            return reply
                .status(404)
                .send({
                    statusCode: 404,

                    error:
                        "Not Found",

                    message:
                        `Die API-Route „${request.method} ${request.url}“ wurde nicht gefunden.`
                });
        }
    );

    fastify.setErrorHandler(
        async (
            error,
            request,
            reply
        ) => {
            request.log.error(
                {
                    error
                },
                "API-Anfrage fehlgeschlagen."
            );

            const requestedStatusCode =
                Number(
                    error.statusCode
                );

            const statusCode =
                Number.isInteger(
                    requestedStatusCode
                ) &&
                requestedStatusCode >=
                    400 &&
                requestedStatusCode <=
                    599
                    ? requestedStatusCode
                    : 500;

            return reply
                .status(
                    statusCode
                )
                .send({
                    statusCode,

                    error:
                        statusCode >=
                        500
                            ? "Internal Server Error"
                            : error.name ||
                                "Request Error",

                    message:
                        statusCode >=
                            500 &&
                        runtimeConfig
                            .production
                            ? "Ein interner Serverfehler ist aufgetreten."
                            : error.message
                });
        }
    );

    return fastify;
}

export default buildApp;
