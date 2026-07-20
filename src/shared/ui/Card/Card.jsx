import "./Card.css";

export default function Card({

    children,

    className = ""

}) {

    return (

        <div

            className={`bp-card ${className}`}

        >

            {children}

        </div>

    );

}