import {
    useEffect,
    useState
} from "react";

import {
    Navigate,
    useParams
} from "react-router-dom";

import WebsiteRenderer from "@cms/rendering/WebsiteRenderer";

import {
    getPublishedPageBySlug
} from "@cms/modules/pages/services/pageService";

import {
    applyPageDocumentMetadata
} from "@shared/pages/documentMetadata";

export default function PublishedPage() {
    const {
        slug
    } =
        useParams();

    const [
        page,
        setPage
    ] =
        useState(null);

    const [
        loading,
        setLoading
    ] =
        useState(true);

    const [
        error,
        setError
    ] =
        useState("");

    useEffect(() => {
        let active =
            true;

        async function loadPage() {
            setLoading(
                true
            );

            setError("");

            try {
                const loadedPage =
                    await Promise.resolve(
                        getPublishedPageBySlug(
                            slug
                        )
                    );

                if (active) {
                    setPage(
                        loadedPage ??
                        null
                    );
                }
            } catch (
                loadError
            ) {
                if (!active) {
                    return;
                }

                setPage(
                    null
                );

                if (
                    loadError.status !==
                    404
                ) {
                    setError(
                        loadError.message ??
                        "Die Seite konnte nicht geladen werden."
                    );
                }
            } finally {
                if (active) {
                    setLoading(
                        false
                    );
                }
            }
        }

        loadPage();

        return () => {
            active =
                false;
        };
    }, [
        slug
    ]);

    useEffect(() => {
        if (
            page?.status !==
            "published"
        ) {
            return undefined;
        }

        return applyPageDocumentMetadata(
            page
        );
    }, [
        page
    ]);

    if (loading) {
        return (
            <main className="container py-5 text-light">
                <div className="d-flex align-items-center gap-3">
                    <div className="spinner-border text-info" />

                    <span>
                        Seite wird geladen …
                    </span>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="container py-5 text-light">
                <div className="alert alert-danger">
                    {
                        error
                    }
                </div>
            </main>
        );
    }

    if (
        !page ||
        page.status !==
        "published"
    ) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return (
        <WebsiteRenderer
            page={
                page
            }
            mode="website"
        />
    );
}