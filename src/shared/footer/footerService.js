import footerDefaults from "./footerDefaults";

const STORAGE_KEY =
    "bluepulse.website.footer.v1";

const CHANGE_EVENT =
    "bluepulse:footer-change";

function cloneValue(value) {
    if (
        typeof globalThis.structuredClone ===
        "function"
    ) {
        return globalThis.structuredClone(value);
    }

    return JSON.parse(
        JSON.stringify(value)
    );
}

function createId(prefix) {
    if (globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
    }

    return `${prefix}-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
}

function normalizeLink(
    link,
    fallback = {},
    prefix = "link"
) {
    return {
        id:
            link?.id ??
            fallback.id ??
            createId(prefix),

        icon:
            link?.icon ??
            fallback.icon ??
            "",

        label:
            link?.label ??
            fallback.label ??
            "Neuer Link",

        href:
            link?.href ??
            fallback.href ??
            "",

        enabled:
            link?.enabled !== undefined
                ? Boolean(link.enabled)
                : Boolean(fallback.enabled)
    };
}

function normalizeLinkCollection(
    storedLinks,
    defaultLinks,
    prefix
) {
    const storedCollection =
        Array.isArray(storedLinks)
            ? storedLinks
            : [];

    const normalizedDefaults =
        defaultLinks.map((defaultLink) => {
            const storedLink =
                storedCollection.find(
                    (link) =>
                        link.id === defaultLink.id
                );

            return normalizeLink(
                storedLink,
                defaultLink,
                prefix
            );
        });

    const additionalLinks =
        storedCollection
            .filter(
                (storedLink) =>
                    !defaultLinks.some(
                        (defaultLink) =>
                            defaultLink.id ===
                            storedLink.id
                    )
            )
            .map((link) =>
                normalizeLink(
                    link,
                    {},
                    prefix
                )
            );

    return [
        ...normalizedDefaults,
        ...additionalLinks
    ];
}

function normalizeFooterSettings(value = {}) {
    return {
        brandPrimary:
            value.brandPrimary ??
            footerDefaults.brandPrimary,

        brandSecondary:
            value.brandSecondary ??
            footerDefaults.brandSecondary,

        legalName:
            value.legalName ??
            footerDefaults.legalName,

        slogan:
            value.slogan ??
            footerDefaults.slogan,

        description:
            value.description ??
            footerDefaults.description,

        email:
            value.email ??
            footerDefaults.email,

        location:
            value.location ??
            footerDefaults.location,

        copyrightText:
            value.copyrightText ??
            footerDefaults.copyrightText,

        showNavigation:
            value.showNavigation !== undefined
                ? Boolean(
                    value.showNavigation
                )
                : footerDefaults.showNavigation,

        showContact:
            value.showContact !== undefined
                ? Boolean(
                    value.showContact
                )
                : footerDefaults.showContact,

        showDonationButton:
            value.showDonationButton !==
            undefined
                ? Boolean(
                    value.showDonationButton
                )
                : footerDefaults
                    .showDonationButton,

        socialLinks:
            normalizeLinkCollection(
                value.socialLinks,
                footerDefaults.socialLinks,
                "social"
            ),

        legalLinks:
            normalizeLinkCollection(
                value.legalLinks,
                footerDefaults.legalLinks,
                "legal"
            )
    };
}

function readStoredSettings() {
    if (
        typeof globalThis.localStorage ===
        "undefined"
    ) {
        return null;
    }

    try {
        const storedSettings =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!storedSettings) {
            return null;
        }

        return JSON.parse(
            storedSettings
        );
    } catch (error) {
        console.error(
            "Footer-Einstellungen konnten nicht geladen werden.",
            error
        );

        return null;
    }
}

function writeSettings(settings) {
    if (
        typeof globalThis.localStorage ===
        "undefined"
    ) {
        return;
    }

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
    );
}

function emitChange() {
    if (
        typeof globalThis.window ===
        "undefined"
    ) {
        return;
    }

    window.dispatchEvent(
        new CustomEvent(CHANGE_EVENT)
    );
}

export function getFooterSettings() {
    return normalizeFooterSettings(
        readStoredSettings() ??
        footerDefaults
    );
}

export function updateFooterSettings(
    settings
) {
    const normalizedSettings =
        normalizeFooterSettings(
            settings
        );

    writeSettings(
        normalizedSettings
    );

    emitChange();

    return cloneValue(
        normalizedSettings
    );
}

export function resetFooterSettings() {
    const defaultSettings =
        normalizeFooterSettings(
            footerDefaults
        );

    writeSettings(
        defaultSettings
    );

    emitChange();

    return cloneValue(
        defaultSettings
    );
}

export function subscribeToFooterSettings(
    listener
) {
    function handleFooterChange() {
        listener(
            getFooterSettings()
        );
    }

    function handleStorageChange(event) {
        if (event.key !== STORAGE_KEY) {
            return;
        }

        handleFooterChange();
    }

    window.addEventListener(
        CHANGE_EVENT,
        handleFooterChange
    );

    window.addEventListener(
        "storage",
        handleStorageChange
    );

    return () => {
        window.removeEventListener(
            CHANGE_EVENT,
            handleFooterChange
        );

        window.removeEventListener(
            "storage",
            handleStorageChange
        );
    };
}