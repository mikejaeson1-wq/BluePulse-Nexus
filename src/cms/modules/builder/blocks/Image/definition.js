import {
    createDefaultImageBlockSettings
} from "@shared/media/imageBlockSettings";

import Image from "./Image";
import ImageProperties from "./Properties";

export default {
    type:
        "image",

    name:
        "Bild",

    description:
        "Ein frei skalierbares und responsives Bild mit Alternativtext.",

    icon:
        "bi-image",

    category:
        "Medien",

    keywords: [
        "bild",
        "foto",
        "grafik",
        "image",
        "media",
        "alt",
        "responsive",
        "skalieren",
        "zuschneiden"
    ],

    order:
        10,

    version:
        2,

    component:
        Image,

    properties:
        ImageProperties,

    defaultData: {
        src:
            "https://placehold.co/900x500",

        alt:
            "Bild",

        caption:
            "",

        loading:
            "lazy",

        imageSettings:
            createDefaultImageBlockSettings()
    }
};