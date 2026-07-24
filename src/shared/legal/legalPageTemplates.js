import {
    createDefaultBlockSettings
} from "@shared/pages/blockSettings";

export const LEGAL_SETUP_STORAGE_KEY =
    "bluepulse.nexus.legal-setup.v1";

export const DEFAULT_LEGAL_SETUP =
    Object.freeze({
        organizationName:
            "BluePulse Tierschutz n.e.V.",

        organizationType:
            "Gemeinnütziger, nicht eingetragener Verein",

        serviceAddress:
            "",

        representatives:
            "Holger Fischer\nDoreen Hoffmann",

        email:
            "bluepulsekontakt@gmail.com",

        website:
            "blue-pulse.de",

        editorialResponsible:
            "",

        editorialAddress:
            "",

        hostingProvider:
            "",

        hostingAddress:
            "",

        supervisoryAuthority:
            "Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen",

        supervisoryEmail:
            "poststelle@ldi.nrw.de"
    });

function createId(
    prefix
) {
    return (
        globalThis.crypto
            ?.randomUUID?.() ??
        `${prefix}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`
    );
}

function normalizeText(
    value,
    fallback = ""
) {
    const normalizedValue =
        String(
            value ??
            ""
        ).trim();

    return normalizedValue ||
        fallback;
}

function normalizeMultiline(
    value
) {
    return String(
        value ??
        ""
    )
        .replace(
            /\r\n?/g,
            "\n"
        )
        .trim();
}

function createSection({
    title,
    paragraphs = [],
    items = [],
    note = ""
}) {
    return {
        id:
            createId(
                "legal-section"
            ),

        title:
            normalizeText(
                title
            ),

        paragraphs:
            (
                Array.isArray(
                    paragraphs
                )
                    ? paragraphs
                    : []
            )
                .map(
                    (
                        paragraph
                    ) =>
                        normalizeMultiline(
                            paragraph
                        )
                )
                .filter(
                    Boolean
                ),

        items:
            (
                Array.isArray(
                    items
                )
                    ? items
                    : []
            )
                .map(
                    (
                        item
                    ) =>
                        normalizeText(
                            item
                        )
                )
                .filter(
                    Boolean
                ),

        note:
            normalizeMultiline(
                note
            )
    };
}

function createLegalBlock(
    data
) {
    return {
        id:
            createId(
                "legal-document"
            ),

        type:
            "legal-document",

        data,

        settings:
            createDefaultBlockSettings()
    };
}

function createPageTheme({
    title,
    description,
    canonicalUrl,
    indexable
}) {
    return {
        pageSettings: {
            seo: {
                title,
                description,
                canonicalUrl,
                indexable,
                followLinks:
                    true
            },

            social: {
                title,
                description,
                image:
                    "",

                imageAlt:
                    ""
            },

            navigation: {
                includeInNavigation:
                    false,

                label:
                    "",

                parentId:
                    "",

                order:
                    100,

                highlighted:
                    false,

                openInNewTab:
                    false
            }
        }
    };
}

function getCurrentDateLabel() {
    return new Date()
        .toLocaleDateString(
            "de-DE",
            {
                day:
                    "2-digit",

                month:
                    "long",

                year:
                    "numeric"
            }
        );
}

function getRepresentatives(
    setup
) {
    return normalizeMultiline(
        setup.representatives
    ) ||
    "BITTE VERTRETUNGSBERECHTIGTE PERSONEN EINTRAGEN";
}

function getServiceAddress(
    setup
) {
    return normalizeMultiline(
        setup.serviceAddress
    ) ||
    "BITTE LADUNGSFÄHIGE VEREINSANSCHRIFT EINTRAGEN";
}

function getEditorialResponsible(
    setup
) {
    return normalizeText(
        setup.editorialResponsible
    ) ||
    "BITTE VERANTWORTLICHE PERSON EINTRAGEN";
}

function getEditorialAddress(
    setup
) {
    return normalizeMultiline(
        setup.editorialAddress
    ) ||
    getServiceAddress(
        setup
    );
}

function getHostingProvider(
    setup
) {
    return normalizeText(
        setup.hostingProvider
    ) ||
    "BITTE ENDGÜLTIGEN HOSTINGANBIETER EINTRAGEN";
}

function getHostingAddress(
    setup
) {
    return normalizeMultiline(
        setup.hostingAddress
    ) ||
    "BITTE ANSCHRIFT DES HOSTINGANBIETERS EINTRAGEN";
}

export function normalizeLegalSetup(
    value = {}
) {
    return {
        ...DEFAULT_LEGAL_SETUP,

        ...(value &&
        typeof value ===
            "object" &&
        !Array.isArray(
            value
        )
            ? value
            : {})
    };
}

