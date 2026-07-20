import "./Hero.css";

export default function Hero({

    data

}) {

    return (

        <section className="bp-hero">

            <div className="bp-hero-container">

                <h1>

                    {data.title}

                </h1>

                <p>

                    {data.subtitle}

                </p>

                <button>

                    {data.buttonText}

                </button>

            </div>

        </section>

    );

}