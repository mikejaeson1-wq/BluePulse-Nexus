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

function warnAboutInvalidMode({
    label,
    mode,
    fallback
}) {
    if (
        !mode.requestedMode ||
        SUPPORTED_DATA_MODES.has(
            mode.requestedMode
        )
    ) {
        return;
    }

    console.warn(
        `Unbekannter ${label} „${mode.requestedMode}“. Es wird „${fallback}“ verwendet.`
    );
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

const mediaMode =
    normalizeRequestedMode(
        import.meta.env
            .VITE_MEDIA_DATA_MODE,
        generalMode.resolvedMode
    );

export const DATA_MODE =
    generalMode.resolvedMode;

export const PAGE_DATA_MODE =
    pageMode.resolvedMode;

export const MEDIA_DATA_MODE =
    mediaMode.resolvedMode;

warnAboutInvalidMode({
    label:
        "Nexus-Datenmodus",

    mode:
        generalMode,

    fallback:
        "local"
});

warnAboutInvalidMode({
    label:
        "Seiten-Datenmodus",

    mode:
        pageMode,

    fallback:
        DATA_MODE
});

warnAboutInvalidMode({
    label:
        "Medien-Datenmodus",

    mode:
        mediaMode,

    fallback:
        DATA_MODE
});

export function getDataMode() {
    return DATA_MODE;
}

export function getPageDataMode() {
    return PAGE_DATA_MODE;
}

export function getMediaDataMode() {
    return MEDIA_DATA_MODE;
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

export function isLocalMediaDataMode() {
    return MEDIA_DATA_MODE ===
        "local";
}

export function isApiMediaDataMode() {
    return MEDIA_DATA_MODE ===
        "api";
}