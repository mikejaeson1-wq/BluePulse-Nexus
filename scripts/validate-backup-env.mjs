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
            ".env.backup"
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

function resolveProjectPath(
    value
) {
    return path.resolve(
        projectRoot,
        value
    );
}

if (
    !fs.existsSync(
        environmentPath
    )
) {
    console.error(
        `Die Backup-Konfiguration wurde nicht gefunden: ${environmentPath}`
    );

    console.error(
        "Zuerst npm run backup:env ausfuehren."
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
    "BACKUP_REPOSITORY_PATH",
    "BACKUP_RECOVERY_PATH",
    "BACKUP_SOURCE_ENV_FILE",
    "RESTIC_PASSWORD_FILE_HOST",
    "BACKUP_HOSTNAME",
    "BACKUP_KEEP_DAILY",
    "BACKUP_KEEP_WEEKLY",
    "BACKUP_KEEP_MONTHLY",
    "BACKUP_KEEP_YEARLY",
    "BACKUP_CHECK_AFTER_BACKUP"
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
    const name
    of [
        "BACKUP_KEEP_DAILY",
        "BACKUP_KEEP_WEEKLY",
        "BACKUP_KEEP_MONTHLY",
        "BACKUP_KEEP_YEARLY"
    ]
) {
    const value =
        String(
            environment[name] ??
                ""
        );

    if (
        !/^\d+$/.test(
            value
        ) ||
        Number(value) < 1 ||
        Number(value) > 3650
    ) {
        errors.push(
            `${name} muss eine ganze Zahl zwischen 1 und 3650 sein.`
        );
    }
}

if (
    ![
        "true",
        "false"
    ].includes(
        String(
            environment
                .BACKUP_CHECK_AFTER_BACKUP ??
                ""
        ).toLowerCase()
    )
) {
    errors.push(
        "BACKUP_CHECK_AFTER_BACKUP muss true oder false sein."
    );
}

if (
    environment.BACKUP_HOSTNAME &&
    !/^[a-z0-9][a-z0-9._-]*$/i.test(
        environment.BACKUP_HOSTNAME
    )
) {
    errors.push(
        "BACKUP_HOSTNAME darf nur Buchstaben, Ziffern, Punkt, Unterstrich und Bindestrich enthalten."
    );
}

if (
    environment
        .BACKUP_SOURCE_ENV_FILE
) {
    const sourceEnvironmentPath =
        resolveProjectPath(
            environment
                .BACKUP_SOURCE_ENV_FILE
        );

    if (
        !fs.existsSync(
            sourceEnvironmentPath
        ) ||
        !fs.statSync(
            sourceEnvironmentPath
        ).isFile()
    ) {
        errors.push(
            `Die zu sichernde Konfiguration fehlt: ${sourceEnvironmentPath}`
        );
    }
}

if (
    environment
        .RESTIC_PASSWORD_FILE_HOST
) {
    const passwordPath =
        resolveProjectPath(
            environment
                .RESTIC_PASSWORD_FILE_HOST
        );

    if (
        !fs.existsSync(
            passwordPath
        ) ||
        !fs.statSync(
            passwordPath
        ).isFile()
    ) {
        errors.push(
            `Der Restic-Schluessel fehlt: ${passwordPath}`
        );
    } else {
        const password =
            fs.readFileSync(
                passwordPath,
                "utf8"
            ).trim();

        if (
            !/^[a-f0-9]{64,}$/i.test(
                password
            )
        ) {
            errors.push(
                "Der Restic-Schluessel muss mindestens 64 hexadezimale Zeichen enthalten."
            );
        }
    }
}

for (
    const name
    of [
        "BACKUP_REPOSITORY_PATH",
        "BACKUP_RECOVERY_PATH"
    ]
) {
    if (!environment[name]) {
        continue;
    }

    const configuredPath =
        resolveProjectPath(
            environment[name]
        );

    if (
        fs.existsSync(
            configuredPath
        ) &&
        !fs.statSync(
            configuredPath
        ).isDirectory()
    ) {
        errors.push(
            `${name} verweist nicht auf ein Verzeichnis.`
        );
    }

    if (
        configuredPath ===
            projectRoot ||
        configuredPath ===
            path.parse(
                configuredPath
            ).root
    ) {
        errors.push(
            `${name} darf weder das Projektroot noch ein Laufwerksroot sein.`
        );
    }
}

if (
    environment
        .BACKUP_REPOSITORY_PATH &&
    environment
        .BACKUP_RECOVERY_PATH &&
    resolveProjectPath(
        environment
            .BACKUP_REPOSITORY_PATH
    ) ===
        resolveProjectPath(
            environment
                .BACKUP_RECOVERY_PATH
        )
) {
    errors.push(
        "BACKUP_REPOSITORY_PATH und BACKUP_RECOVERY_PATH muessen verschieden sein."
    );
}

if (errors.length > 0) {
    console.error(
        "Die Backup-Konfiguration ist noch nicht startbereit:"
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
    `Backup-Konfiguration gueltig: ${environment.BACKUP_HOSTNAME}`
);
