import "./PageCard.css";

import Button from "@shared/ui/Button/Button";

export default function PageCard({

    page,

    onEdit

}) {

    return (

        <div className="bp-page-card">

            <div>

                <h3>

                    {page.title}

                </h3>

                <p>

                    {page.slug}

                </p>

                <small>

                    {page.status}

                </small>

            </div>

            <Button

                onClick={() => onEdit(page)}

            >

                Bearbeiten

            </Button>

        </div>

    );

}