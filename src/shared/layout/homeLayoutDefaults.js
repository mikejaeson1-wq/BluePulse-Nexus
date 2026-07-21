const homeLayoutDefaults = {
    items: [
        {
            id: "hero",
            sectionId: "start",
            label: "Start",
            component: "Hero",
            route: "/#start",
            enabled: true,
            required: true,
            order: 10
        },
        {
            id: "mission",
            sectionId: "ueber-uns",
            label: "Über uns",
            component: "Mission",
            route: "/#ueber-uns",
            enabled: true,
            required: false,
            order: 20
        },
        {
            id: "projects",
            sectionId: "projekte",
            label: "Projekte",
            component: "Projects",
            route: "/#projekte",
            enabled: true,
            required: false,
            order: 30
        },
        {
            id: "participation",
            sectionId: "mitmachen",
            label: "Mitmachen",
            component: "Participation",
            route: "/#mitmachen",
            enabled: true,
            required: false,
            order: 40
        },
        {
            id: "impact",
            sectionId: "wirkung",
            label: "Unsere Wirkung",
            component: "Impact",
            route: "/#wirkung",
            enabled: true,
            required: false,
            order: 50
        },
        {
            id: "donations",
            sectionId: "spenden",
            label: "Spenden",
            component: "Donations",
            route: "/#spenden",
            enabled: true,
            required: false,
            order: 60
        },
        {
            id: "contact",
            sectionId: "kontakt",
            label: "Kontakt",
            component: "Contact",
            route: "/#kontakt",
            enabled: true,
            required: false,
            order: 70
        }
    ]
};

export default homeLayoutDefaults;