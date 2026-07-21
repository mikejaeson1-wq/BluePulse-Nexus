export const WEBSITE_ROOT_PAGE = {
    id: "home",
    title: "Startseite",
    type: "page",
    route: "/",
    component: "Home",
    contentKey: null,
    editable: false,
    status: "active",
    navigation: false,
    cta: false,
    order: 0
};

export const WEBSITE_CATEGORIES = [
    {
        id: "start",
        title: "Start",
        type: "section",
        route: "/#start",
        component: "Hero",
        contentKey: "hero",
        editable: true,
        status: "active",
        navigation: true,
        cta: false,
        order: 10
    },
    {
        id: "ueber-uns",
        title: "Über uns",
        type: "section",
        route: "/#ueber-uns",
        component: "Mission",
        contentKey: "mission",
        editable: true,
        status: "active",
        navigation: true,
        cta: false,
        order: 20
    },
    {
        id: "projekte",
        title: "Projekte",
        type: "section",
        route: "/#projekte",
        component: "Projects",
        contentKey: "projects",
        editable: true,
        status: "active",
        navigation: true,
        cta: false,
        order: 30
    },
    {
        id: "mitmachen",
        title: "Mitmachen",
        type: "section",
        route: "/#mitmachen",
        component: "Participation",
        contentKey: "participation",
        editable: true,
        status: "active",
        navigation: true,
        cta: false,
        order: 40
    },
    {
        id: "wirkung",
        title: "Unsere Wirkung",
        type: "section",
        route: "/#wirkung",
        component: "Impact",
        contentKey: "impact",
        editable: true,
        status: "active",
        navigation: false,
        cta: false,
        order: 50
    },
    {
        id: "spenden",
        title: "Spenden",
        type: "section",
        route: "/#spenden",
        component: "Donations",
        contentKey: "donations",
        editable: true,
        status: "active",
        navigation: false,
        cta: true,
        order: 60
    },
    {
        id: "kontakt",
        title: "Kontakt",
        type: "section",
        route: "/#kontakt",
        component: "Contact",
        contentKey: "contact",
        editable: true,
        status: "active",
        navigation: true,
        cta: false,
        order: 70
    }
];

export const WEBSITE_NAVIGATION = WEBSITE_CATEGORIES
    .filter((item) => item.navigation)
    .sort(
        (firstItem, secondItem) =>
            firstItem.order - secondItem.order
    );

export const WEBSITE_CTA =
    WEBSITE_CATEGORIES.find(
        (item) => item.cta
    ) ?? null;

export const WEBSITE_STRUCTURE = [
    WEBSITE_ROOT_PAGE,
    ...WEBSITE_CATEGORIES
].sort(
    (firstItem, secondItem) =>
        firstItem.order - secondItem.order
);

export function getWebsiteStructureItem(id) {
    return WEBSITE_STRUCTURE.find(
        (item) => item.id === id
    ) ?? null;
}