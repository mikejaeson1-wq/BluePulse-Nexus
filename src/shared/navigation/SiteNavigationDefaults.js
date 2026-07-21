const siteNavigationDefaults = {
    items: [
        {
            id: "start",
            label: "Start",
            href: "/#start",
            enabled: true,
            target: "_self",
            order: 10,
            parentId: null,
            source: "section",
            sourceId: "start",
            removable: false
        },
        {
            id: "ueber-uns",
            label: "Über uns",
            href: "/#ueber-uns",
            enabled: true,
            target: "_self",
            order: 20,
            parentId: null,
            source: "section",
            sourceId: "ueber-uns",
            removable: false
        },
        {
            id: "projekte",
            label: "Projekte",
            href: "/#projekte",
            enabled: true,
            target: "_self",
            order: 30,
            parentId: null,
            source: "section",
            sourceId: "projekte",
            removable: false
        },
        {
            id: "mitmachen",
            label: "Mitmachen",
            href: "/#mitmachen",
            enabled: true,
            target: "_self",
            order: 40,
            parentId: null,
            source: "section",
            sourceId: "mitmachen",
            removable: false
        },
        {
            id: "wirkung",
            label: "Wirkung",
            href: "/#wirkung",
            enabled: false,
            target: "_self",
            order: 50,
            parentId: null,
            source: "section",
            sourceId: "wirkung",
            removable: false
        },
        {
            id: "kontakt",
            label: "Kontakt",
            href: "/#kontakt",
            enabled: true,
            target: "_self",
            order: 60,
            parentId: null,
            source: "section",
            sourceId: "kontakt",
            removable: false
        }
    ],

    cta: {
        id: "spenden",
        label: "Spenden",
        href: "/#spenden",
        enabled: true,
        target: "_self"
    }
};

export default siteNavigationDefaults;