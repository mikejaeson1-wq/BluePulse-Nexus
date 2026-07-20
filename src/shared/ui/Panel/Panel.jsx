import "./Panel.css";

export default function Panel({

    title,

    children,

    actions

}) {

    return (

        <section className="bp-panel">

            <header className="bp-panel-header">

                <h2>

                    {title}

                </h2>

                {actions}

            </header>

            <div className="bp-panel-content">

                {children}

            </div>

        </section>

    );

}