import Hero from "../Hero/Hero";
import Mission from "../Mission/Mission";
import Projects from "../Projects/Projects";
import Participation from "../Participation/Participation";
import Impact from "../Impact/Impact";
import Donations from "../Donations/Donations";
import Contact from "../Contact/Contact";

import useHomeLayout from "@shared/hooks/useHomeLayout";

const COMPONENT_REGISTRY = {
    Hero,
    Mission,
    Projects,
    Participation,
    Impact,
    Donations,
    Contact
};

export default function HomeSections() {
    const layout =
        useHomeLayout();

    const visibleItems =
        layout.items
            .filter(
                (item) =>
                    item.enabled
            )
            .sort(
                (
                    firstItem,
                    secondItem
                ) =>
                    firstItem.order -
                    secondItem.order
            );

    return (
        <>
            {
                visibleItems.map(
                    (item) => {
                        const Component =
                            COMPONENT_REGISTRY[
                                item.component
                            ];

                        if (!Component) {
                            console.warn(
                                `Unbekannte Website-Komponente: ${item.component}`
                            );

                            return null;
                        }

                        return (
                            <Component
                                key={item.id}
                            />
                        );
                    }
                )
            }
        </>
    );
}