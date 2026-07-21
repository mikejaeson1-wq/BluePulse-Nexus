import {
    useEffect,
    useState
} from "react";

import {
    getHomeLayoutRepository
} from "@shared/data/repositories";

const repository =
    getHomeLayoutRepository();

const EMPTY_LAYOUT = {
    items: []
};

export default function useHomeLayout() {
    const [
        layout,
        setLayout
    ] = useState(
        () =>
            repository
                .getSnapshot?.() ??
            EMPTY_LAYOUT
    );

    useEffect(() => {
        let active = true;

        const controller =
            new AbortController();

        async function loadLayout() {
            try {
                const nextLayout =
                    await repository.get({
                        signal:
                            controller.signal
                    });

                if (
                    active &&
                    nextLayout
                ) {
                    setLayout(
                        nextLayout
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
                    "Startseiten-Layout konnte nicht geladen werden.",
                    error
                );
            }
        }

        loadLayout();

        const unsubscribe =
            repository.subscribe?.(
                (nextLayout) => {
                    if (nextLayout) {
                        setLayout(
                            nextLayout
                        );

                        return;
                    }

                    loadLayout();
                }
            ) ??
            (() => {});

        return () => {
            active = false;

            controller.abort();
            unsubscribe();
        };
    }, []);

    return layout;
}