import {
    useEffect,
    useState
} from "react";

import {
    getFooterRepository
} from "@shared/data/repositories";

const repository =
    getFooterRepository();

const EMPTY_FOOTER = {
    brandPrimary: "Blue",
    brandSecondary: "Pulse",
    legalName: "",
    slogan: "",
    description: "",
    email: "",
    location: "",
    copyrightText: "",

    showNavigation: true,
    showContact: true,
    showDonationButton: true,

    socialLinks: [],
    legalLinks: []
};

export default function useFooterSettings() {
    const [
        settings,
        setSettings
    ] = useState(
        () =>
            repository
                .getSnapshot?.() ??
            EMPTY_FOOTER
    );

    useEffect(() => {
        let active = true;

        const controller =
            new AbortController();

        async function loadFooter() {
            try {
                const nextSettings =
                    await repository.get({
                        signal:
                            controller.signal
                    });

                if (
                    active &&
                    nextSettings
                ) {
                    setSettings(
                        nextSettings
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
                    "Footer-Einstellungen konnten nicht geladen werden.",
                    error
                );
            }
        }

        loadFooter();

        const unsubscribe =
            repository.subscribe?.(
                (nextSettings) => {
                    if (nextSettings) {
                        setSettings(
                            nextSettings
                        );

                        return;
                    }

                    loadFooter();
                }
            ) ??
            (() => {});

        return () => {
            active = false;

            controller.abort();
            unsubscribe();
        };
    }, []);

    return settings;
}