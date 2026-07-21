const footerDefaults = {
    brandPrimary: "Blue",
    brandSecondary: "Pulse",

    legalName:
        "BluePulse Tierschutz n.e.V",

    slogan:
        "Every Life Matters",

    description:
        "Gemeinsam schützen wir Tiere, Meere und Natur. Jede Stimme zählt und jedes Leben ist wertvoll.",

    email:
        "kontakt@blue-pulse.de",

    location:
        "Dortmund, Nordrhein-Westfalen",

    copyrightText:
        "BluePulse Tierschutz n.e.V. Alle Rechte vorbehalten.",

    showNavigation: true,
    showContact: true,
    showDonationButton: true,

    socialLinks: [
        {
            id: "discord",
            icon: "bi-discord",
            label: "Discord",
            href: "",
            enabled: false
        },
        {
            id: "instagram",
            icon: "bi-instagram",
            label: "Instagram",
            href: "",
            enabled: false
        },
        {
            id: "facebook",
            icon: "bi-facebook",
            label: "Facebook",
            href: "",
            enabled: false
        }
    ],

    legalLinks: [
        {
            id: "impressum",
            label: "Impressum",
            href: "/impressum",
            enabled: false
        },
        {
            id: "datenschutz",
            label: "Datenschutz",
            href: "/datenschutz",
            enabled: false
        }
    ]
};

export default footerDefaults;