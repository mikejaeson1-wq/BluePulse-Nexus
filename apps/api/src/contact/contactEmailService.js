import nodemailer from "nodemailer";

import runtimeConfig from "../config/runtimeConfig.js";

function normalizeText(
    value,
    fallback = ""
) {
    const normalizedValue =
        String(
            value ?? ""
        ).trim();

    return normalizedValue ||
        fallback;
}

function normalizeMultilineText(
    value
) {
    return String(
        value ?? ""
    )
        .replace(
            /\r\n?/g,
            "\n"
        )
        .trim();
}

function normalizeMailPassword(
    password,
    host
) {
    const normalizedPassword =
        String(
            password ?? ""
        ).trim();

    if (
        String(
            host ?? ""
        )
            .trim()
            .toLowerCase() ===
        "smtp.gmail.com"
    ) {
        return normalizedPassword.replace(
            /\s+/g,
            ""
        );
    }

    return normalizedPassword;
}

export function escapeContactEmailHtml(
    value
) {
    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}

function formatContactDate(
    value
) {
    const date =
        value
            ? new Date(
                value
            )
            : new Date();

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return new Date()
            .toLocaleString(
                "de-DE"
            );
    }

    return date.toLocaleString(
        "de-DE",
        {
            dateStyle:
                "long",

            timeStyle:
                "short",

            timeZone:
                "Europe/Berlin"
        }
    );
}

function getContactReference(
    contactMessage
) {
    const identifier =
        Number.parseInt(
            String(
                contactMessage?.id ??
                ""
            ),
            10
        );

    return Number.isInteger(
        identifier
    ) &&
        identifier >
        0
        ? `BP-${identifier}`
        : "BP-KONTAKT";
}

function getAdminContactUrl(
    publicUrl
) {
    const normalizedPublicUrl =
        normalizeText(
            publicUrl,
            "http://127.0.0.1:5173"
        ).replace(
            /\/+$/,
            ""
        );

    return `${normalizedPublicUrl}/admin/contact`;
}

export function isContactEmailConfigured(
    config =
        runtimeConfig.email
) {
    if (
        !config?.enabled
    ) {
        return false;
    }

    return Boolean(
        normalizeText(
            config.host
        ) &&
        Number(
            config.port
        ) >
            0 &&
        normalizeText(
            config.user
        ) &&
        normalizeMailPassword(
            config.password,
            config.host
        ) &&
        normalizeText(
            config.fromAddress
        ) &&
        normalizeText(
            config.contactNotificationTo
        )
    );
}

export function createContactSmtpOptions(
    config =
        runtimeConfig.email
) {
    return {
        host:
            normalizeText(
                config.host,
                "smtp.gmail.com"
            ),

        port:
            Number(
                config.port
            ) ||
            465,

        secure:
            Boolean(
                config.secure
            ),

        auth: {
            user:
                normalizeText(
                    config.user
                ),

            pass:
                normalizeMailPassword(
                    config.password,
                    config.host
                )
        },

        tls: {
            rejectUnauthorized:
                config
                    .tlsRejectUnauthorized !==
                false
        },

        connectionTimeout:
            Number(
                config
                    .connectionTimeoutMilliseconds
            ) ||
            10000,

        greetingTimeout:
            Number(
                config
                    .greetingTimeoutMilliseconds
            ) ||
            10000,

        socketTimeout:
            Number(
                config
                    .socketTimeoutMilliseconds
            ) ||
            20000
    };
}

