import siteContentDefaults from "./siteContentDefaults";

const STORAGE_KEY =
    "bluepulse.website.content.v1";

const CHANGE_EVENT =
    "bluepulse:site-content-change";

const SECTION_ALIASES = {
    start: "hero",
    "ueber-uns": "mission",
    wirkung: "impact"
};

function resolveSectionId(sectionId) {
    return SECTION_ALIASES[sectionId] ?? sectionId;
}

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

function isObject(value) {
    return (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
    );
}

function mergeValues(defaultValue, storedValue) {
    if (Array.isArray(defaultValue)) {
        return Array.isArray(storedValue)
            ? cloneValue(storedValue)
            : cloneValue(defaultValue);
    }

    if (isObject(defaultValue)) {
        const result = {};

        const storedObject = isObject(storedValue)
            ? storedValue
            : {};

        const keys = new Set([
            ...Object.keys(defaultValue),
            ...Object.keys(storedObject)
        ]);

        keys.forEach((key) => {
            result[key] = mergeValues(
                defaultValue[key],
                storedObject[key]
            );
        });

        return result;
    }

    return storedValue !== undefined
        ? storedValue
        : defaultValue;
}

function readStoredContent() {
    if (
        typeof globalThis.localStorage ===
        "undefined"
    ) {
        return {};
    }

    try {
        const storedContent =
            localStorage.getItem(STORAGE_KEY);

        if (!storedContent) {
            return {};
        }

        const parsedContent =
            JSON.parse(storedContent);

        return isObject(parsedContent)
            ? parsedContent
            : {};
    } catch (error) {
        console.error(
            "Website-Inhalte konnten nicht geladen werden.",
            error
        );

        return {};
    }
}

function writeContent(content) {
    if (
        typeof globalThis.localStorage ===
        "undefined"
    ) {
        return;
    }

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(content)
    );
}

function emitContentChange(sectionId) {
    if (
        typeof globalThis.window ===
        "undefined"
    ) {
        return;
    }

    window.dispatchEvent(
        new CustomEvent(CHANGE_EVENT, {
            detail: {
                sectionId
            }
        })
    );
}

export function getSiteContent() {
    return mergeValues(
        siteContentDefaults,
        readStoredContent()
    );
}

export function getSiteSection(sectionId) {
    const resolvedSectionId =
        resolveSectionId(sectionId);

    const content = getSiteContent();

    if (!content[resolvedSectionId]) {
        return null;
    }

    return cloneValue(
        content[resolvedSectionId]
    );
}

export function updateSiteSection(
    sectionId,
    sectionData
) {
    const resolvedSectionId =
        resolveSectionId(sectionId);

    if (!siteContentDefaults[resolvedSectionId]) {
        throw new Error(
            `Unbekannter Website-Bereich: ${sectionId}`
        );
    }

    const content = getSiteContent();

    content[resolvedSectionId] = mergeValues(
        siteContentDefaults[resolvedSectionId],
        sectionData
    );

    writeContent(content);

    emitContentChange(
        resolvedSectionId
    );

    return cloneValue(
        content[resolvedSectionId]
    );
}

export function resetSiteSection(sectionId) {
    const resolvedSectionId =
        resolveSectionId(sectionId);

    if (!siteContentDefaults[resolvedSectionId]) {
        return null;
    }

    const content = getSiteContent();

    content[resolvedSectionId] = cloneValue(
        siteContentDefaults[resolvedSectionId]
    );

    writeContent(content);

    emitContentChange(
        resolvedSectionId
    );

    return cloneValue(
        content[resolvedSectionId]
    );
}

export function subscribeToSiteContent(
    listener
) {
    function handleCustomEvent(event) {
        listener(
            event.detail?.sectionId ?? null
        );
    }

    function handleStorageEvent(event) {
        if (event.key !== STORAGE_KEY) {
            return;
        }

        listener(null);
    }

    window.addEventListener(
        CHANGE_EVENT,
        handleCustomEvent
    );

    window.addEventListener(
        "storage",
        handleStorageEvent
    );

    return () => {
        window.removeEventListener(
            CHANGE_EVENT,
            handleCustomEvent
        );

        window.removeEventListener(
            "storage",
            handleStorageEvent
        );
    };
}