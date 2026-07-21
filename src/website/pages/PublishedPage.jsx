import {
    useEffect,
    useMemo
} from "react";

import {
    Navigate,
    useParams
} from "react-router-dom";

import WebsiteRenderer from "@cms/rendering/WebsiteRenderer";

import {
    getPageBySlug
} from "@cms/modules/pages/services/pageService";

export default function PublishedPage() {
    const { slug } = useParams();

    const page = useMemo(
        () => getPageBySlug(slug),
        [slug]
    );

    useEffect(() => {
        if (!page?.published) {
            return;
        }

        const previousTitle =
            document.title;

        document.title = page.title;

        return () => {
            document.title =
                previousTitle;
        };
    }, [page]);

    if (
        !page ||
        !page.published ||
        page.status !== "published"
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
            page={page}
            mode="website"
        />
    );
}