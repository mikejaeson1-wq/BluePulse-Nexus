import {
    useEffect
} from "react";

export default function Contact() {
    useEffect(() => {
        globalThis.location
            .replace(
                "/#kontakt"
            );
    }, []);

    return null;
}
