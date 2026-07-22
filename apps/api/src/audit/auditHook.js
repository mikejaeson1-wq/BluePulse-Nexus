import {
    createAuditEntry
} from "../services/auditService.js";

const MUTATING_METHODS =
    new Set([
        "POST",
        "PUT",
        "PATCH",
        "DELETE"
    ]);

const SENSITIVE_FIELD_PATTERN =
    /password|passwort|token|cookie|authorization|secret|hash/i;

function getRequestPath(
    request
) {
    return String(
        request.raw?.url ??
        request.url ??
        ""
    ).split(
        "?"
    )[0];
}

function decodePathValue(
    value
) {
    try {
        return decodeURIComponent(
            value
        );
    } catch {
        return value;
    }
}

function getSafeChangedFields(
    body
) {
    if (
        !body ||
        typeof body !==
            "object" ||
        Array.isArray(
            body
        )
    ) {
        return [];
    }

    return Object.keys(
        body
    )
        .filter(
            (field) =>
                !SENSITIVE_FIELD_PATTERN.test(
                    field
                )
        )
        .sort();
}

function getBodyLabel(
    body
) {
    if (
        !body ||
        typeof body !==
            "object" ||
        Array.isArray(
            body
        )
    ) {
        return null;
    }

    return (
        body.title ??
        body.displayName ??
        body.username ??
        body.label ??
        body.name ??
        body.filename ??
        null
    );
}

function createEvent({
    action,
    entityType,
    entityId = null,
    entityLabel = null,
    summary,
    metadata = {}
}) {
    return {
        action,
        entityType,
        entityId,
        entityLabel,
        summary,
        metadata
    };
}

function resolvePageEvent(
    method,
    path,
    body
) {
    if (
        method ===
            "POST" &&
        path ===
            "/api/admin/pages"
    ) {
        return createEvent({
            action:
                "page.create",

            entityType:
                "page",

            entityLabel:
                getBodyLabel(
                    body
                ),

            summary:
                `Builder-Seite „${getBodyLabel(body) ?? "Neue Seite"}“ wurde erstellt.`,

            metadata: {
                changedFields:
                    getSafeChangedFields(
                        body
                    )
            }
        });
    }

    let match =
        path.match(
            /^\/api\/admin\/pages\/([^/]+)\/publish$/
        );

    if (
        method ===
            "POST" &&
        match
    ) {
        return createEvent({
            action:
                "page.publish",

            entityType:
                "page",

            entityId:
                decodePathValue(
                    match[1]
                ),

            entityLabel:
                getBodyLabel(
                    body
                ),

            summary:
                "Eine Builder-Seite wurde veröffentlicht."
        });
    }

    match =
        path.match(
            /^\/api\/admin\/pages\/([^/]+)\/unpublish$/
        );

    if (
        method ===
            "POST" &&
        match
    ) {
        return createEvent({
            action:
                "page.unpublish",

            entityType:
                "page",

            entityId:
                decodePathValue(
                    match[1]
                ),

            entityLabel:
                getBodyLabel(
                    body
                ),

            summary:
                "Eine Builder-Seite wurde auf Entwurf gesetzt."
        });
    }

    match =
        path.match(
            /^\/api\/admin\/pages\/([^/]+)\/duplicate$/
        );

    if (
        method ===
            "POST" &&
        match
    ) {
        return createEvent({
            action:
                "page.duplicate",

            entityType:
                "page",

            entityId:
                decodePathValue(
                    match[1]
                ),

            summary:
                "Eine Builder-Seite wurde dupliziert."
        });
    }

    match =
        path.match(
            /^\/api\/admin\/pages\/([^/]+)\/restore$/
        );

    if (
        method ===
            "POST" &&
        match
    ) {
        return createEvent({
            action:
                "page.restore_from_trash",

            entityType:
                "page",

            entityId:
                decodePathValue(
                    match[1]
                ),

            summary:
                "Eine Builder-Seite wurde aus dem Papierkorb wiederhergestellt."
        });
    }

    match =
        path.match(
            /^\/api\/admin\/pages\/([^/]+)\/permanent$/
        );

    if (
        method ===
            "DELETE" &&
        match
    ) {
        return createEvent({
            action:
                "page.permanent_delete",

            entityType:
                "page",

            entityId:
                decodePathValue(
                    match[1]
                ),

            summary:
                "Eine Builder-Seite wurde endgültig gelöscht."
        });
    }

    match =
        path.match(
            /^\/api\/admin\/pages\/([^/]+)\/versions\/(\d+)\/restore$/
        );

    if (
        method ===
            "POST" &&
        match
    ) {
        return createEvent({
            action:
                "page.restore_version",

            entityType:
                "page",

            entityId:
                decodePathValue(
                    match[1]
                ),

            summary:
                `Version ${match[2]} einer Builder-Seite wurde wiederhergestellt.`,

            metadata: {
                versionNumber:
                    Number(
                        match[2]
                    )
            }
        });
    }

    match =
        path.match(
            /^\/api\/admin\/pages\/([^/]+)$/
        );

    if (
        method ===
            "PUT" &&
        match
    ) {
        return createEvent({
            action:
                "page.update",

            entityType:
                "page",

            entityId:
                decodePathValue(
                    match[1]
                ),

            entityLabel:
                getBodyLabel(
                    body
                ),

            summary:
                `Builder-Seite „${getBodyLabel(body) ?? match[1]}“ wurde bearbeitet.`,

            metadata: {
                changedFields:
                    getSafeChangedFields(
                        body
                    )
            }
        });
    }

    if (
        method ===
            "DELETE" &&
        match
    ) {
        return createEvent({
            action:
                "page.move_to_trash",

            entityType:
                "page",

            entityId:
                decodePathValue(
                    match[1]
                ),

            summary:
                "Eine Builder-Seite wurde in den Papierkorb verschoben."
        });
    }

    return null;
}

