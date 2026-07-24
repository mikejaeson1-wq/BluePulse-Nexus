import assert from "node:assert/strict";

import {
    test
} from "node:test";

import {
    createContactNotificationMessage,
    createContactSmtpOptions,
    escapeContactEmailHtml,
    isContactEmailConfigured,
    sendContactNotificationEmail
} from "../src/contact/contactEmailService.js";

const EMAIL_CONFIG = {
    enabled:
        true,

    host:
        "smtp.gmail.com",

    port:
        465,

    secure:
        true,

    user:
        "bluepulsekontakt@gmail.com",

    password:
        "abcd efgh ijkl mnop",

    fromName:
        "BluePulse Tierschutz",

    fromAddress:
        "bluepulsekontakt@gmail.com",

    contactNotificationTo:
        "bluepulsekontakt@gmail.com",

    contactSubjectPrefix:
        "[BluePulse Kontakt]",

    tlsRejectUnauthorized:
        true,

    connectionTimeoutMilliseconds:
        10000,

    greetingTimeoutMilliseconds:
        10000,

    socketTimeoutMilliseconds:
        20000
};

const CONTACT_MESSAGE = {
    id:
        42,

    name:
        "Mike Test",

    email:
        "mike@example.de",

    subject:
        "Kooperationsanfrage",

    message:
        "Hallo BluePulse,\n\nwir möchten gerne mit euch zusammenarbeiten.",

    sourcePath:
        "/kontakt",

    createdAt:
        "2026-07-24T18:00:00.000Z"
};

test(
    "HTML-Sonderzeichen werden für Kontaktmails maskiert",
    () => {
        assert.equal(
            escapeContactEmailHtml(
                '<script>"test" & more</script>'
            ),
            "&lt;script&gt;&quot;test&quot; &amp; more&lt;/script&gt;"
        );
    }
);

test(
    "Gmail-App-Passwort wird ohne Leerzeichen an SMTP übergeben",
    () => {
        const options =
            createContactSmtpOptions(
                EMAIL_CONFIG
            );

        assert.equal(
            options.auth.pass,
            "abcdefghijklmnop"
        );

        assert.equal(
            options.host,
            "smtp.gmail.com"
        );

        assert.equal(
            options.port,
            465
        );

        assert.equal(
            options.secure,
            true
        );
    }
);

test(
    "vollständige SMTP-Konfiguration wird erkannt",
    () => {
        assert.equal(
            isContactEmailConfigured(
                EMAIL_CONFIG
            ),
            true
        );

        assert.equal(
            isContactEmailConfigured({
                ...EMAIL_CONFIG,

                password:
                    ""
            }),
            false
        );

        assert.equal(
            isContactEmailConfigured({
                ...EMAIL_CONFIG,

                enabled:
                    false
            }),
            false
        );
    }
);

test(
    "Kontaktmail verwendet Vereinsadresse als Absender und Besucher als Reply-To",
    () => {
        const message =
            createContactNotificationMessage(
                CONTACT_MESSAGE,
                {
                    emailConfig:
                        EMAIL_CONFIG,

                    publicUrl:
                        "https://blue-pulse.de"
                }
            );

        assert.deepEqual(
            message.from,
            {
                name:
                    "BluePulse Tierschutz",

                address:
                    "bluepulsekontakt@gmail.com"
            }
        );

        assert.deepEqual(
            message.replyTo,
            {
                name:
                    "Mike Test",

                address:
                    "mike@example.de"
            }
        );

        assert.equal(
            message.to,
            "bluepulsekontakt@gmail.com"
        );

        assert.match(
            message.subject,
            /BP-42/
        );

        assert.match(
            message.html,
            /https:\/\/blue-pulse\.de\/admin\/contact/
        );
    }
);

test(
    "deaktivierter E-Mail-Versand wird ohne SMTP-Aufruf übersprungen",
    async () => {
        let called =
            false;

        const result =
            await sendContactNotificationEmail(
                CONTACT_MESSAGE,
                {
                    emailConfig: {
                        ...EMAIL_CONFIG,

                        enabled:
                            false
                    },

                    transporter: {
                        async sendMail() {
                            called =
                                true;
                        }
                    }
                }
            );

        assert.equal(
            result.skipped,
            true
        );

        assert.equal(
            called,
            false
        );
    }
);

test(
    "Kontaktmail kann über einen injizierten Transporter versendet werden",
    async () => {
        let deliveredMessage =
            null;

        const transporter = {
            async sendMail(
                message
            ) {
                deliveredMessage =
                    message;

                return {
                    messageId:
                        "test-message-id",

                    accepted: [
                        "bluepulsekontakt@gmail.com"
                    ]
                };
            }
        };

        const result =
            await sendContactNotificationEmail(
                CONTACT_MESSAGE,
                {
                    emailConfig:
                        EMAIL_CONFIG,

                    publicUrl:
                        "https://blue-pulse.de",

                    transporter
                }
            );

        assert.equal(
            result.sent,
            true
        );

        assert.equal(
            result.messageId,
            "test-message-id"
        );

        assert.equal(
            deliveredMessage.replyTo.address,
            "mike@example.de"
        );
    }
);
