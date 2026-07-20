import { useState } from "react";

import Modal from "../../../features/ui/components/Modal/Modal";
import Button from "../../../features/ui/components/Button/Button";
import Input from "../../../features/ui/components/Input/Input";

import MediaLibrary from "../../../features/media/components/MediaLibrary";

export default function ImageProperties({

    block,

    onChange

}) {

    const [open, setOpen] = useState(false);

    function update(field, value) {

        onChange({

            ...block,

            data: {

                ...block.data,

                [field]: value

            }

        });

    }

    function selectImage(file) {

        onChange({

            ...block,

            data: {

                ...block.data,

                src: file.url,
                alt: file.name

            }

        });

        setOpen(false);

    }

    return (

        <>

            <div className="mb-3">

                <label>Vorschau</label>

                <br />

                <img

                    src={block.data.src}

                    alt={block.data.alt}

                    style={{

                        width: "100%",
                        borderRadius: "10px",
                        marginTop: "10px"

                    }}

                />

            </div>

            <div className="mb-3">

                <Button onClick={() => setOpen(true)}>

                    📁 Bild auswählen

                </Button>

            </div>

            <div className="mb-3">

                <label>Alternativer Text</label>

                <Input

                    value={block.data.alt ?? ""}

                    onChange={(value) => update("alt", value)}

                />

            </div>

            <Modal

                open={open}

                title="Mediathek"

                onClose={() => setOpen(false)}

            >

                <MediaLibrary

                    onSelect={selectImage}

                />

            </Modal>

        </>

    );

}