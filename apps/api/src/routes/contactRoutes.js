import runtimeConfig from "../config/runtimeConfig.js";

import {
    createContactRateLimiter
} from "../contact/contactRateLimiter.js";

import {
    CONTACT_MESSAGE_STATUSES,
    createContactMessage,
    deleteContactMessage,
    getContactMessageById,
    getContactOverview,
    hashContactIp,
    listContactMessages,
    updateContactMessage
} from "../services/contactService.js";

const arbitraryObjectSchema = {
    type: "object",
    additionalProperties: true
};

const messageIdParametersSchema = {
    type: "object",
    required: [
        "messageId"
    ],
    properties: {
        messageId: {
            type: "integer",
            minimum: 1
        }
    },
    additionalProperties: false
};

const publicContactBodySchema = {
    type: "object",
    required: [
        "name",
        "email",
        "subject",
        "message",
        "privacyAccepted"
    ],
    properties: {
        name: {
            type: "string",
            minLength: 2,
            maxLength: 120
        },
        email: {
            type: "string",
            minLength: 3,
            maxLength: 254
        },
        subject: {
            type: "string",
            minLength: 3,
            maxLength: 180
        },
        message: {
            type: "string",
            minLength: 20,
            maxLength: 5000
        },
        privacyAccepted: {
            type: "boolean",
            const: true
        },
        sourcePath: {
            type: "string",
            maxLength: 500
        },
        company: {
            type: "string",
            maxLength: 200
        }
    },
    additionalProperties: false
};

const publicContactResponseSchema = {
    type: "object",
    required: [
        "accepted",
        "message"
    ],
    properties: {
        accepted: {
            type: "boolean"
        },
        reference: {
            type: "string"
        },
        createdAt: {
            type: [
                "string",
                "null"
            ]
        },
        message: {
            type: "string"
        }
    },
    additionalProperties: false
};

const adminListQuerySchema = {
    type: "object",
    properties: {
        limit: {
            type: "integer",
            minimum: 1,
            maximum: 250,
            default: 50
        },
        offset: {
            type: "integer",
            minimum: 0,
            default: 0
        },
        status: {
            type: "string",
            enum: CONTACT_MESSAGE_STATUSES
        },
        read: {
            type: "string",
            enum: [
                "read",
                "unread"
            ]
        },
        search: {
            type: "string",
            maxLength: 200
        }
    },
    additionalProperties: false
};

const adminUpdateBodySchema = {
    type: "object",
    minProperties: 1,
    properties: {
        status: {
            type: "string",
            enum: CONTACT_MESSAGE_STATUSES
        },
        isRead: {
            type: "boolean"
        },
        internalNote: {
            type: "string",
            maxLength: 10000
        }
    },
    additionalProperties: false
};

function sendContactMessageNotFound(
    reply
) {
    return reply
        .status(404)
        .send({
            statusCode: 404,
            error: "Not Found",
            message:
                "Die Kontaktanfrage wurde nicht gefunden."
        });
}

function getRequestUserAgent(
    request
) {
    const userAgent =
        request.headers[
            "user-agent"
        ];

    return Array.isArray(
        userAgent
    )
        ? userAgent[0] ??
            ""
        : userAgent ??
            "";
}

function applyRateLimitHeaders(
    reply,
    result
) {
    reply.header(
        "X-RateLimit-Limit",
        String(
            result.limit
        )
    );

    reply.header(
        "X-RateLimit-Remaining",
        String(
            result.remaining
        )
    );

    reply.header(
        "X-RateLimit-Reset",
        String(
            Math.ceil(
                result.resetAt /
                1000
            )
        )
    );
}

