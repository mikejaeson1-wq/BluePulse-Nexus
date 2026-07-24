import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import {
    fileURLToPath
} from "node:url";

const scriptDirectory =
    path.dirname(
        fileURLToPath(
            import.meta.url
        )
    );

const projectRoot =
    path.resolve(
        scriptDirectory,
        ".."
    );

const environmentPath =
    path.resolve(
        projectRoot,
        process.argv[2] ??
            ".env.production"
    );

function parseEnvironment(
    content
) {
    const environment = {};

    for (
        const sourceLine
        of content.split(
            /\r?\n/
        )
    ) {
        const line =
            sourceLine.trim();

        if (
            !line ||
            line.startsWith("#")
        ) {
            continue;
        }

        const separatorIndex =
            line.indexOf("=");

        if (separatorIndex < 1) {
            continue;
        }

        const name =
            line.slice(
                0,
                separatorIndex
            ).trim();

        let value =
            line.slice(
                separatorIndex + 1
            ).trim();

        if (
            value.length >= 2 &&
            (
                (
                    value.startsWith("\"") &&
                    value.endsWith("\"")
                ) ||
                (
                    value.startsWith("'") &&
                    value.endsWith("'")
                )
            )
        ) {
            value =
                value.slice(
                    1,
                    -1
                );
        }

        environment[name] =
            value;
    }

    return environment;
}

function isTrue(
    value
) {
    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase() ===
        "true";
}

if (
    !fs.existsSync(
        environmentPath
    )
) {
    console.error(
        `Die Produktionskonfiguration wurde nicht gefunden: ${environmentPath}`
    );

    console.error(
        "Zuerst npm run production:env ausfuehren."
    );

    process.exit(1);
}

const environment =
    parseEnvironment(
        fs.readFileSync(
            environmentPath,
            "utf8"
        )
    );

const errors = [];

const requiredNames = [
    "COMPOSE_PROJECT_NAME",
    "SITE_DOMAIN",
    "ACME_EMAIL",
    "APP_PUBLIC_URL",
    "POSTGRES_DB",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "AUTH_REQUIRED",
    "AUTH_COOKIE_NAME",
    "AUTH_COOKIE_SECURE",
    "CONTACT_IP_HASH_SECRET",
    "MAIL_ENABLED",
    "MAIL_TLS_REJECT_UNAUTHORIZED"
];

for (
    const name
    of requiredNames
) {
    if (
        !String(
            environment[name] ??
                ""
        ).trim()
    ) {
        errors.push(
            `${name} fehlt oder ist leer.`
        );
    }
}

for (
    const [
        name,
        value
    ]
    of Object.entries(
        environment
    )
) {
    if (
        String(value)
            .includes(
                "CHANGE_ME"
            )
    ) {
        errors.push(
            `${name} enthaelt noch einen CHANGE_ME-Platzhalter.`
        );
    }
}

const domain =
    String(
        environment.SITE_DOMAIN ??
            ""
    )
        .trim()
        .toLowerCase();

const domainPattern =
    /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

if (
    domain &&
    !domainPattern.test(
        domain
    )
) {
    errors.push(
        "SITE_DOMAIN muss ein reiner Domainname ohne Protokoll, Port oder Pfad sein."
    );
}

try {
    const publicUrl =
        new URL(
            environment.APP_PUBLIC_URL
        );

    if (
        publicUrl.protocol !==
            "https:" ||
        publicUrl.hostname
            .toLowerCase() !==
            domain ||
        (
            publicUrl.pathname !==
                "/" &&
            publicUrl.pathname !==
                ""
        ) ||
        publicUrl.search ||
        publicUrl.hash
    ) {
        errors.push(
            "APP_PUBLIC_URL muss exakt die HTTPS-Adresse von SITE_DOMAIN enthalten."
        );
    }
} catch {
    errors.push(
        "APP_PUBLIC_URL ist keine gueltige URL."
    );
}

if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        environment.ACME_EMAIL ??
            ""
    )
) {
    errors.push(
        "ACME_EMAIL ist keine gueltige E-Mail-Adresse."
    );
}

if (
    String(
        environment.POSTGRES_PASSWORD ??
            ""
    ).length <
        32
) {
    errors.push(
        "POSTGRES_PASSWORD muss mindestens 32 Zeichen lang sein."
    );
}

if (
    String(
        environment.CONTACT_IP_HASH_SECRET ??
            ""
    ).length <
        64
) {
    errors.push(
        "CONTACT_IP_HASH_SECRET muss mindestens 64 Zeichen lang sein."
    );
}

if (
    !isTrue(
        environment.AUTH_REQUIRED
    )
) {
    errors.push(
        "AUTH_REQUIRED muss in Produktion true sein."
    );
}

if (
    !isTrue(
        environment.AUTH_COOKIE_SECURE
    )
) {
    errors.push(
        "AUTH_COOKIE_SECURE muss in Produktion true sein."
    );
}

if (
    !isTrue(
        environment.MAIL_TLS_REJECT_UNAUTHORIZED
    )
) {
    errors.push(
        "MAIL_TLS_REJECT_UNAUTHORIZED muss in Produktion true sein."
    );
}

if (
    isTrue(
        environment.MAIL_ENABLED
    )
) {
    for (
        const name
        of [
            "MAIL_HOST",
            "MAIL_USER",
            "MAIL_PASSWORD",
            "MAIL_FROM_ADDRESS",
            "CONTACT_NOTIFICATION_TO"
        ]
    ) {
        if (
            !String(
                environment[name] ??
                    ""
            ).trim()
        ) {
            errors.push(
                `${name} wird bei aktiviertem E-Mail-Versand benoetigt.`
            );
        }
    }
}

if (errors.length > 0) {
    console.error(
        "Die Produktionskonfiguration ist noch nicht startbereit:"
    );

    for (
        const error
        of errors
    ) {
        console.error(
            `- ${error}`
        );
    }

    process.exit(1);
}

console.log(
    `Produktionskonfiguration gueltig: https://${domain}`
);
