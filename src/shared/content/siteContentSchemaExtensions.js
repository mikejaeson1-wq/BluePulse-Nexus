const MEDIA_COLLECTIONS = {
    projects: {
        collectionKey: "items",
        label: "Projektbild"
    },

    participation: {
        collectionKey: "items",
        label: "Bild"
    },

    donations: {
        collectionKey: "methods",
        label: "Bild"
    }
};

function extendCollection(
    collection,
    extension
) {
    if (
        collection.key !==
        extension.collectionKey
    ) {
        return collection;
    }

    const existingFields =
        collection.fields ?? [];

    const hasMediaField =
        existingFields.some(
            (field) =>
                field.key === "image"
        );

    const fields =
        hasMediaField
            ? existingFields
            : [
                {
                    key: "image",
                    label:
                        extension.label,
                    type: "media",
                    width: 12
                },
                ...existingFields
            ];

    const originalCreateItem =
        collection.createItem;

    return {
        ...collection,

        fields,

        createItem() {
            const newItem =
                typeof originalCreateItem ===
                "function"
                    ? originalCreateItem()
                    : {};

            return {
                image: "",
                ...newItem
            };
        }
    };
}

export function extendSiteContentSchema(
    contentKey,
    schema
) {
    if (!schema) {
        return null;
    }

    const extension =
        MEDIA_COLLECTIONS[
            contentKey
        ];

    if (!extension) {
        return schema;
    }

    return {
        ...schema,

        fields: [
            ...(schema.fields ?? [])
        ],

        collections:
            (
                schema.collections ??
                []
            ).map(
                (collection) =>
                    extendCollection(
                        collection,
                        extension
                    )
            )
    };
}