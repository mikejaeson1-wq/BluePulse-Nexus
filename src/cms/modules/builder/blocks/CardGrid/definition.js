import CardGrid from "./CardGrid";
import CardGridProperties from "./Properties";

export default {
    type:
        "card-grid",

    name:
        "Kartenraster",

    description:
        "Responsives Raster aus frei bearbeitbaren Informations- und Linkkarten.",

    icon:
        "bi-grid-3x3-gap",

    category:
        "Inhalt",

    keywords: [
        "karten",
        "cards",
        "raster",
        "grid",
        "leistungen",
        "themen",
        "projekte",
        "angebote",
        "bereiche"
    ],

    order:
        30,

    version:
        1,

    component:
        CardGrid,

    properties:
        CardGridProperties,

    defaultData: {
        eyebrow:
            "Unsere Schwerpunkte",

        title:
            "Gemeinsam für Tiere und Natur",

        intro:
            "Entdecke die Bereiche, in denen BluePulse aktiv ist.",

        columns:
            3,

        alignment:
            "left",

        variant:
            "elevated",

        showImages:
            true,

        showIcons:
            true,

        backgroundColor:
            "#0b1220",

        cardBackgroundColor:
            "#111c2f",

        accentColor:
            "#38bdf8",

        textColor:
            "#f8fafc",

        cards: [
            {
                id:
                    "card-animal-welfare",

                icon:
                    "bi-heart-pulse",

                imageSrc:
                    "",

                imageAlt:
                    "",

                title:
                    "Tierschutz",

                text:
                    "Wir setzen uns für den Schutz, die Würde und das Wohlergehen aller Tiere ein.",

                linkText:
                    "Mehr erfahren",

                linkHref:
                    "/tierschutz",

                openInNewTab:
                    false
            },

            {
                id:
                    "card-nature",

                icon:
                    "bi-tree",

                imageSrc:
                    "",

                imageAlt:
                    "",

                title:
                    "Natur und Umwelt",

                text:
                    "Wir verbinden Tier-, Natur- und Umweltschutz zu einem gemeinsamen Engagement.",

                linkText:
                    "Unsere Projekte",

                linkHref:
                    "/projekte",

                openInNewTab:
                    false
            },

            {
                id:
                    "card-community",

                icon:
                    "bi-people",

                imageSrc:
                    "",

                imageAlt:
                    "",

                title:
                    "Gemeinschaft",

                text:
                    "Gemeinsam schaffen wir Aufmerksamkeit, Wissen und konkrete Unterstützung.",

                linkText:
                    "Jetzt mitmachen",

                linkHref:
                    "/mitmachen",

                openInNewTab:
                    false
            }
        ]
    }
};