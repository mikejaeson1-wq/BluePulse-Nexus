import Divider from "./Divider";
import DividerProperties from "./Properties";

export default {
    type:
        "divider",

    name:
        "Trenner",

    description:
        "Horizontale Trennlinie mit optionaler Beschriftung und Abständen.",

    icon:
        "bi-dash-lg",

    category:
        "Layout",

    keywords: [
        "trenner",
        "linie",
        "divider",
        "separator",
        "abschnitt",
        "abgrenzung"
    ],

    order:
        30,

    version:
        1,

    component:
        Divider,

    properties:
        DividerProperties,

    defaultData: {
        style:
            "solid",

        color:
            "#334155",

        thickness:
            1,

        width:
            100,

        spacingTop:
            36,

        spacingBottom:
            36,

        showLabel:
            false,

        label:
            "BluePulse"
    }
};