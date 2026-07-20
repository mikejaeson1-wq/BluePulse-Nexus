import { createContext, useContext, useMemo, useState } from "react";

import mediaData from "../data/media.json";

const MediaContext = createContext(null);

export function MediaProvider({

    children

}) {

    const [media, setMedia] = useState(mediaData);

    function addMedia(item) {

        setMedia(current => [

            ...current,

            item

        ]);

    }

    function removeMedia(id) {

        setMedia(current =>

            current.filter(

                media => media.id !== id

            )

        );

    }

    function updateMedia(id, updates) {

        setMedia(current =>

            current.map(item =>

                item.id === id

                    ? {

                        ...item,

                        ...updates

                    }

                    : item

            )

        );

    }

    const value = useMemo(() => ({

        media,

        addMedia,

        removeMedia,

        updateMedia

    }), [media]);

    return (

        <MediaContext.Provider value={value}>

            {children}

        </MediaContext.Provider>

    );

}

export function useMediaStore() {

    const context = useContext(MediaContext);

    if (!context) {

        throw new Error(

            "MediaProvider fehlt."

        );

    }

    return context;

}