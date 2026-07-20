export default function HeroProperties({

    block,

    onChange

}) {

    function update(field, value) {

        onChange({

            ...block,

            data: {

                ...block.data,

                [field]: value

            }

        });

    }

    return (

        <>

            <div className="mb-3">

                <label>Überschrift</label>

                <input

                    className="form-control"

                    value={block.data.title}

                    onChange={(e) => update("title", e.target.value)}

                />

            </div>

            <div className="mb-3">

                <label>Untertitel</label>

                <input

                    className="form-control"

                    value={block.data.subtitle}

                    onChange={(e) => update("subtitle", e.target.value)}

                />

            </div>

            <div className="mb-3">

                <label>Button</label>

                <input

                    className="form-control"

                    value={block.data.buttonText}

                    onChange={(e) => update("buttonText", e.target.value)}

                />

            </div>

        </>

    );

}