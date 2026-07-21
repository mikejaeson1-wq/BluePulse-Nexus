function createId(prefix) {
    if (globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
    }

    return `${prefix}-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
}

const siteContentSchemas = {
    hero: {
        title: "Startbereich",

        fields: [
            {
                key: "subtitle",
                label: "Untertitel",
                type: "text"
            },
            {
                key: "titleLine1",
                label: "Überschrift – Zeile 1",
                type: "text",
                width: 6
            },
            {
                key: "titleLine2",
                label: "Überschrift – Zeile 2",
                type: "text",
                width: 6
            },
            {
                key: "description",
                label: "Beschreibung",
                type: "textarea",
                rows: 5
            },
            {
                key: "primaryButtonLabel",
                label: "Primärer Button",
                type: "text",
                width: 6
            },
            {
                key: "primaryButtonHref",
                label: "Ziel des primären Buttons",
                type: "text",
                width: 6
            },
            {
                key: "secondaryButtonLabel",
                label: "Sekundärer Button",
                type: "text",
                width: 6
            },
            {
                key: "secondaryButtonHref",
                label: "Ziel des sekundären Buttons",
                type: "text",
                width: 6
            }
        ],

        collections: []
    },

    mission: {
        title: "Mission",

        fields: [
            {
                key: "eyebrow",
                label: "Bereichsbezeichnung",
                type: "text"
            },
            {
                key: "title",
                label: "Überschrift",
                type: "text"
            }
        ],

        collections: [
            {
                key: "items",
                label: "Missionsbereiche",
                itemLabel: "Missionsbereich",
                addLabel: "+ Missionsbereich",
                minItems: 1,

                createItem() {
                    return {
                        id: createId("mission"),
                        icon: "bi-heart",
                        title: "Neuer Bereich",
                        text: ""
                    };
                },

                fields: [
                    {
                        key: "icon",
                        label: "Icon-Klasse",
                        type: "text",
                        width: 4
                    },
                    {
                        key: "title",
                        label: "Titel",
                        type: "text",
                        width: 8
                    },
                    {
                        key: "text",
                        label: "Beschreibung",
                        type: "textarea",
                        rows: 4
                    }
                ]
            }
        ]
    },

    projects: {
        title: "Projekte",

        fields: [
            {
                key: "eyebrow",
                label: "Bereichsbezeichnung",
                type: "text"
            },
            {
                key: "title",
                label: "Überschrift",
                type: "text"
            },
            {
                key: "description",
                label: "Einleitung",
                type: "textarea",
                rows: 4
            }
        ],

        collections: [
            {
                key: "items",
                label: "Projektkarten",
                itemLabel: "Projekt",
                addLabel: "+ Projekt",
                minItems: 1,

                createItem() {
                    return {
                        id: createId("project"),
                        icon: "bi-heart",
                        title: "Neues Projekt",
                        text: "",
                        status: "In Planung",
                        linkLabel: "",
                        href: ""
                    };
                },

                fields: [
                    {
                        key: "icon",
                        label: "Icon-Klasse",
                        type: "text",
                        width: 4
                    },
                    {
                        key: "title",
                        label: "Titel",
                        type: "text",
                        width: 8
                    },
                    {
                        key: "text",
                        label: "Beschreibung",
                        type: "textarea",
                        rows: 4
                    },
                    {
                        key: "status",
                        label: "Status",
                        type: "text",
                        width: 4
                    },
                    {
                        key: "linkLabel",
                        label: "Link-Bezeichnung",
                        type: "text",
                        width: 4
                    },
                    {
                        key: "href",
                        label: "Link-Ziel",
                        type: "text",
                        width: 4
                    }
                ]
            }
        ]
    },

    participation: {
        title: "Mitmachen",

        fields: [
            {
                key: "eyebrow",
                label: "Bereichsbezeichnung",
                type: "text"
            },
            {
                key: "title",
                label: "Überschrift",
                type: "text"
            },
            {
                key: "description",
                label: "Einleitung",
                type: "textarea",
                rows: 4
            }
        ],

        collections: [
            {
                key: "items",
                label: "Möglichkeiten zum Mitmachen",
                itemLabel: "Mitmach-Möglichkeit",
                addLabel: "+ Möglichkeit",
                minItems: 1,

                createItem() {
                    return {
                        id: createId("participation"),
                        icon: "bi-heart",
                        title: "Neue Möglichkeit",
                        text: "",
                        buttonLabel: "",
                        href: ""
                    };
                },

                fields: [
                    {
                        key: "icon",
                        label: "Icon-Klasse",
                        type: "text",
                        width: 4
                    },
                    {
                        key: "title",
                        label: "Titel",
                        type: "text",
                        width: 8
                    },
                    {
                        key: "text",
                        label: "Beschreibung",
                        type: "textarea",
                        rows: 4
                    },
                    {
                        key: "buttonLabel",
                        label: "Button-Bezeichnung",
                        type: "text",
                        width: 6
                    },
                    {
                        key: "href",
                        label: "Button-Ziel",
                        type: "text",
                        width: 6
                    }
                ]
            }
        ]
    },

    impact: {
        title: "Unsere Wirkung",

        fields: [
            {
                key: "eyebrow",
                label: "Bereichsbezeichnung",
                type: "text"
            },
            {
                key: "title",
                label: "Überschrift",
                type: "text"
            }
        ],

        collections: [
            {
                key: "items",
                label: "Kennzahlen",
                itemLabel: "Kennzahl",
                addLabel: "+ Kennzahl",
                minItems: 1,

                createItem() {
                    return {
                        id: createId("impact"),
                        value: 0,
                        suffix: "",
                        label: "Neue Kennzahl"
                    };
                },

                fields: [
                    {
                        key: "value",
                        label: "Wert",
                        type: "number",
                        width: 3
                    },
                    {
                        key: "suffix",
                        label: "Zusatz",
                        type: "text",
                        width: 3
                    },
                    {
                        key: "label",
                        label: "Bezeichnung",
                        type: "text",
                        width: 6
                    }
                ]
            }
        ]
    },

    donations: {
        title: "Spenden",

        fields: [
            {
                key: "eyebrow",
                label: "Bereichsbezeichnung",
                type: "text"
            },
            {
                key: "title",
                label: "Überschrift",
                type: "text"
            },
            {
                key: "description",
                label: "Einleitung",
                type: "textarea",
                rows: 4
            },
            {
                key: "goalTitle",
                label: "Titel des Spendenziels",
                type: "text"
            },
            {
                key: "goalDescription",
                label: "Beschreibung des Spendenziels",
                type: "textarea",
                rows: 3
            },
            {
                key: "currentAmount",
                label: "Aktueller Betrag",
                type: "number",
                width: 4
            },
            {
                key: "targetAmount",
                label: "Zielbetrag",
                type: "number",
                width: 4
            },
            {
                key: "currency",
                label: "Währung",
                type: "text",
                width: 4
            },
            {
                key: "transparencyTitle",
                label: "Transparenz-Überschrift",
                type: "text"
            },
            {
                key: "transparencyText",
                label: "Transparenz-Hinweis",
                type: "textarea",
                rows: 4
            }
        ],

        collections: [
            {
                key: "methods",
                label: "Spendenmöglichkeiten",
                itemLabel: "Spendenmöglichkeit",
                addLabel: "+ Spendenmöglichkeit",
                minItems: 1,

                createItem() {
                    return {
                        id: createId("donation"),
                        icon: "bi-heart",
                        title: "Neue Spendenmöglichkeit",
                        text: "",
                        badge: "",
                        buttonLabel: "",
                        href: ""
                    };
                },

                fields: [
                    {
                        key: "icon",
                        label: "Icon-Klasse",
                        type: "text",
                        width: 4
                    },
                    {
                        key: "title",
                        label: "Titel",
                        type: "text",
                        width: 8
                    },
                    {
                        key: "text",
                        label: "Beschreibung",
                        type: "textarea",
                        rows: 4
                    },
                    {
                        key: "badge",
                        label: "Hinweis / Badge",
                        type: "text",
                        width: 4
                    },
                    {
                        key: "buttonLabel",
                        label: "Button-Bezeichnung",
                        type: "text",
                        width: 4
                    },
                    {
                        key: "href",
                        label: "Button-Ziel",
                        type: "text",
                        width: 4
                    }
                ]
            }
        ]
    },

    contact: {
        title: "Kontakt",

        fields: [
            {
                key: "eyebrow",
                label: "Bereichsbezeichnung",
                type: "text"
            },
            {
                key: "title",
                label: "Überschrift",
                type: "text"
            },
            {
                key: "description",
                label: "Einleitung",
                type: "textarea",
                rows: 4
            },
            {
                key: "email",
                label: "Empfänger-E-Mail",
                type: "text"
            },
            {
                key: "formTitle",
                label: "Formular-Überschrift",
                type: "text",
                width: 6
            },
            {
                key: "submitLabel",
                label: "Button-Bezeichnung",
                type: "text",
                width: 6
            },
            {
                key: "formDescription",
                label: "Formular-Beschreibung",
                type: "textarea",
                rows: 3
            },
            {
                key: "privacyText",
                label: "Datenschutz-Hinweis",
                type: "textarea",
                rows: 3
            }
        ],

        collections: [
            {
                key: "channels",
                label: "Kontaktmöglichkeiten",
                itemLabel: "Kontaktmöglichkeit",
                addLabel: "+ Kontaktmöglichkeit",
                minItems: 1,

                createItem() {
                    return {
                        id: createId("contact"),
                        icon: "bi-envelope",
                        title: "Neue Kontaktmöglichkeit",
                        value: "",
                        href: ""
                    };
                },

                fields: [
                    {
                        key: "icon",
                        label: "Icon-Klasse",
                        type: "text",
                        width: 4
                    },
                    {
                        key: "title",
                        label: "Titel",
                        type: "text",
                        width: 8
                    },
                    {
                        key: "value",
                        label: "Angezeigter Wert",
                        type: "text",
                        width: 6
                    },
                    {
                        key: "href",
                        label: "Link-Ziel",
                        type: "text",
                        width: 6
                    }
                ]
            }
        ]
    }
};

export function getSiteContentSchema(contentKey) {
    return siteContentSchemas[contentKey] ?? null;
}

export default siteContentSchemas;