export default async function contactRoutes(
    fastify
) {
    const rateLimiter =
        createContactRateLimiter({
            maximumRequests:
                runtimeConfig.contact
                    .rateLimitMaximum,
            windowMilliseconds:
                runtimeConfig.contact
                    .rateLimitWindowMilliseconds
        });

    fastify.post(
        "/contact",
        {
            bodyLimit:
                32 * 1024,
            schema: {
                body:
                    publicContactBodySchema,
                response: {
                    201:
                        publicContactResponseSchema,
                    202:
                        publicContactResponseSchema
                }
            }
        },
        async (
            request,
            reply
        ) => {
            const ipHash =
                hashContactIp(
                    request.ip,
                    runtimeConfig.contact
                        .ipHashSecret
                );

            const limitResult =
                rateLimiter.consume(
                    ipHash
                );

            applyRateLimitHeaders(
                reply,
                limitResult
            );

            if (
                !limitResult.allowed
            ) {
                return reply
                    .header(
                        "Retry-After",
                        String(
                            limitResult
                                .retryAfterSeconds
                        )
                    )
                    .status(429)
                    .send({
                        statusCode: 429,
                        error:
                            "Too Many Requests",
                        message:
                            "Es wurden zu viele Kontaktanfragen gesendet. Bitte versuche es später erneut."
                    });
            }

            const honeypotValue =
                String(
                    request.body
                        .company ??
                    ""
                ).trim();

            if (honeypotValue) {
                return reply
                    .status(202)
                    .send({
                        accepted: true,
                        createdAt: null,
                        message:
                            "Vielen Dank. Deine Nachricht wurde entgegengenommen."
                    });
            }

            const contactMessage =
                await createContactMessage(
                    fastify.database,
                    request.body,
                    {
                        ipHash,
                        userAgent:
                            getRequestUserAgent(
                                request
                            ),
                        duplicateWindowSeconds:
                            runtimeConfig.contact
                                .duplicateWindowSeconds
                    }
                );

            return reply
                .status(201)
                .send({
                    accepted: true,
                    reference:
                        `BP-${contactMessage.id}`,
                    createdAt:
                        contactMessage.createdAt,
                    message:
                        "Vielen Dank. Deine Nachricht wurde erfolgreich übermittelt."
                });
        }
    );

    fastify.get(
        "/admin/contact/overview",
        {
            schema: {
                response: {
                    200:
                        arbitraryObjectSchema
                }
            }
        },
        async () => {
            return getContactOverview(
                fastify.database
            );
        }
    );

    fastify.get(
        "/admin/contact",
        {
            schema: {
                querystring:
                    adminListQuerySchema,
                response: {
                    200:
                        arbitraryObjectSchema
                }
            }
        },
        async (
            request
        ) => {
            return listContactMessages(
                fastify.database,
                request.query
            );
        }
    );

    fastify.get(
        "/admin/contact/:messageId",
        {
            schema: {
                params:
                    messageIdParametersSchema,
                response: {
                    200:
                        arbitraryObjectSchema
                }
            }
        },
        async (
            request,
            reply
        ) => {
            const contactMessage =
                await getContactMessageById(
                    fastify.database,
                    request.params
                        .messageId
                );

            if (!contactMessage) {
                return sendContactMessageNotFound(
                    reply
                );
            }

            return contactMessage;
        }
    );

    fastify.patch(
        "/admin/contact/:messageId",
        {
            bodyLimit:
                16 * 1024,
            schema: {
                params:
                    messageIdParametersSchema,
                body:
                    adminUpdateBodySchema,
                response: {
                    200:
                        arbitraryObjectSchema
                }
            }
        },
        async (
            request,
            reply
        ) => {
            const contactMessage =
                await updateContactMessage(
                    fastify.database,
                    request.params
                        .messageId,
                    request.body,
                    request.authUser
                );

            if (!contactMessage) {
                return sendContactMessageNotFound(
                    reply
                );
            }

            return contactMessage;
        }
    );

    fastify.delete(
        "/admin/contact/:messageId",
        {
            schema: {
                params:
                    messageIdParametersSchema
            }
        },
        async (
            request,
            reply
        ) => {
            const deleted =
                await deleteContactMessage(
                    fastify.database,
                    request.params
                        .messageId
                );

            if (!deleted) {
                return sendContactMessageNotFound(
                    reply
                );
            }

            return reply
                .status(204)
                .send();
        }
    );
}
