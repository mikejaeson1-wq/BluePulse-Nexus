const TRANSIENT_PAGE_KEYS =
    new Set([
        "createdAt",
        "updatedAt",
        "publishedAt",
        "deletedAt",
        "version",
        "versionNumber"
    ]);

function normalizeValue(
    value
) {
    if (
        Array.isArray(
            value
        )
    ) {
        return value.map(
            normalizeValue
        );
    }

    if (
        value &&
        typeof value ===
            "object"
    ) {
        return Object.keys(
            value
        )
            .filter(
                (key) =>
                    !TRANSIENT_PAGE_KEYS.has(
                        key
                    )
            )
            .sort()
            .reduce(
                (
                    result,
                    key
                ) => ({
                    ...result,

                    [key]:
                        normalizeValue(
                            value[key]
                        )
                }),
                {}
            );
    }

    return value;
}

export function createBuilderPageSnapshot(
    page
) {
    return JSON.stringify(
        normalizeValue(
            page ?? null
        )
    );
}
