import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import AdminPage from "@cms/modules/dashboard/admin/components/AdminPage";

import Button from "@shared/ui/Button";

import MediaField from "@cms/modules/pages/components/MediaField";

import {
    getWebsiteStructureItem
} from "@shared/constants/siteStructure";

import {
    getSiteContentSchema
} from "@shared/content/siteContentSchemas";

import {
    extendSiteContentSchema
} from "@shared/content/siteContentSchemaExtensions";

import {
    getSiteSection,
    resetSiteSection,
    updateSiteSection
} from "@shared/content/siteContentService";

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

function serializeValue(value) {
    return JSON.stringify(value);
}

function Field({
    field,
    value,
    onChange,
    inputId
}) {
    const width =
        field.width ?? 12;

    function handleChange(event) {
        if (field.type === "number") {
            const nextValue =
                event.target.value === ""
                    ? 0
                    : Number(
                        event.target.value
                    );

            onChange(nextValue);

            return;
        }

        onChange(
            event.target.value
        );
    }

    return (
        <div
            className={
                `col-md-${width} mb-3`
            }
        >
            <label
                className="form-label"
                htmlFor={
                    field.type ===
                    "media"
                        ? undefined
                        : inputId
                }
            >
                {field.label}
            </label>

            {
                field.type === "media" && (
                    <MediaField
                        value={value ?? ""}
                        onChange={onChange}
                    />
                )
            }

            {
                field.type ===
                "textarea" && (
                    <textarea
                        id={inputId}
                        className="form-control"
                        rows={
                            field.rows ?? 4
                        }
                        value={value ?? ""}
                        placeholder={
                            field.placeholder ??
                            ""
                        }
                        onChange={
                            handleChange
                        }
                    />
                )
            }

            {
                field.type !== "media" &&
                field.type !==
                "textarea" && (
                    <input
                        id={inputId}
                        type={
                            field.type ===
                            "number"
                                ? "number"
                                : "text"
                        }
                        className="form-control"
                        value={value ?? ""}
                        placeholder={
                            field.placeholder ??
                            ""
                        }
                        onChange={
                            handleChange
                        }
                    />
                )
            }
        </div>
    );
}

function FieldGroup({
    fields,
    values,
    onChange,
    inputPrefix
}) {
    return (
        <div className="row">
            {
                fields.map((field) => (
                    <Field
                        key={field.key}
                        field={field}
                        value={
                            values[
                                field.key
                            ]
                        }
                        inputId={
                            `${inputPrefix}-${field.key}`
                        }
                        onChange={(value) =>
                            onChange(
                                field.key,
                                value
                            )
                        }
                    />
                ))
            }
        </div>
    );
}

function CollectionEditor({
    collection,
    items,
    onItemChange,
    onAddItem,
    onRemoveItem
}) {
    const minimumItems =
        collection.minItems ?? 0;

    return (
        <section className="mt-4">
            <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                <h3 className="mb-0">
                    {collection.label}
                </h3>

                <Button
                    type="button"
                    size="sm"
                    onClick={onAddItem}
                >
                    {collection.addLabel}
                </Button>
            </div>

            {
                items.length === 0 && (
                    <div className="alert alert-secondary">
                        Noch keine Einträge vorhanden.
                    </div>
                )
            }

            {
                items.map(
                    (item, index) => (
                        <article
                            key={
                                item.id ??
                                index
                            }
                            className="card bg-dark border-secondary mb-3"
                        >
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                                    <strong>
                                        {
                                            collection.itemLabel
                                        }{" "}
                                        {index + 1}
                                    </strong>

                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        disabled={
                                            items.length <=
                                            minimumItems
                                        }
                                        onClick={() =>
                                            onRemoveItem(
                                                index
                                            )
                                        }
                                    >
                                        Entfernen
                                    </Button>
                                </div>

                                <FieldGroup
                                    fields={
                                        collection.fields
                                    }
                                    values={item}
                                    inputPrefix={
                                        `${collection.key}-${index}`
                                    }
                                    onChange={(
                                        field,
                                        value
                                    ) =>
                                        onItemChange(
                                            index,
                                            field,
                                            value
                                        )
                                    }
                                />
                            </div>
                        </article>
                    )
                )
            }
        </section>
    );
}

