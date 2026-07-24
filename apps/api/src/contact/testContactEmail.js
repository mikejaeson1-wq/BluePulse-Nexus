import runtimeConfig from "../config/runtimeConfig.js";

import {
    createContactEmailTransport,
    isContactEmailConfigured,
    sendContactTestEmail,
    verifyContactEmailTransport
} from "./contactEmailService.js";

function printConfigurationSummary() {
    console.log(
        [
            "",
            "BluePulse Kontakt-E-Mail-Test",
            "--------------------------------",
            `Aktiviert: ${runtimeConfig.email.enabled ? "ja" : "nein"}`,
            `SMTP-Server: ${runtimeConfig.email.host}`,
            `SMTP-Port: ${runtimeConfig.email.port}`,
            `TLS/SSL: ${runtimeConfig.email.secure ? "direkt" : "STARTTLS/optional"}`,
            `SMTP-Benutzer: ${runtimeConfig.email.user || "nicht gesetzt"}`,
            `Absender: ${runtimeConfig.email.fromAddress || "nicht gesetzt"}`,
            `Empfänger: ${runtimeConfig.email.contactNotificationTo || "nicht gesetzt"}`,
            ""
        ].join(
            "\n"
        )
    );
}

async function main() {
    printConfigurationSummary();

    if (
        !isContactEmailConfigured()
    ) {
        throw new Error(
            "Die E-Mail-Konfiguration ist unvollständig. Prüfe MAIL_ENABLED, MAIL_USER, MAIL_PASSWORD, MAIL_FROM_ADDRESS und CONTACT_NOTIFICATION_TO."
        );
    }

    const transporter =
        createContactEmailTransport();

    console.log(
        "SMTP-Verbindung wird geprüft …"
    );

    await verifyContactEmailTransport({
        transporter
    });

    console.log(
        "SMTP-Anmeldung erfolgreich."
    );

    console.log(
        "Testnachricht wird versendet …"
    );

    const result =
        await sendContactTestEmail({
            transporter
        });

    console.log(
        [
            "Testnachricht erfolgreich versendet.",
            `Message-ID: ${result.messageId || "nicht bereitgestellt"}`,
            `Empfänger akzeptiert: ${result.accepted.join(", ") || runtimeConfig.email.contactNotificationTo}`
        ].join(
            "\n"
        )
    );

    transporter.close?.();
}

main().catch(
    (error) => {
        console.error(
            "",
            "Kontakt-E-Mail-Test fehlgeschlagen:",
            error?.message ??
            error
        );

        process.exitCode =
            1;
    }
);
