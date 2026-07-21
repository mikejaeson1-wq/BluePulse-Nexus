import {
    useEffect,
    useState
} from "react";

import {
    getSiteNavigationRepository
} from "@shared/data/repositories";

const repository =
    getSiteNavigationRepository();

const EMPTY_NAVIGATION = {
    items: [],

    cta: {
        id: "spenden",
        label: "Spenden",
        href: "",
        enabled: false,
        target: "_self"
    }
};

export default function useSiteNavigation() {
    const [
        navigation,
        setNavigation
    ] = useState(
        () =>
            repository
                .getSnapshot?.() ??
            EMPTY_NAVIGATION
    );

    useEffect(() => {
        let active = true;

        const controller =
            new AbortController();

        async function loadNavigation() {
            try {
                const nextNavigation =
                    await repository.get({
                        signal:
                            controller.signal
                    });

                if (
                    active &&
                    nextNavigation
                ) {
                    setNavigation(
                        nextNavigation
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
                    "Website-Navigation konnte nicht geladen werden.",
                    error
                );
            }
        }

        loadNavigation();

        const unsubscribe =
            repository.subscribe?.(
                (
                    nextNavigation
                ) => {
                    if (
                        nextNavigation
                    ) {
                        setNavigation(
                            nextNavigation
                        );

                        return;
                    }

                    loadNavigation();
                }
            ) ??
            (() => {});

        return () => {
            active = false;

            controller.abort();
            unsubscribe();
        };
    }, []);

    return navigation;
}