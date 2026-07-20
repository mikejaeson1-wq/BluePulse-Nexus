import { useMemo } from "react";

import {

    useMediaStore

} from "../store/MediaStore";

export default function useMedia() {

    const {

        media

    } = useMediaStore();

    const images = useMemo(

        () =>

            media.filter(

                file => file.type === "image"

            ),

        [media]

    );

    return {

        images

    };

}