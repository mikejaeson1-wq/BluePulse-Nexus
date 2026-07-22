import Image from "./Image";
import ImageProperties from "./Properties";

export default {
    type:
        "image",

    name:
        "Bild",

    description:
        "Ein einzelnes Bild mit Alternativtext für barrierefreie Seiten.",

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
        "alt"
    ],

    order:
        10,

    version:
        1,

    component:
        Image,

    properties:
        ImageProperties,

    defaultData: {
        src:
            "https://placehold.co/900x500",

        alt:
            "Bild"
    }
};