import {
    createDefaultDividerBlockData
} from "@shared/layout/dividerBlockSettings";

import Divider from "./Divider";
import DividerProperties from "./Properties";

export default {
    type: "divider",

    name: "Trenner",

    description:
        "Horizontaler oder vertikaler Trenner mit responsiven Einstellungen.",

    icon: "bi-dash-lg",

    category: "Layout",

    keywords: [
        "trenner",
        "linie",
        "divider",
        "separator",
        "abschnitt",
        "abgrenzung",
        "horizontal",
        "vertikal",
        "spaltentrenner"
    ],

    order: 30,

    version: 2,

    component:
        Divider,

    properties:
        DividerProperties,

    defaultData:
        createDefaultDividerBlockData()
};