export function validateLegalSetup(
    setupValue
) {
    const setup =
        normalizeLegalSetup(
            setupValue
        );

    const missing = [];

    if (
        !normalizeText(
            setup.organizationName
        )
    ) {
        missing.push(
            "Vereinsname"
        );
    }

    if (
        !normalizeText(
            setup.serviceAddress
        )
    ) {
        missing.push(
            "ladungsfähige Vereinsanschrift"
        );
    }

    if (
        !normalizeText(
            setup.representatives
        )
    ) {
        missing.push(
            "vertretungsberechtigte Personen"
        );
    }

    if (
        !normalizeText(
            setup.email
        )
    ) {
        missing.push(
            "Kontakt-E-Mail"
        );
    }

    if (
        !normalizeText(
            setup.editorialResponsible
        )
    ) {
        missing.push(
            "verantwortliche Person nach § 18 Abs. 2 MStV"
        );
    }

    if (
        !normalizeText(
            setup.hostingProvider
        )
    ) {
        missing.push(
            "Hostinganbieter"
        );
    }

    if (
        !normalizeText(
            setup.hostingAddress
        )
    ) {
        missing.push(
            "Anschrift des Hostinganbieters"
        );
    }

    return {
        complete:
            missing.length ===
            0,

        missing
    };
}

export function createImprintPageTemplate(
    setupValue
) {
    const setup =
        normalizeLegalSetup(
            setupValue
        );

    const validation =
        validateLegalSetup(
            setup
        );

    const organizationName =
        normalizeText(
            setup.organizationName,
            DEFAULT_LEGAL_SETUP
                .organizationName
        );

    const organizationType =
        normalizeText(
            setup.organizationType,
            DEFAULT_LEGAL_SETUP
                .organizationType
        );

    const email =
        normalizeText(
            setup.email,
            DEFAULT_LEGAL_SETUP
                .email
        );

    const website =
        normalizeText(
            setup.website,
            DEFAULT_LEGAL_SETUP
                .website
        );

    return {
        title:
            "Impressum",

        slug:
            "impressum",

        template:
            "blank",

        status:
            "draft",

        blocks: [
            createLegalBlock({
                documentType:
                    "imprint",

                title:
                    "Impressum",

                intro:
                    "Anbieterkennzeichnung für das Internetangebot von BluePulse Tierschutz.",

                draftWarning:
                    validation.complete
                        ? ""
                        : "ENTWURF – Vor der Veröffentlichung müssen alle markierten Pflichtangaben geprüft und ergänzt werden.",

                lastUpdated:
                    getCurrentDateLabel(),

                sections: [
                    createSection({
                        title:
                            "Angaben zum Anbieter",

                        paragraphs: [
                            `${organizationName}\n${organizationType}`,
                            getServiceAddress(
                                setup
                            )
                        ]
                    }),

                    createSection({
                        title:
                            "Vertretung",

                        paragraphs: [
                            "Vertreten durch:",
                            getRepresentatives(
                                setup
                            )
                        ]
                    }),

                    createSection({
                        title:
                            "Kontakt",

                        paragraphs: [
                            `E-Mail: ${email}`,
                            `Website: ${website}`
                        ]
                    }),

                    createSection({
                        title:
                            "Vereinsstatus",

                        paragraphs: [
                            "BluePulse Tierschutz ist ein nicht in das Vereinsregister eingetragener Verein (n.e.V.).",
                            "Der Verein verfolgt gemeinnützige Zwecke zur Förderung des Tierschutzes."
                        ]
                    }),

                    createSection({
                        title:
                            "Verantwortlich für journalistisch-redaktionelle Inhalte",

                        paragraphs: [
                            "Verantwortlich gemäß § 18 Abs. 2 Medienstaatsvertrag:",
                            getEditorialResponsible(
                                setup
                            ),
                            getEditorialAddress(
                                setup
                            )
                        ],

                        note:
                            "Diese Angabe ist insbesondere bei regelmäßig veröffentlichten redaktionellen Text- und Bildinhalten zu prüfen."
                    }),

                    createSection({
                        title:
                            "Rechtsgrundlagen",

                        paragraphs: [
                            "Die Anbieterkennzeichnung erfolgt insbesondere nach § 5 Digitale-Dienste-Gesetz und § 18 Medienstaatsvertrag."
                        ]
                    })
                ]
            })
        ],

        theme:
            createPageTheme({
                title:
                    "Impressum | BluePulse Tierschutz",

                description:
                    "Impressum und Anbieterkennzeichnung von BluePulse Tierschutz n.e.V.",

                canonicalUrl:
                    "/impressum",

                indexable:
                    validation.complete
            })
    };
}

