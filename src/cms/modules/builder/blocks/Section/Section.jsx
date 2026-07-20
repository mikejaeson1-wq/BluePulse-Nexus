import "./Section.css";

export default function Section({

    data

}) {

    return (

        <section

            className="bp-section"

            style={{

                background: data.background,

                paddingTop: data.paddingTop,

                paddingBottom: data.paddingBottom

            }}

        >

            <div

                className="bp-section-container"

                style={{

                    maxWidth: data.maxWidth

                }}

            >

                <h2>{data.title}</h2>

                <p>

                    Hier können später andere Blöcke eingefügt werden.

                </p>

            </div>

        </section>

    );

}