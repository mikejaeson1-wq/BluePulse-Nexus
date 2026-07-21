import {
    migrateBrowserData,
    readBrowserMigrationStatus
} from "../services/browserMigrationService.js";

const arbitraryObjectSchema = {
    type: "object",
    additionalProperties: true
};

const migrationBodySchema = {
    type: "object",

    required: [
        "format",
        "formatVersion",
        "exportedAt",
        "siteContent",
        "navigation",
        "homeLayout",
        "footer",
        "pages"
    ],

    properties: {
        format: {
            type: "string"
        },

        formatVersion: {
            type: "integer"
        },

        exportedAt: {
            type: "string"
        },

        siteContent:
            arbitraryObjectSchema,

        navigation:
            arbitraryObjectSchema,

        homeLayout:
            arbitraryObjectSchema,

        footer:
            arbitraryObjectSchema,

        pages: {
            type: "array",
            items:
                arbitraryObjectSchema
        },

        mediaSummary:
            arbitraryObjectSchema
    },

    additionalProperties: false
};

export default async function migrationRoutes(
    fastify
) {
    fastify.get(
        "/admin/migration/status",
        async () => {
            return readBrowserMigrationStatus(
                fastify.database
            );
        }
    );

    fastify.post(
        "/admin/migration/browser-data",
        {
            schema: {
                body:
                    migrationBodySchema
            },

            bodyLimit:
                25 * 1024 * 1024
        },
        async (
            request
        ) => {
            const result =
                await migrateBrowserData(
                    fastify.database,
                    request.body
                );

            return {
                status:
                    "completed",

                ...result
            };
        }
    );
}