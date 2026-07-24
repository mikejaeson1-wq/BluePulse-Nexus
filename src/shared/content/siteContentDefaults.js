const siteContentDefaults = {
    hero: {
        subtitle: "GEMEINNÜTZIGER TIERSCHUTZVEREIN",
        titleLine1: "Every Life",
        titleLine2: "Matters",
        description:
            "Gemeinsam schützen wir Tiere, Meere und Natur. Jede Stimme zählt. Jede Spende hilft. Jedes Leben ist wertvoll.",
        primaryButtonLabel: "Mitglied werden",
        primaryButtonHref: "/#mitmachen",
        secondaryButtonLabel: "Mehr erfahren",
        secondaryButtonHref: "/#ueber-uns"
    },

    mission: {
        eyebrow: "UNSERE MISSION",
        title: "Gemeinsam verändern wir die Welt.",

        items: [
            {
                id: "meeresschutz",
                icon: "bi-water",
                title: "Meeresschutz",
                text:
                    "Schutz mariner Lebensräume und ihrer Bewohner durch Aufklärung, Projekte und aktives Engagement."
            },
            {
                id: "tierschutz",
                icon: "bi-heart-pulse",
                title: "Tierschutz",
                text:
                    "Wir setzen uns für Haus-, Wild- und Nutztiere ein und fördern einen respektvollen Umgang mit allen Lebewesen."
            },
            {
                id: "naturschutz",
                icon: "bi-tree",
                title: "Naturschutz",
                text:
                    "Erhalt natürlicher Lebensräume, Schutz der Artenvielfalt und nachhaltige Projekte für kommende Generationen."
            }
        ]
    },

    projects: {
        eyebrow: "UNSERE PROJEKTE",
        title: "Aus Haltung wird Handlung.",
        description:
            "Unsere Projekte verbinden praktische Hilfe, Aufklärung und nachhaltigen Tier- und Naturschutz.",

        items: [
            {
                id: "cleanup",
                icon: "bi-recycle",
                title: "CleanUp-Aktionen",
                text:
                    "Gemeinsame Aktionen zur Beseitigung von Müll und zum Schutz natürlicher Lebensräume.",
                status: "In Vorbereitung",
                linkLabel: "",
                href: ""
            },
            {
                id: "aufklaerung",
                icon: "bi-megaphone",
                title: "Aufklärung und Kampagnen",
                text:
                    "Wir informieren über Tierleid, Umweltprobleme und Möglichkeiten für nachhaltiges Engagement.",
                status: "Laufend",
                linkLabel: "",
                href: ""
            },
            {
                id: "netzwerk",
                icon: "bi-people",
                title: "Netzwerk und Kooperationen",
                text:
                    "Wir bauen ein Netzwerk mit Tierheimen, Auffangstationen und anderen Organisationen auf.",
                status: "Im Aufbau",
                linkLabel: "",
                href: ""
            }
        ]
    },

    participation: {
        eyebrow: "MITMACHEN",
        title: "Gemeinsam können wir mehr bewegen.",
        description:
            "BluePulse lebt von Menschen, die ihre Ideen, ihre Zeit und ihre Stimme für Tiere, Natur und Umwelt einsetzen.",

        items: [
            {
                id: "mitglied",
                icon: "bi-person-plus",
                title: "Mitglied werden",
                text:
                    "Werde Teil von BluePulse, bringe deine Ideen ein und gestalte unsere zukünftigen Aktionen und Projekte mit.",
                buttonLabel: "",
                href: ""
            },
            {
                id: "online",
                icon: "bi-share",
                title: "Online unterstützen",
                text:
                    "Hilf uns bei Aufklärung, Social Media, Recherche, Grafiken oder der Verbreitung unserer Kampagnen.",
                buttonLabel: "",
                href: ""
            },
            {
                id: "aktionen",
                icon: "bi-people-fill",
                title: "Bei Aktionen helfen",
                text:
                    "Begleite uns zu Demonstrationen, CleanUps, Informationsständen und anderen gemeinsamen Aktionen.",
                buttonLabel: "",
                href: ""
            }
        ]
    },

    impact: {
        eyebrow: "UNSERE WIRKUNG",
        title: "Gemeinsam bewegen wir mehr.",

        items: [
            {
                id: "mitglieder",
                value: 0,
                suffix: "",
                label: "Mitglieder"
            },
            {
                id: "projekte",
                value: 0,
                suffix: "",
                label: "Projekte"
            },
            {
                id: "spenden",
                value: 0,
                suffix: "€",
                label: "Spenden"
            },
            {
                id: "leidenschaft",
                value: 100,
                suffix: "%",
                label: "Leidenschaft"
            }
        ]
    },

    donations: {
        eyebrow: "SPENDEN",
        title: "Deine Hilfe kommt an.",
        description:
            "Mit deiner Unterstützung können wir Aktionen vorbereiten, Informationsmaterial erstellen und konkrete Tier- und Naturschutzprojekte ermöglichen.",

        goalTitle: "Unser aktuelles Spendenziel",
        goalDescription:
            "Hilf uns dabei, unsere ersten Aktionen und Projekte zuverlässig zu finanzieren.",
        currentAmount: 0,
        targetAmount: 1000,
        currency: "€",

        transparencyTitle: "Transparenz ist uns wichtig",
        transparencyText:
            "Spenden werden ausschließlich für die gemeinnützigen Zwecke und Projekte von BluePulse Tierschutz eingesetzt. Über Einnahmen und Ausgaben informieren wir nachvollziehbar.",

        methods: [
            {
                id: "paypal",
                icon: "bi-paypal",
                title: "PayPal",
                text:
                    "Unterstütze BluePulse schnell und unkompliziert über PayPal.",
                badge: "Schnell und einfach",
                buttonLabel: "Über PayPal spenden",
                href: ""
            },
            {
                id: "bank",
                icon: "bi-bank",
                title: "Banküberweisung",
                text:
                    "Du möchtest direkt auf unser Vereinskonto spenden? Die Bankverbindung kannst du hier hinterlegen.",
                badge: "Direkte Unterstützung",
                buttonLabel: "",
                href: ""
            },
            {
                id: "campaign",
                icon: "bi-heart-fill",
                title: "Spendenaktion",
                text:
                    "Unterstütze eine unserer aktuellen Spendenkampagnen oder teile sie mit anderen Menschen.",
                badge: "Gemeinsam mehr erreichen",
                buttonLabel: "",
                href: ""
            }
        ]
    },

    contact: {
        eyebrow: "KONTAKT",
        title: "Lass uns gemeinsam etwas bewegen.",
        description:
            "Du hast eine Frage, möchtest mitmachen, uns unterstützen oder eine Zusammenarbeit vorschlagen? Dann melde dich bei uns.",

        email: "kontakt@blue-pulse.de",

        formTitle: "Nachricht senden",
        formDescription:
            "Fülle das Formular aus. Deine Nachricht wird sicher übermittelt und im geschützten BluePulse-Kontaktpostfach gespeichert.",
        submitLabel: "Nachricht senden",
        privacyText:
            "Deine Angaben werden zur Bearbeitung deiner Anfrage gespeichert. Weitere Informationen findest du in der Datenschutzerklärung.",

        channels: [
            {
                id: "email",
                icon: "bi-envelope",
                title: "E-Mail",
                value: "kontakt@blue-pulse.de",
                href: "mailto:kontakt@blue-pulse.de"
            },
            {
                id: "location",
                icon: "bi-geo-alt",
                title: "Standort",
                value: "Dortmund, Nordrhein-Westfalen",
                href: ""
            },
            {
                id: "discord",
                icon: "bi-discord",
                title: "Community",
                value: "Hopes Reise auf Discord",
                href: ""
            }
        ]
    }
};

export default siteContentDefaults;
