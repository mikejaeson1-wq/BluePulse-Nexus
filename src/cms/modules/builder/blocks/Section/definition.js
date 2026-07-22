import Section from "./Section";
import SectionProperties from "./Properties";

export default {
    type:
        "section",

    name:
        "Abschnitt",

    description:
        "Farbiger Inhaltsbereich mit eigener Überschrift, Breite und Innenabständen.",

    icon:
        "bi-layout-text-window",

    category:
        "Layout",

    keywords: [
        "section",
        "container",
        "bereich",
        "hintergrund",
        "abstand",
        "layout"
    ],

    order:
        20,

    version:
        1,

    component:
        Section,

    properties:
        SectionProperties,

    defaultData: {
        title:
            "Neuer Abschnitt",

        background:
            "#1b2335",

        maxWidth:
            "1200px",

        paddingTop:
            "80px",

        paddingBottom:
            "80px"
    }
};