export function createContactNotificationMessage(
    contactMessage,
    {
        emailConfig =
            runtimeConfig.email,

        publicUrl =
            runtimeConfig.publicUrl
    } = {}
) {
    const reference =
        getContactReference(
            contactMessage
        );

    const senderName =
        normalizeText(
            contactMessage?.name,
            "Unbekannte Person"
        );

    const senderEmail =
        normalizeText(
            contactMessage?.email
        );

    const subject =
        normalizeText(
            contactMessage?.subject,
            "Kontaktanfrage"
        );

    const message =
        normalizeMultilineText(
            contactMessage?.message
        );

    const sourcePath =
        normalizeText(
            contactMessage?.sourcePath,
            "/kontakt"
        );

    const createdAt =
        formatContactDate(
            contactMessage?.createdAt
        );

    const adminUrl =
        getAdminContactUrl(
            publicUrl
        );

    const emailSubject =
        [
            normalizeText(
                emailConfig
                    .contactSubjectPrefix,
                "[BluePulse Kontakt]"
            ),
            reference,
            subject
        ].join(
            " · "
        );

    const text = [
        "Neue Kontaktanfrage über die BluePulse-Website",
        "",
        `Referenz: ${reference}`,
        `Eingang: ${createdAt}`,
        `Name: ${senderName}`,
        `E-Mail: ${senderEmail}`,
        `Betreff: ${subject}`,
        `Quelle: ${sourcePath}`,
        "",
        "Nachricht:",
        message,
        "",
        "Kontaktpostfach öffnen:",
        adminUrl,
        "",
        "Über die Antwortfunktion des E-Mail-Programms wird direkt an die anfragende Person geantwortet."
    ].join(
        "\n"
    );

    const escapedMessage =
        escapeContactEmailHtml(
            message
        ).replace(
            /\n/g,
            "<br>"
        );

    const html = `
<!doctype html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>${escapeContactEmailHtml(emailSubject)}</title>
</head>
<body style="margin:0;padding:0;background:#020617;color:#e2e8f0;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#020617;padding:28px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#0f172a;border:1px solid rgba(56,189,248,.22);border-radius:18px;overflow:hidden;">
                    <tr>
                        <td style="padding:24px 28px;background:linear-gradient(135deg,#082f49,#0f172a);border-bottom:1px solid rgba(56,189,248,.18);">
                            <div style="color:#38bdf8;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">BluePulse Tierschutz</div>
                            <h1 style="margin:8px 0 0;color:#f8fafc;font-size:24px;line-height:1.25;">Neue Kontaktanfrage</h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:24px 28px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:22px;">
                                <tr>
                                    <td style="padding:7px 0;color:#64748b;font-size:13px;width:120px;">Referenz</td>
                                    <td style="padding:7px 0;color:#7dd3fc;font-size:14px;font-weight:700;">${escapeContactEmailHtml(reference)}</td>
                                </tr>
                                <tr>
                                    <td style="padding:7px 0;color:#64748b;font-size:13px;">Eingang</td>
                                    <td style="padding:7px 0;color:#cbd5e1;font-size:14px;">${escapeContactEmailHtml(createdAt)}</td>
                                </tr>
                                <tr>
                                    <td style="padding:7px 0;color:#64748b;font-size:13px;">Name</td>
                                    <td style="padding:7px 0;color:#f8fafc;font-size:14px;font-weight:700;">${escapeContactEmailHtml(senderName)}</td>
                                </tr>
                                <tr>
                                    <td style="padding:7px 0;color:#64748b;font-size:13px;">E-Mail</td>
                                    <td style="padding:7px 0;color:#38bdf8;font-size:14px;">${escapeContactEmailHtml(senderEmail)}</td>
                                </tr>
                                <tr>
                                    <td style="padding:7px 0;color:#64748b;font-size:13px;">Betreff</td>
                                    <td style="padding:7px 0;color:#f8fafc;font-size:14px;">${escapeContactEmailHtml(subject)}</td>
                                </tr>
                                <tr>
                                    <td style="padding:7px 0;color:#64748b;font-size:13px;">Quelle</td>
                                    <td style="padding:7px 0;color:#cbd5e1;font-size:14px;">${escapeContactEmailHtml(sourcePath)}</td>
                                </tr>
                            </table>

                            <div style="margin-bottom:8px;color:#38bdf8;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Nachricht</div>

                            <div style="padding:18px;background:#020617;border:1px solid rgba(148,163,184,.12);border-radius:12px;color:#e2e8f0;font-size:15px;line-height:1.7;">
                                ${escapedMessage}
                            </div>

                            <div style="margin-top:24px;">
                                <a href="${escapeContactEmailHtml(adminUrl)}" style="display:inline-block;padding:12px 18px;background:#0284c7;color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;">
                                    Im Nexus-Kontaktpostfach öffnen
                                </a>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:17px 28px;background:#020617;color:#64748b;font-size:12px;line-height:1.55;border-top:1px solid rgba(148,163,184,.1);">
                            Antworte einfach auf diese E-Mail. Als Antwortadresse ist ${escapeContactEmailHtml(senderEmail)} hinterlegt.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();

    return {
        from: {
            name:
                normalizeText(
                    emailConfig.fromName,
                    "BluePulse Tierschutz"
                ),

            address:
                normalizeText(
                    emailConfig.fromAddress
                )
        },

        to:
            normalizeText(
                emailConfig
                    .contactNotificationTo
            ),

        replyTo:
            senderEmail
                ? {
                    name:
                        senderName,

                    address:
                        senderEmail
                }
                : undefined,

        subject:
            emailSubject,

        text,

        html,

        headers: {
            "X-BluePulse-Reference":
                reference
        }
    };
}

export function createContactEmailTransport(
    config =
        runtimeConfig.email
) {
    return nodemailer.createTransport(
        createContactSmtpOptions(
            config
        )
    );
}

export async function verifyContactEmailTransport({
    emailConfig =
        runtimeConfig.email,

    transporter
} = {}) {
    if (
        !isContactEmailConfigured(
            emailConfig
        )
    ) {
        throw new Error(
            "Der E-Mail-Versand ist nicht vollständig konfiguriert."
        );
    }

    const activeTransporter =
        transporter ??
        createContactEmailTransport(
            emailConfig
        );

    await activeTransporter.verify();

    return true;
}

export async function sendContactNotificationEmail(
    contactMessage,
    {
        emailConfig =
            runtimeConfig.email,

        publicUrl =
            runtimeConfig.publicUrl,

        transporter
    } = {}
) {
    if (
        !emailConfig?.enabled
    ) {
        return {
            sent:
                false,

            skipped:
                true,

            reason:
                "disabled"
        };
    }

    if (
        !isContactEmailConfigured(
            emailConfig
        )
    ) {
        throw new Error(
            "Der E-Mail-Versand ist aktiviert, aber die SMTP-Konfiguration ist unvollständig."
        );
    }

    const activeTransporter =
        transporter ??
        createContactEmailTransport(
            emailConfig
        );

    const mail =
        createContactNotificationMessage(
            contactMessage,
            {
                emailConfig,
                publicUrl
            }
        );

    const result =
        await activeTransporter.sendMail(
            mail
        );

    return {
        sent:
            true,

        skipped:
            false,

        messageId:
            result?.messageId ??
            "",

        accepted:
            Array.isArray(
                result?.accepted
            )
                ? result.accepted
                : []
    };
}

export async function sendContactTestEmail({
    emailConfig =
        runtimeConfig.email,

    publicUrl =
        runtimeConfig.publicUrl,

    transporter
} = {}) {
    const testMessage = {
        id:
            999999,

        name:
            "BluePulse Systemtest",

        email:
            emailConfig
                .contactNotificationTo,

        subject:
            "SMTP-E-Mail-Test",

        message:
            "Diese Nachricht bestätigt, dass der E-Mail-Versand für neue Kontaktanfragen korrekt eingerichtet ist.",

        sourcePath:
            "/kontakt",

        createdAt:
            new Date()
                .toISOString()
    };

    return sendContactNotificationEmail(
        testMessage,
        {
            emailConfig,
            publicUrl,
            transporter
        }
    );
}
