import {
    useMemo
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import AdminPage from "../components/AdminPage";

import Builder from "@cms/modules/builder/components/Builder";

import Button from "@shared/ui/Button";

import {
    getPage,
    publishPage,
    updatePage
} from "@cms/modules/pages/services/pageService";

import {
    savePreviewPage
} from "@cms/modules/pages/services/previewService";

export default function PageEditor() {
    const navigate = useNavigate();
    const { id } = useParams();

    const page = useMemo(
        () => getPage(id),
        [id]
    );

    function handleSave(builderPage) {
        return updatePage(
            id,
            builderPage
        );
    }

    function handlePublish(builderPage) {
        return publishPage(
            id,
            builderPage
        );
    }

    function handlePreview(builderPage) {
        savePreviewPage(
            builderPage
        );

        const previewWindow =
            window.open(
                `/admin/preview/${id}`,
                "_blank"
            );

        if (previewWindow) {
            previewWindow.opener = null;
        } else {
            navigate(
                `/admin/preview/${id}`
            );
        }

        return builderPage;
    }

    if (!page) {
        return (
            <AdminPage
                title="Seite nicht gefunden"
                description="Die angeforderte Seite existiert nicht oder wurde gelöscht."
                action={
                    <Button
                        onClick={() =>
                            navigate("/admin/pages")
                        }
                    >
                        ← Zurück zu den Seiten
                    </Button>
                }
            >
                <p>
                    Für die ID „{id}“ wurde keine Seite gefunden.
                </p>
            </AdminPage>
        );
    }

    return (
        <AdminPage
            title="BluePulse Builder"
            description={`/${page.slug}`}
            action={
                <Button
                    onClick={() =>
                        navigate("/admin/pages")
                    }
                >
                    ← Zurück
                </Button>
            }
        >
            <Builder
                initialPage={page}
                onSave={handleSave}
                onPublish={handlePublish}
                onPreview={handlePreview}
            />
        </AdminPage>
    );
}