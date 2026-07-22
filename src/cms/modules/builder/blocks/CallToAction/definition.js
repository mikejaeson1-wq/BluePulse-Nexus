import CallToAction from "./CallToAction";
import CallToActionProperties from "./Properties";

export default {
    type:
        "call-to-action",

    name:
        "Call-to-Action",

    description:
        "Hervorgehobener Aktionsbereich mit Überschrift, Text und Button.",

    icon:
        "bi-megaphone",

    category:
        "Interaktion",

    keywords: [
        "cta",
        "button",
        "aktion",
        "spenden",
        "mitglied",
        "mitmachen",
        "aufruf"
    ],

    order:
        10,

    version:
        1,

    component:
        CallToAction,

    properties:
        CallToActionProperties,

    defaultData: {
        eyebrow:
            "Gemeinsam etwas bewegen",

        title:
            "Werde Teil von BluePulse",

        text:
            "Unterstütze unseren Einsatz für Tiere, Natur und Umwelt.",

        buttonText:
            "Jetzt mitmachen",

        buttonHref:
            "/mitmachen",

        alignment:
            "center",

        buttonVariant:
            "primary",

        openInNewTab:
            false,

        showButton:
            true,

        backgroundColor:
            "#102a43",

        accentColor:
            "#38bdf8",

        textColor:
            "#f8fafc"
    }
};