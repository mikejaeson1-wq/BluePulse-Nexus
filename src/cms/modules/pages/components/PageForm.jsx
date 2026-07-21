import {
    useEffect,
    useState
} from "react";

import Button from "@shared/ui/Button";

import {
    createPage,
    generateSlug
} from "../services/pageService";

export default function PageForm({
    onSave
}) {
    const [
        title,
        setTitle
    ] = useState("");

    const [
        slug,
        setSlug
    ] = useState("");

    const [
        template,
        setTemplate
    ] = useState(
        "default"
    );

    const [
        slugEdited,
        setSlugEdited
    ] = useState(false);

    const [
        saving,
        setSaving
    ] = useState(false);

    const [
        error,
        setError
    ] = useState("");

    useEffect(() => {
        if (slugEdited) {
            return;
        }

        setSlug(
            generateSlug(
                title
            )
        );
    }, [
        title,
        slugEdited
    ]);

    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        if (
            !title.trim() ||
            saving
        ) {
            return;
        }

        setSaving(true);
        setError("");

        try {
            const createdPage =
                await Promise.resolve(
                    createPage({
                        title:
                            title.trim(),

                        slug:
                            generateSlug(
                                slug ||
                                title
                            ),

                        template,

                        status:
                            "draft",

                        blocks: [],

                        theme: {}
                    })
                );

            setTitle("");
            setSlug("");
            setTemplate(
                "default"
            );
            setSlugEdited(false);

            await onSave?.(
                createdPage
            );
        } catch (saveError) {
            setError(
                saveError.message ??
                "Die Seite konnte nicht erstellt werden."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <form
            onSubmit={
                handleSubmit
            }
        >
            {
                error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )
            }

            <div className="mb-3">
                <label
                    className="form-label"
                    htmlFor="page-title"
                >
                    Titel
                </label>

                <input
                    id="page-title"
                    className="form-control"
                    value={title}
                    autoFocus
                    disabled={saving}
                    onChange={
                        (event) =>
                            setTitle(
                                event.target.value
                            )
                    }
                />
            </div>

            <div className="mb-3">
                <label
                    className="form-label"
                    htmlFor="page-slug"
                >
                    Slug
                </label>

                <div className="input-group">
                    <span className="input-group-text">
                        /
                    </span>

                    <input
                        id="page-slug"
                        className="form-control"
                        value={slug}
                        disabled={saving}
                        onChange={
                            (event) => {
                                setSlugEdited(
                                    true
                                );

                                setSlug(
                                    generateSlug(
                                        event
                                            .target
                                            .value
                                    )
                                );
                            }
                        }
                    />
                </div>
            </div>

            <div className="mb-4">
                <label
                    className="form-label"
                    htmlFor="page-template"
                >
                    Template
                </label>

                <select
                    id="page-template"
                    className="form-select"
                    value={template}
                    disabled={saving}
                    onChange={
                        (event) =>
                            setTemplate(
                                event.target.value
                            )
                    }
                >
                    <option value="default">
                        Standard
                    </option>

                    <option value="landing">
                        Landingpage
                    </option>
                </select>
            </div>

            <Button
                type="submit"
                disabled={
                    saving ||
                    !title.trim()
                }
            >
                {
                    saving
                        ? "Seite wird erstellt …"
                        : "Seite erstellen"
                }
            </Button>
        </form>
    );
}