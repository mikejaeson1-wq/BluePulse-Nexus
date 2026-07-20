import "./MediaCard.css";

export default function MediaCard({

    file,

    onSelect

}) {

    return (

        <div

            className="bp-media-card"

            onClick={() => onSelect(file)}

        >

            <img

                src={file.thumbnail}

                alt={file.name}

            />

            <div className="bp-media-card-footer">

                <strong>

                    {file.name}

                </strong>

                <small>

                    {file.folder}

                </small>

            </div>

        </div>

    );

}