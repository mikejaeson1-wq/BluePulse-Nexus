import { useMemo } from "react";

import {

    getPages

} from "../services/pageService";

export default function usePages() {

    const pages = useMemo(

        () => getPages(),

        []

    );

    return {

        pages

    };

}