import {
    useEffect,
    useState
} from "react";

import {
    getSiteContentRepository
} from "@shared/data/repositories";

const repository =
    getSiteContentRepository();

export default function useSiteContentSection(
    contentKey
) {
    const [
        content,
        setContent
    ] = useState(
        () =>
            repository
                .getSectionSnapshot?.(
                    contentKey
                ) ??
            null
    );

    useEffect(() => {
        let active = true;

        const controller =
            new AbortController();

        async function loadContent() {
            if (!contentKey) {
                if (active) {
                    setContent(null);
                }

                return;
            }

            try {
                const nextContent =
                    await repository.getSection(
                        contentKey,
                        {
                            signal:
                                controller.signal
                        }
                    );

                if (active) {
                    setContent(
                        nextContent ??
                        null
                    );
                }
            } catch (error) {
                if (
                    error?.name ===
                    "AbortError"
                ) {
                    return;
                }

                console.error(
                    `Website-Inhalt „${contentKey}“ konnte nicht geladen werden.`,
                    error
                );
            }
        }

        const snapshot =
            repository
                .getSectionSnapshot?.(
                    contentKey
                );

        if (
            snapshot !== undefined &&
            snapshot !== null
        ) {
            setContent(snapshot);
        }

        loadContent();

        const unsubscribe =
            repository.subscribe?.(
                () => {
                    loadContent();
                }
            ) ??
            (() => {});

        return () => {
            active = false;

            controller.abort();
            unsubscribe();
        };
    }, [contentKey]);

    return content;
}