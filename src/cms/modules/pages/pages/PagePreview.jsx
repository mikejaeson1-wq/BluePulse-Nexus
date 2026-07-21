import {
    useEffect,
    useMemo
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import WebsiteRenderer from "@cms/rendering/WebsiteRenderer";

import {
    getPage
} from "@cms/modules/pages/services/pageService";

import {
    getPreviewPage
} from "@cms/modules/pages/services/previewService";

export default function PagePreview() {
    const navigate = useNavigate();
    const { id } = useParams();

    const page = useMemo(
        () =>
            getPreviewPage(id) ??
            getPage(id),
        [id]
    );

    useEffect(() => {
        if (!page) {
            return;
        }

        const previousTitle =
            document.title;

        document.title =
            `Vorschau – ${page.title}`;

        return () => {
            document.title =
                previousTitle;
        };
    }, [page]);

    function closePreview() {
        if (window.opener) {
            window.close();
            return;
        }

        navigate(
            `/admin/pages/${id}`
        );
    }

    if (!page) {
        return (
            <main
                style={{
                    minHeight: "100vh",
                    display: "grid",
                    placeItems: "center",
                    padding: "2rem",
                    background: "#0f172a",
                    color: "#ffffff"
                }}
            >
                <div>
                    <h1>
                        Vorschau nicht gefunden
                    </h1>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/pages")
                        }
                    >
                        Zurück zu den Seiten
                    </button>
                </div>
            </main>
        );
    }

    return (
        <div>
            <header
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10000,
                    minHeight: "56px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    padding: "0.75rem 1.25rem",
                    background: "#0f172a",
                    borderBottom:
                        "1px solid rgba(255,255,255,0.12)",
                    color: "#ffffff",
                    boxShadow:
                        "0 8px 30px rgba(0,0,0,0.3)"
                }}
            >
                <div>
                    <strong>
                        Vorschau
                    </strong>

                    <span
                        style={{
                            marginLeft: "0.75rem",
                            color: "#94a3b8"
                        }}
                    >
                        {page.title}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={closePreview}
                    style={{
                        border:
                            "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                        padding: "0.5rem 0.8rem",
                        background:
                            "rgba(255,255,255,0.08)",
                        color: "#ffffff",
                        cursor: "pointer"
                    }}
                >
                    Vorschau schließen
                </button>
            </header>

            <div
                style={{
                    paddingTop: "56px"
                }}
            >
                <WebsiteRenderer
                    page={page}
                    mode="preview"
                />
            </div>
        </div>
    );
}