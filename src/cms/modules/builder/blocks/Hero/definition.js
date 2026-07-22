import Hero from "./Hero";
import HeroProperties from "./Properties";

export default {
    type:
        "hero",

    name:
        "Hero",

    description:
        "Großer Einstiegsbereich mit Überschrift, Untertitel und Aktionsbutton.",

    icon:
        "bi-stars",

    category:
        "Layout",

    keywords: [
        "header",
        "titelbild",
        "start",
        "banner",
        "überschrift",
        "cta"
    ],

    order:
        10,

    version:
        1,

    component:
        Hero,

    properties:
        HeroProperties,

    defaultData: {
        title:
            "Neue Überschrift",

        subtitle:
            "Untertitel",

        buttonText:
            "Jetzt starten"
    }
};