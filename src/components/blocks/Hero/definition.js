import Hero from "./Hero";
import HeroProperties from "./Properties";

export default {

    type: "hero",

    name: "Hero",

    icon: "🏔",

    category: "Layout",

    version: 1,

    component: Hero,

    properties: HeroProperties,

    defaultData: {

        title: "Neue Überschrift",

        subtitle: "Untertitel",

        buttonText: "Jetzt starten"

    }

};