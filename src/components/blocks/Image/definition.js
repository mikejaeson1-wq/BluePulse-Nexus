import Image from "./Image";
import ImageProperties from "./Properties";

export default {

    type: "image",

    name: "Bild",

    icon: "🖼️",

    category: "Inhalt",

    version: 1,

    component: Image,

    properties: ImageProperties,

    defaultData: {

        src: "https://placehold.co/900x500",

        alt: "Bild"

    }

};