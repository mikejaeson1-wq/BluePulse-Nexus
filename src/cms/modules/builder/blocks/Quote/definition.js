import Quote from "./Quote";
import QuoteProperties from "./Properties";

export default {
    type:
        "quote",

    name:
        "Zitat",

    description:
        "Hervorgehobenes Zitat mit Name, Funktion und optionaler Quelle.",

    icon:
        "bi-quote",

    category:
        "Inhalt",

    keywords: [
        "zitat",
        "quote",
        "aussage",
        "testimonial",
        "stimme",
        "person"
    ],

    order:
        20,

    version:
        1,

    component:
        Quote,

    properties:
        QuoteProperties,

    defaultData: {
        quote:
            "Jedes Leben zählt – unabhängig davon, wie groß oder klein es ist.",

        author:
            "BluePulse Tierschutz",

        role:
            "Every Life Matters",

        sourceUrl:
            "",

        alignment:
            "left",

        variant:
            "card",

        backgroundColor:
            "#111c2f",

        accentColor:
            "#38bdf8",

        textColor:
            "#f8fafc"
    }
};