import "./MediaGrid.css";

import MediaCard from "./MediaCard";

export default function MediaGrid({

    files,

    onSelect

}) {

    if (files.length === 0) {

        return (

            <p>

                Keine Dateien gefunden.

            </p>

        );

    }

    return (

        <div className="bp-media-grid">

            {

                files.map(file => (

                    <MediaCard

                        key={file.id}

                        file={file}

                        onSelect={onSelect}

                    />

                ))

            }

        </div>

    );

}