function resolveWebsiteEvent(
    method,
    path,
    body
) {
    let match =
        path.match(
            /^\/api\/admin\/content\/([^/]+)\/reset$/
        );

    if (
        method ===
            "POST" &&
        match
    ) {
        const contentKey =
            decodePathValue(
                match[1]
            );

        return createEvent({
            action:
                "website_content.reset",

            entityType:
                "website_content",

            entityId:
                contentKey,

            entityLabel:
                contentKey,

            summary:
                `Website-Bereich „${contentKey}“ wurde auf Standardwerte zurückgesetzt.`
        });
    }

    match =
        path.match(
            /^\/api\/admin\/content\/([^/]+)$/
        );

    if (
        method ===
            "PUT" &&
        match
    ) {
        const contentKey =
            decodePathValue(
                match[1]
            );

        return createEvent({
            action:
                "website_content.update",

            entityType:
                "website_content",

            entityId:
                contentKey,

            entityLabel:
                contentKey,

            summary:
                `Website-Bereich „${contentKey}“ wurde gespeichert.`,

            metadata: {
                changedFields:
                    getSafeChangedFields(
                        body
                    )
            }
        });
    }

    if (
        method ===
            "DELETE" &&
        match
    ) {
        const contentKey =
            decodePathValue(
                match[1]
            );

        return createEvent({
            action:
                "website_content.delete",

            entityType:
                "website_content",

            entityId:
                contentKey,

            entityLabel:
                contentKey,

            summary:
                `Website-Bereich „${contentKey}“ wurde gelöscht.`
        });
    }

    const singletonResources = [
        {
            path:
                "/api/admin/navigation",

            entityType:
                "navigation",

            label:
                "Navigation"
        },

        {
            path:
                "/api/admin/home-layout",

            entityType:
                "home_layout",

            label:
                "Startseiten-Layout"
        },

        {
            path:
                "/api/admin/footer",

            entityType:
                "footer",

            label:
                "Footer"
        }
    ];

    for (
        const resource
        of singletonResources
    ) {
        if (
            method ===
                "PUT" &&
            path ===
                resource.path
        ) {
            return createEvent({
                action:
                    `${resource.entityType}.update`,

                entityType:
                    resource.entityType,

                entityId:
                    "1",

                entityLabel:
                    resource.label,

                summary:
                    `${resource.label} wurde gespeichert.`,

                metadata: {
                    changedFields:
                        getSafeChangedFields(
                            body
                        )
                }
            });
        }

        if (
            method ===
                "POST" &&
            path ===
                `${resource.path}/reset`
        ) {
            return createEvent({
                action:
                    `${resource.entityType}.reset`,

                entityType:
                    resource.entityType,

                entityId:
                    "1",

                entityLabel:
                    resource.label,

                summary:
                    `${resource.label} wurde auf Standardwerte zurückgesetzt.`
            });
        }
    }

    return null;
}