export function createPrivacyPageTemplate(
    setupValue
) {
    const setup =
        normalizeLegalSetup(
            setupValue
        );

    const validation =
        validateLegalSetup(
            setup
        );

    const organizationName =
        normalizeText(
            setup.organizationName,
            DEFAULT_LEGAL_SETUP
                .organizationName
        );

    const email =
        normalizeText(
            setup.email,
            DEFAULT_LEGAL_SETUP
                .email
        );

    const supervisoryAuthority =
        normalizeText(
            setup.supervisoryAuthority,
            DEFAULT_LEGAL_SETUP
                .supervisoryAuthority
        );

    const supervisoryEmail =
        normalizeText(
            setup.supervisoryEmail,
            DEFAULT_LEGAL_SETUP
                .supervisoryEmail
        );

    return {
        title:
            "Datenschutzerklärung",

        slug:
            "datenschutz",

        template:
            "blank",

        status:
            "draft",

        blocks: [
            createLegalBlock({
                documentType:
                    "privacy",

                title:
                    "Datenschutzerklärung",

                intro:
                    "Diese Datenschutzerklärung informiert darüber, wie personenbezogene Daten beim Besuch der BluePulse-Website und bei der Nutzung des Kontaktformulars verarbeitet werden.",

                draftWarning:
                    validation.complete
                        ? ""
                        : "ENTWURF – Hostinganbieter, ladungsfähige Anschrift und weitere markierte Angaben müssen vor der Veröffentlichung ergänzt und geprüft werden.",

                lastUpdated:
                    getCurrentDateLabel(),

                sections: [
                    createSection({
                        title:
                            "1. Verantwortliche Stelle",

                        paragraphs: [
                            organizationName,
                            getServiceAddress(
                                setup
                            ),
                            `Vertreten durch:\n${getRepresentatives(
                                setup
                            )}`,
                            `E-Mail: ${email}`
                        ]
                    }),

                    createSection({
                        title:
                            "2. Hosting und Server-Protokolle",

                        paragraphs: [
                            `Hostinganbieter:\n${getHostingProvider(
                                setup
                            )}\n${getHostingAddress(
                                setup
                            )}`,
                            "Beim Aufruf der Website können technisch erforderliche Server-Protokolldaten verarbeitet werden. Dazu können insbesondere IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Adresse, übertragene Datenmenge, Referrer, Browsertyp, Betriebssystem und Zugriffsstatus gehören.",
                            "Die Verarbeitung erfolgt zur sicheren, stabilen und fehlerfreien Bereitstellung der Website sowie zur Erkennung und Abwehr von Missbrauch. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse liegt im sicheren Betrieb des Internetangebots.",
                            "Protokolldaten werden nur so lange gespeichert, wie dies für Betrieb, Fehleranalyse und Sicherheit erforderlich ist, und anschließend gelöscht, sofern keine gesetzliche Aufbewahrung oder konkrete Sicherheitsprüfung entgegensteht."
                        ]
                    }),

                    createSection({
                        title:
                            "3. Kontaktformular",

                        paragraphs: [
                            "Bei Nutzung des Kontaktformulars werden die eingegebenen Angaben verarbeitet. Dazu gehören Name, E-Mail-Adresse, Betreff, Nachricht, Einwilligungsstatus, Zeitpunkt, aufgerufener Quellpfad und technische Angaben zum verwendeten Browser.",
                            "Die Anfrage wird in der BluePulse-Nexus-Datenbank gespeichert. Die rohe IP-Adresse wird nicht als Klartext in der Kontaktanfrage gespeichert; zur Missbrauchs- und Duplikaterkennung wird ein technisch abgeleiteter Hashwert verwendet.",
                            "Zweck der Verarbeitung ist die Entgegennahme, Zuordnung und Beantwortung der Anfrage sowie die Verhinderung missbräuchlicher Einsendungen.",
                            "Soweit eine Einwilligung erteilt wird, ist Art. 6 Abs. 1 lit. a DSGVO die Rechtsgrundlage. Bei vorvertraglichen oder mitgliedschaftsbezogenen Anfragen kann zusätzlich Art. 6 Abs. 1 lit. b DSGVO einschlägig sein. Für Sicherheits- und Missbrauchsschutzmaßnahmen ist Art. 6 Abs. 1 lit. f DSGVO maßgeblich.",
                            "Kontaktanfragen werden gelöscht, sobald sie für die Bearbeitung und Dokumentation nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten oder berechtigten Nachweisinteressen entgegenstehen."
                        ]
                    }),

                    createSection({
                        title:
                            "4. E-Mail-Benachrichtigung über Gmail",

                        paragraphs: [
                            "Neue Kontaktanfragen werden zusätzlich per SMTP an das Vereins-E-Mail-Postfach übermittelt. Dabei werden Name, E-Mail-Adresse, Betreff, Nachricht und die interne BluePulse-Referenz an den E-Mail-Dienst übertragen.",
                            "E-Mail-Dienstanbieter ist Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland.",
                            "Die Verarbeitung dient der zeitnahen Kenntnisnahme und Bearbeitung eingehender Anfragen. Es kann nicht ausgeschlossen werden, dass Daten innerhalb des Google-Unternehmensverbunds auch außerhalb der Europäischen Union verarbeitet werden. Vor dem produktiven Start sind die für das konkret verwendete Google-Konto geltenden Vertrags- und Datenschutzbedingungen zu prüfen."
                        ]
                    }),

                    createSection({
                        title:
                            "5. Cookies und Browser-Speicher",

                        paragraphs: [
                            "Die öffentliche Website setzt derzeit keine Analyse-, Werbe- oder Marketing-Cookies ein.",
                            "Im geschützten BluePulse-Nexus-Verwaltungsbereich wird ein technisch erforderliches Sitzungs-Cookie verwendet, um angemeldete Benutzer zu authentifizieren und den Administrationsbereich zu schützen. Dieses Cookie ist nicht für öffentliche Websitebesucher erforderlich.",
                            "Im Browser können außerdem technisch erforderliche lokale Einstellungen des CMS gespeichert werden. Diese Daten dienen ausschließlich der Bedienung des Verwaltungsbereichs."
                        ]
                    }),

                    createSection({
                        title:
                            "6. Externe Inhalte und Schriftarten",

                        paragraphs: [
                            "Die Website lädt keine Google-Schriftarten von externen Google-Servern. Es werden lokale beziehungsweise auf dem Endgerät vorhandene Systemschriftarten verwendet.",
                            "Externe Links öffnen fremde Internetangebote. Für die Datenverarbeitung auf diesen Zielseiten gelten die Datenschutzhinweise der jeweiligen Anbieter."
                        ]
                    }),

                    createSection({
                        title:
                            "7. Empfänger und Auftragsverarbeitung",

                        paragraphs: [
                            "Personenbezogene Daten erhalten nur diejenigen Vereinsmitglieder oder beauftragten Personen, die sie zur Bearbeitung der jeweiligen Anfrage benötigen.",
                            "Technische Dienstleister für Hosting, E-Mail und Infrastruktur können Daten im Rahmen der Leistungserbringung verarbeiten. Soweit erforderlich, werden Verträge zur Auftragsverarbeitung nach Art. 28 DSGVO abgeschlossen."
                        ]
                    }),

                    createSection({
                        title:
                            "8. Speicherdauer",

                        paragraphs: [
                            "Personenbezogene Daten werden nur so lange gespeichert, wie es für den jeweiligen Zweck erforderlich ist. Danach werden sie gelöscht oder anonymisiert, sofern keine gesetzlichen Aufbewahrungspflichten, laufenden Verfahren oder berechtigten Nachweisinteressen entgegenstehen.",
                            "Die gespeicherten Kontaktanfragen werden regelmäßig auf ihre weitere Erforderlichkeit geprüft."
                        ]
                    }),

                    createSection({
                        title:
                            "9. Rechte betroffener Personen",

                        paragraphs: [
                            "Betroffene Personen haben im Rahmen der gesetzlichen Voraussetzungen insbesondere folgende Rechte:"
                        ],

                        items: [
                            "Auskunft über die verarbeiteten personenbezogenen Daten",
                            "Berichtigung unrichtiger oder unvollständiger Daten",
                            "Löschung personenbezogener Daten",
                            "Einschränkung der Verarbeitung",
                            "Datenübertragbarkeit",
                            "Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen",
                            "Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft"
                        ],

                        note:
                            `Zur Ausübung der Rechte genügt eine Nachricht an ${email}.`
                    }),

                    createSection({
                        title:
                            "10. Beschwerderecht",

                        paragraphs: [
                            "Betroffene Personen haben das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren.",
                            `${supervisoryAuthority}\nE-Mail: ${supervisoryEmail}`
                        ]
                    }),

                    createSection({
                        title:
                            "11. Aktualisierung dieser Erklärung",

                        paragraphs: [
                            "Diese Datenschutzerklärung wird angepasst, wenn sich eingesetzte Dienste, technische Abläufe oder rechtliche Anforderungen ändern."
                        ]
                    })
                ]
            })
        ],

        theme:
            createPageTheme({
                title:
                    "Datenschutz | BluePulse Tierschutz",

                description:
                    "Datenschutzerklärung der Website von BluePulse Tierschutz n.e.V.",

                canonicalUrl:
                    "/datenschutz",

                indexable:
                    validation.complete
            })
    };
}
