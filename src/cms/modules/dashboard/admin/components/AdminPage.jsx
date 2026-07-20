import "./AdminPage.css";

export default function AdminPage({
    title,
    description,
    action,
    children
}) {

    return (

        <div className="bp-page">

            <div className="bp-page-header">

                <div>

                    <h1>{title}</h1>

                    <p>{description}</p>

                </div>

                <div>

                    {action}

                </div>

            </div>

            <div className="bp-page-content">

                {children}

            </div>

        </div>

    );

}