import Spacer from "./Spacer";
import SpacerProperties from "./Properties";

export default {
    type:
        "spacer",

    name:
        "Abstand",

    description:
        "Unsichtbarer responsiver Freiraum zwischen zwei Inhaltsblöcken.",

    icon:
        "bi-arrows-expand-vertical",

    category:
        "Layout",

    keywords: [
        "abstand",
        "freiraum",
        "spacer",
        "leerraum",
        "höhe",
        "responsive"
    ],

    order:
        40,

    version:
        1,

    component:
        Spacer,

    properties:
        SpacerProperties,

    defaultData: {
        desktopHeight:
            80,

        tabletHeight:
            60,

        mobileHeight:
            40
    }
};