import {
    createDefaultColumnsBlockData
} from "@shared/layout/columnsBlockModel";

import Columns from "./Columns";
import ColumnsInspector from "./ColumnsInspector";

export default {
    type: "columns",

    name: "Spalten",

    description:
        "Responsiver Layout-Container mit zwei, drei oder vier individuell gestaltbaren Spalten.",

    icon: "bi-columns-gap",

    category: "Layout",

    keywords: [
        "spalten",
        "columns",
        "container",
        "layout",
        "grid",
        "zweispaltig",
        "dreispaltig",
        "vierspaltig",
        "responsive",
        "verschachtelt",
        "karte",
        "panel",
        "hintergrund"
    ],

    order: 15,

    version: 2,

    component:
        Columns,

    properties:
        ColumnsInspector,

    defaultData:
        createDefaultColumnsBlockData()
};