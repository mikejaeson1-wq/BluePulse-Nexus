import Section from "./Section";
import SectionProperties from "./Properties";

export default {

    type:"section",

    name:"Section",

    icon:"📦",

    category:"Layout",

    version:1,

    component:Section,

    properties:SectionProperties,

    defaultData:{

        title:"Neue Section",

        background:"#1b2335",

        maxWidth:"1200px",

        paddingTop:"80px",

        paddingBottom:"80px"

    }

};