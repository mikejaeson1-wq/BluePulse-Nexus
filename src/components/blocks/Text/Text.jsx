import "./Text.css";

export default function Text({

    data

}){

    return(

        <section className="bp-text">

            <div className="bp-text-container">

                <h2>

                    {data.title}

                </h2>

                <p>

                    {data.text}

                </p>

            </div>

        </section>

    );

}