function resolveUserEvent(
    method,
    path,
    body
) {
    if (
        method ===
            "POST" &&
        path ===
            "/api/admin/users"
    ) {
        return createEvent({
            action:
                "user.create",

            entityType:
                "user",

            entityLabel:
                getBodyLabel(
                    body
                ),

            summary:
                `Benutzerkonto „${getBodyLabel(body) ?? "Neuer Benutzer"}“ wurde erstellt.`,

            metadata: {
                role:
                    body?.role ??
                    null
            }
        });
    }

    let match =
        path.match(
            /^\/api\/admin\/users\/([^/]+)\/password$/
        );

    if (
        method ===
            "POST" &&
        match
    ) {
        return createEvent({
            action:
                "user.password_reset",

            entityType:
                "user",

            entityId:
                decodePathValue(
                    match[1]
                ),

            summary:
                "Das Passwort eines Benutzerkontos wurde zurückgesetzt."
        });
    }

    match =
        path.match(
            /^\/api\/admin\/users\/([^/]+)\/sessions\/revoke$/
        );

    if (
        method ===
            "POST" &&
        match
    ) {
        return createEvent({
            action:
                "user.sessions_revoke",

            entityType:
                "user",

            entityId:
                decodePathValue(
                    match[1]
                ),

            summary:
                "Alle Sitzungen eines Benutzerkontos wurden beendet."
        });
    }

    match =
        path.match(
            /^\/api\/admin\/users\/([^/]+)$/
        );

    if (
        method ===
            "PATCH" &&
        match
    ) {
        return createEvent({
            action:
                "user.update",

            entityType:
                "user",

            entityId:
                decodePathValue(
                    match[1]
                ),

            entityLabel:
                getBodyLabel(
                    body
                ),

            summary:
                "Ein Benutzerkonto wurde bearbeitet.",

            metadata: {
                changedFields:
                    getSafeChangedFields(
                        body
                    )
            }
        });
    }

    return null;
}

function resolveMediaEvent(
    method,
    path,
    body
) {
    if (
        method ===
            "POST" &&
        path ===
            "/api/admin/media"
    ) {
        return createEvent({
            action:
                "media.upload",

            entityType:
                "media",

            entityLabel:
                getBodyLabel(
                    body
                ),

            summary:
                "Eine Mediendatei wurde hochgeladen."
        });
    }

    if (
        path.startsWith(
            "/api/admin/media/import/"
        )
    ) {
        return createEvent({
            action:
                "media.import",

            entityType:
                "media",

            summary:
                "Eine Medienmigration wurde ausgeführt."
        });
    }

    const match =
        path.match(
            /^\/api\/admin\/media\/([^/]+)$/
        );

    if (
        match &&
        (
            method ===
                "PUT" ||
            method ===
                "PATCH"
        )
    ) {
        return createEvent({
            action:
                "media.update",

            entityType:
                "media",

            entityId:
                decodePathValue(
                    match[1]
                ),

            entityLabel:
                getBodyLabel(
                    body
                ),

            summary:
                "Eine Mediendatei wurde bearbeitet.",

            metadata: {
                changedFields:
                    getSafeChangedFields(
                        body
                    )
            }
        });
    }

    if (
        match &&
        method ===
            "DELETE"
    ) {
        return createEvent({
            action:
                "media.delete",

            entityType:
                "media",

            entityId:
                decodePathValue(
                    match[1]
                ),

            summary:
                "Eine Mediendatei wurde gelöscht."
        });
    }

    return null;
}

function resolveAuditEvent(
    request
) {
    const method =
        String(
            request.method ??
            ""
        ).toUpperCase();

    if (
        !MUTATING_METHODS.has(
            method
        )
    ) {
        return null;
    }

    const path =
        getRequestPath(
            request
        );

    if (
        !path.startsWith(
            "/api/admin/"
        ) ||
        path.startsWith(
            "/api/admin/audit"
        )
    ) {
        return null;
    }

    const body =
        request.body;

    return (
        resolvePageEvent(
            method,
            path,
            body
        ) ??
        resolveWebsiteEvent(
            method,
            path,
            body
        ) ??
        resolveUserEvent(
            method,
            path,
            body
        ) ??
        resolveMediaEvent(
            method,
            path,
            body
        ) ??
        createEvent({
            action:
                "admin.mutation",

            entityType:
                path
                    .replace(
                        /^\/api\/admin\/?/,
                        ""
                    )
                    .split(
                        "/"
                    )[0] ||
                "admin",

            entityLabel:
                getBodyLabel(
                    body
                ),

            summary:
                `${method} ${path} wurde erfolgreich ausgeführt.`,

            metadata: {
                changedFields:
                    getSafeChangedFields(
                        body
                    )
            }
        })
    );
}

export function registerAuditHook(
    fastify
) {
    fastify.addHook(
        "onResponse",
        async (
            request,
            reply
        ) => {
            if (
                reply.statusCode <
                    200 ||
                reply.statusCode >=
                    400
            ) {
                return;
            }

            if (
                !request.authUser
            ) {
                return;
            }

            const event =
                resolveAuditEvent(
                    request
                );

            if (!event) {
                return;
            }

            try {
                await createAuditEntry(
                    fastify.database,
                    {
                        actor:
                            request.authUser,

                        ...event,

                        requestMethod:
                            request.method,

                        requestPath:
                            getRequestPath(
                                request
                            )
                    }
                );
            } catch (error) {
                request.log.error(
                    {
                        error,

                        auditAction:
                            event.action
                    },
                    "Der Audit-Eintrag konnte nicht gespeichert werden."
                );
            }
        }
    );
}

export default registerAuditHook;