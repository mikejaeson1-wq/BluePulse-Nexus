import {
    useEffect
} from "react";

import {
    applyPageDocumentMetadata
} from "@shared/pages/documentMetadata";

import {
    applyStructuredData
} from "./structuredData";

export default function SeoBoundary({
    page,
    structuredData = [],
    structuredDataScope = "page",
    children
}) {
    useEffect(() => {
        if (!page) {
            return undefined;
        }

        return applyPageDocumentMetadata(
            page
        );
    }, [
        page
    ]);

    useEffect(() => {
        return applyStructuredData(
            structuredData,
            {
                scope:
                    structuredDataScope
            }
        );
    }, [
        structuredData,
        structuredDataScope
    ]);

    return children;
}
