const SUPPORTED_DATA_MODES =
    new Set([
        "local",
        "api"
    ]);

function normalizeRequestedMode(
    value,
    fallback
) {
    const requestedMode =
        String(
            value ?? fallback
        )
            .trim()
            .toLowerCase();

    return {
        requestedMode,

        resolvedMode:
            SUPPORTED_DATA_MODES.has(
                requestedMode
            )
                ? requestedMode
                : fallback
    };
}

const generalMode =
    normalizeRequestedMode(
        import.meta.env
            .VITE_DATA_MODE,
        "local"
    );

const pageMode =
    normalizeRequestedMode(
        import.meta.env
            .VITE_PAGE_DATA_MODE,
        generalMode.resolvedMode
    );

export const DATA_MODE =
    generalMode.resolvedMode;

export const PAGE_DATA_MODE =
    pageMode.resolvedMode;

if (
    generalMode.requestedMode &&
    !SUPPORTED_DATA_MODES.has(
        generalMode.requestedMode
    )
) {
    console.warn(
        `Unbekannter Nexus-Datenmodus „${generalMode.requestedMode}“. Es wird „local“ verwendet.`
    );
}

if (
    pageMode.requestedMode &&
    !SUPPORTED_DATA_MODES.has(
        pageMode.requestedMode
    )
) {
    console.warn(
        `Unbekannter Seiten-Datenmodus „${pageMode.requestedMode}“. Es wird „${DATA_MODE}“ verwendet.`
    );
}

export function getDataMode() {
    return DATA_MODE;
}

export function getPageDataMode() {
    return PAGE_DATA_MODE;
}

export function isLocalDataMode() {
    return DATA_MODE ===
        "local";
}

export function isApiDataMode() {
    return DATA_MODE ===
        "api";
}

export function isLocalPageDataMode() {
    return PAGE_DATA_MODE ===
        "local";
}

export function isApiPageDataMode() {
    return PAGE_DATA_MODE ===
        "api";
}