import {
    stdin,
    stdout
} from "node:process";

import {
    createInterface
} from "node:readline/promises";

import {
    createDatabasePool
} from "../database/database.js";

import {
    AUTH_ROLES,
    createUser
} from "../services/authService.js";

function readArgument(
    argumentName
) {
    const argumentsList =
        process.argv.slice(2);

    const prefixedName =
        `--${argumentName}=`;

    const inlineArgument =
        argumentsList.find(
            (argument) =>
                argument.startsWith(
                    prefixedName
                )
        );

    if (inlineArgument) {
        return inlineArgument.slice(
            prefixedName.length
        );
    }

    const argumentIndex =
        argumentsList.indexOf(
            `--${argumentName}`
        );

    if (
        argumentIndex >= 0 &&
        argumentsList[
            argumentIndex + 1
        ]
    ) {
        return argumentsList[
            argumentIndex + 1
        ];
    }

    return "";
}

function readHiddenInput(
    label
) {
    if (
        !stdin.isTTY ||
        typeof stdin.setRawMode !==
            "function"
    ) {
        const fallbackInterface =
            createInterface({
                input: stdin,
                output: stdout
            });

        return fallbackInterface
            .question(
                label
            )
            .finally(
                () => {
                    fallbackInterface
                        .close();
                }
            );
    }

    return new Promise(
        (
            resolve,
            reject
        ) => {
            let value = "";

            const previousRawMode =
                stdin.isRaw;

            stdout.write(
                label
            );

            stdin.setEncoding(
                "utf8"
            );

            stdin.setRawMode(
                true
            );

            stdin.resume();

            function cleanup() {
                stdin.off(
                    "data",
                    handleInput
                );

                stdin.setRawMode(
                    Boolean(
                        previousRawMode
                    )
                );

                stdin.pause();
            }

            function handleInput(
                chunk
            ) {
                for (
                    const character
                    of chunk
                ) {
                    if (
                        character ===
                        "\u0003"
                    ) {
                        cleanup();

                        stdout.write(
                            "\n"
                        );

                        reject(
                            new Error(
                                "Vorgang abgebrochen."
                            )
                        );

                        return;
                    }

                    if (
                        character ===
                            "\r" ||
                        character ===
                            "\n"
                    ) {
                        cleanup();

                        stdout.write(
                            "\n"
                        );

                        resolve(
                            value
                        );

                        return;
                    }

                    if (
                        character ===
                            "\u007f" ||
                        character ===
                            "\b"
                    ) {
                        if (
                            value.length >
                            0
                        ) {
                            value =
                                value.slice(
                                    0,
                                    -1
                                );

                            stdout.write(
                                "\b \b"
                            );
                        }

                        continue;
                    }

                    if (
                        character >=
                        " "
                    ) {
                        value +=
                            character;

                        stdout.write(
                            "*"
                        );
                    }
                }
            }

            stdin.on(
                "data",
                handleInput
            );
        }
    );
}

async function main() {
    const prompt =
        createInterface({
            input: stdin,
            output: stdout
        });

    let username =
        readArgument(
            "username"
        );

    let email =
        readArgument(
            "email"
        );

    let displayName =
        readArgument(
            "name"
        );

    if (!username) {
        username =
            await prompt.question(
                "Benutzername: "
            );
    }

    if (!email) {
        email =
            await prompt.question(
                "E-Mail-Adresse: "
            );
    }

    if (!displayName) {
        displayName =
            await prompt.question(
                "Anzeigename: "
            );
    }

    prompt.close();

    const password =
        await readHiddenInput(
            "Passwort: "
        );

    const repeatedPassword =
        await readHiddenInput(
            "Passwort wiederholen: "
        );

    if (
        password !==
        repeatedPassword
    ) {
        throw new Error(
            "Die Passwörter stimmen nicht überein."
        );
    }

    const database =
        createDatabasePool();

    try {
        const user =
            await createUser(
                database,
                {
                    username,
                    email,
                    displayName,
                    password,

                    role:
                        AUTH_ROLES
                            .ADMINISTRATOR
                }
            );

        stdout.write(
            [
                "",
                "Administrator erfolgreich erstellt.",
                `Benutzername: ${user.username}`,
                `E-Mail: ${user.email}`,
                `Anzeigename: ${user.displayName}`,
                `Rolle: ${user.roleLabel}`,
                ""
            ].join(
                "\n"
            )
        );
    } finally {
        await database.end();
    }
}

main().catch(
    (error) => {
        console.error(
            `Administrator konnte nicht erstellt werden: ${error.message}`
        );

        process.exitCode = 1;
    }
);