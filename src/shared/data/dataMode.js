const SUPPORTED_DATA_MODES =
    new Set([
        "local",
        "api"
    ]);

const requestedDataMode =
    String(
        import.meta.env
            .VITE_DATA_MODE ??
        "local"
    )
        .trim()
        .toLowerCase();

export const DATA_MODE =
    SUPPORTED_DATA_MODES.has(
        requestedDataMode
    )
        ? requestedDataMode
        : "local";

if (
    requestedDataMode &&
    !SUPPORTED_DATA_MODES.has(
        requestedDataMode
    )
) {
    console.warn(
        `Unbekannter Nexus-Datenmodus „${requestedDataMode}“. Es wird „local“ verwendet.`
    );
}

export function getDataMode() {
    return DATA_MODE;
}

export function isLocalDataMode() {
    return DATA_MODE === "local";
}

export function isApiDataMode() {
    return DATA_MODE === "api";
}