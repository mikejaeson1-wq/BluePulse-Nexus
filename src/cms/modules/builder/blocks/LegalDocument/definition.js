import LegalDocument from "./LegalDocument";
import LegalDocumentProperties from "./Properties";

export default {
    type:
        "legal-document",

    name:
        "Rechtsdokument",

    description:
        "Strukturiertes Dokument für Impressum, Datenschutz und andere rechtliche Informationen.",

    icon:
        "bi-journal-text",

    category:
        "Inhalt",

    keywords: [
        "recht",
        "impressum",
        "datenschutz",
        "dokument",
        "paragraph"
    ],

    order:
        95,

    version:
        1,

    component:
        LegalDocument,

    properties:
        LegalDocumentProperties,

    defaultData: {
        documentType:
            "legal",

        title:
            "Rechtliche Informationen",

        intro:
            "",

        draftWarning:
            "",

        lastUpdated:
            "",

        sections:
            []
    }
};
