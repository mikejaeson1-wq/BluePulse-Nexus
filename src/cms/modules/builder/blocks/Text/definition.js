import Text from "./Text";
import TextProperties from "./Properties";

export default {
    type:
        "text",

    name:
        "Text",

    description:
        "Überschrift mit einem frei bearbeitbaren Textabschnitt.",

    icon:
        "bi-fonts",

    category:
        "Inhalt",

    keywords: [
        "text",
        "absatz",
        "überschrift",
        "inhalt",
        "beschreibung"
    ],

    order:
        10,

    version:
        1,

    component:
        Text,

    properties:
        TextProperties,

    defaultData: {
        title:
            "Überschrift",

        text:
            "Lorem ipsum dolor sit amet..."
    }
};