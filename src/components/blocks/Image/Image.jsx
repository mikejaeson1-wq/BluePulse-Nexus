import "./Image.css";

export default function Image({

    data

}) {

    return (

        <section className="bp-image">

            <img

                src={data.src}

                alt={data.alt}

                className="bp-image-element"

            />

        </section>

    );

}