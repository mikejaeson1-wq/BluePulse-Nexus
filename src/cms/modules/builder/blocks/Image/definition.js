import {
    createDefaultImageBlockSettings
} from "@shared/media/imageBlockSettings";

import {
    createDefaultImageShapeSettings
} from "@shared/media/imageShapeSettings";

import Image from "./Image";
import ImageInspector from "./ImageInspector";

export default {
    type:
        "image",

    name:
        "Bild",

    description:
        "Ein frei skalierbares, responsives Bild mit Mediathek, Fokuspunkt und individuellen Bildformen.",

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
        "zuschneiden",
        "form",
        "kreis",
        "oval",
        "kiesel",
        "tropfen",
        "hexagon",
        "freiform"
    ],

    order:
        10,

    version:
        3,

    component:
        Image,

    properties:
        ImageInspector,

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
            createDefaultImageBlockSettings(),

        imageShapeSettings:
            createDefaultImageShapeSettings()
    }
};