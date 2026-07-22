import Stats from "./Stats";
import StatsProperties from "./Properties";

export default {
    type:
        "stats",

    name:
        "Faktenzahlen",

    description:
        "Hervorgehobene Kennzahlen, Fakten und Erfolge in einem responsiven Raster.",

    icon:
        "bi-bar-chart-line",

    category:
        "Daten",

    keywords: [
        "zahlen",
        "fakten",
        "statistik",
        "kennzahlen",
        "erfolge",
        "impact",
        "counter",
        "daten"
    ],

    order:
        10,

    version:
        1,

    component:
        Stats,

    properties:
        StatsProperties,

    defaultData: {
        eyebrow:
            "Unser Einsatz",

        title:
            "Wirkung, die sichtbar wird",

        intro:
            "Einige Zahlen und Fakten über unsere Arbeit und unsere Gemeinschaft.",

        columns:
            4,

        alignment:
            "center",

        variant:
            "cards",

        backgroundColor:
            "#08111f",

        itemBackgroundColor:
            "#111c2f",

        accentColor:
            "#38bdf8",

        textColor:
            "#f8fafc",

        stats: [
            {
                id:
                    "stat-founded",

                icon:
                    "bi-calendar-heart",

                value:
                    "2026",

                suffix:
                    "",

                label:
                    "Gegründet",

                description:
                    "Start von BluePulse Tierschutz"
            },

            {
                id:
                    "stat-motto",

                icon:
                    "bi-heart",

                value:
                    "100",

                suffix:
                    "%",

                label:
                    "Every Life Matters",

                description:
                    "Unser Grundsatz bei jedem Einsatz"
            },

            {
                id:
                    "stat-focus",

                icon:
                    "bi-globe-europe-africa",

                value:
                    "3",

                suffix:
                    "",

                label:
                    "Schutzbereiche",

                description:
                    "Tiere, Natur und Umwelt"
            },

            {
                id:
                    "stat-community",

                icon:
                    "bi-people",

                value:
                    "1",

                suffix:
                    " Gemeinschaft",

                label:
                    "Gemeinsam stark",

                description:
                    "Jede helfende Person zählt"
            }
        ]
    }
};