export default function WebsiteSectionEditor() {
    const navigate =
        useNavigate();

    const {
        sectionId
    } = useParams();

    const structureItem =
        useMemo(
            () =>
                getWebsiteStructureItem(
                    sectionId
                ),
            [sectionId]
        );

    const contentKey =
        structureItem?.contentKey ??
        null;

    const schema =
        useMemo(
            () => {
                if (!contentKey) {
                    return null;
                }

                const baseSchema =
                    getSiteContentSchema(
                        contentKey
                    );

                return extendSiteContentSchema(
                    contentKey,
                    baseSchema
                );
            },
            [contentKey]
        );

    const [
        content,
        setContent
    ] = useState(null);

    const [
        savedContent,
        setSavedContent
    ] = useState(null);

    const [
        message,
        setMessage
    ] = useState("");

    const hasUnsavedChanges =
        useMemo(
            () =>
                content !== null &&
                savedContent !== null &&
                serializeValue(
                    content
                ) !==
                serializeValue(
                    savedContent
                ),
            [
                content,
                savedContent
            ]
        );

    useEffect(() => {
        if (!contentKey) {
            setContent(null);
            setSavedContent(null);

            return;
        }

        const loadedContent =
            getSiteSection(
                contentKey
            );

        setContent(
            loadedContent
                ? cloneValue(
                    loadedContent
                )
                : null
        );

        setSavedContent(
            loadedContent
                ? cloneValue(
                    loadedContent
                )
                : null
        );

        setMessage("");
    }, [contentKey]);

    useEffect(() => {
        function handleBeforeUnload(
            event
        ) {
            if (!hasUnsavedChanges) {
                return;
            }

            event.preventDefault();
            event.returnValue = "";
        }

        globalThis.window.addEventListener(
            "beforeunload",
            handleBeforeUnload
        );

        return () => {
            globalThis.window.removeEventListener(
                "beforeunload",
                handleBeforeUnload
            );
        };
    }, [hasUnsavedChanges]);

    function changeField(
        field,
        value
    ) {
        setContent(
            (currentContent) => ({
                ...currentContent,
                [field]: value
            })
        );

        setMessage("");
    }

    function changeCollectionItem(
        collectionKey,
        index,
        field,
        value
    ) {
        setContent(
            (currentContent) => ({
                ...currentContent,

                [collectionKey]:
                    (
                        currentContent[
                            collectionKey
                        ] ?? []
                    ).map(
                        (
                            item,
                            itemIndex
                        ) =>
                            itemIndex ===
                            index
                                ? {
                                    ...item,
                                    [field]:
                                        value
                                }
                                : item
                    )
            })
        );

        setMessage("");
    }

    function addCollectionItem(
        collection
    ) {
        const newItem =
            collection.createItem();

        setContent(
            (currentContent) => ({
                ...currentContent,

                [collection.key]: [
                    ...(
                        currentContent[
                            collection.key
                        ] ?? []
                    ),
                    newItem
                ]
            })
        );

        setMessage("");
    }

    function removeCollectionItem(
        collection,
        index
    ) {
        const items =
            content[
                collection.key
            ] ?? [];

        if (
            items.length <=
            (
                collection.minItems ??
                0
            )
        ) {
            return;
        }

        setContent(
            (currentContent) => ({
                ...currentContent,

                [collection.key]:
                    (
                        currentContent[
                            collection.key
                        ] ?? []
                    ).filter(
                        (
                            _,
                            itemIndex
                        ) =>
                            itemIndex !==
                            index
                    )
            })
        );

        setMessage("");
    }

    function saveContent(event) {
        event.preventDefault();

        if (
            !contentKey ||
            !content
        ) {
            return;
        }

        const saved =
            updateSiteSection(
                contentKey,
                content
            );

        setContent(
            cloneValue(saved)
        );

        setSavedContent(
            cloneValue(saved)
        );

        setMessage(
            "Änderungen wurden gespeichert."
        );
    }

    function resetContent() {
        if (
            !confirm(
                "Diesen Bereich auf die Standardwerte zurücksetzen?"
            )
        ) {
            return;
        }

        const defaults =
            resetSiteSection(
                contentKey
            );

        setContent(
            cloneValue(defaults)
        );

        setSavedContent(
            cloneValue(defaults)
        );

        setMessage(
            "Standardwerte wurden wiederhergestellt."
        );
    }

    function goBack() {
        if (
            hasUnsavedChanges &&
            !confirm(
                "Ungespeicherte Änderungen verwerfen?"
            )
        ) {
            return;
        }

        navigate(
            "/admin/pages"
        );
    }

    function openWebsiteSection() {
        globalThis.window.open(
            structureItem.route,
            "_blank",
            "noopener,noreferrer"
        );
    }

    const canEdit =
        Boolean(
            structureItem?.editable &&
            contentKey &&
            schema &&
            content
        );

    if (!canEdit) {
        return (
            <AdminPage
                title="Bereich nicht bearbeitbar"
                description="Für diesen Website-Bereich existiert noch kein Inhaltseditor."
                action={
                    <Button
                        onClick={goBack}
                    >
                        ← Zurück
                    </Button>
                }
            >
                <p>
                    Der Bereich kann derzeit noch
                    nicht über Nexus bearbeitet werden.
                </p>
            </AdminPage>
        );
    }

    return (
        <AdminPage
            title={
                `${structureItem.title} bearbeiten`
            }
            description={
                `Website-Komponente: ${structureItem.component}`
            }
            action={
                <div className="d-flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={
                            openWebsiteSection
                        }
                    >
                        Ansehen
                    </Button>

                    <Button
                        onClick={goBack}
                    >
                        ← Zurück
                    </Button>
                </div>
            }
        >
            {
                message && (
                    <div className="alert alert-success">
                        {message}
                    </div>
                )
            }

            {
                hasUnsavedChanges && (
                    <div className="alert alert-warning">
                        Es gibt ungespeicherte Änderungen.
                    </div>
                )
            }

            <form onSubmit={saveContent}>
                <section>
                    <h2 className="mb-3">
                        {schema.title}
                    </h2>

                    <FieldGroup
                        fields={
                            schema.fields ??
                            []
                        }
                        values={content}
                        inputPrefix={
                            contentKey
                        }
                        onChange={
                            changeField
                        }
                    />
                </section>

                {
                    (
                        schema.collections ??
                        []
                    ).map(
                        (collection) => (
                            <CollectionEditor
                                key={
                                    collection.key
                                }
                                collection={
                                    collection
                                }
                                items={
                                    content[
                                        collection.key
                                    ] ?? []
                                }
                                onAddItem={() =>
                                    addCollectionItem(
                                        collection
                                    )
                                }
                                onRemoveItem={(
                                    index
                                ) =>
                                    removeCollectionItem(
                                        collection,
                                        index
                                    )
                                }
                                onItemChange={(
                                    index,
                                    field,
                                    value
                                ) =>
                                    changeCollectionItem(
                                        collection.key,
                                        index,
                                        field,
                                        value
                                    )
                                }
                            />
                        )
                    )
                }

                <div className="d-flex gap-2 mt-4">
                    <Button
                        type="submit"
                        disabled={
                            !hasUnsavedChanges
                        }
                    >
                        Änderungen speichern
                    </Button>

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={
                            resetContent
                        }
                    >
                        Standardwerte
                    </Button>
                </div>
            </form>
        </AdminPage>
    );
}