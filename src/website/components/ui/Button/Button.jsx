import "./Button.css";

export default function Button({
    children,
    variant = "primary",
    onClick,
    type = "button"
}) {

    return (

        <button
            type={type}
            className={`button button--${variant}`}
            onClick={onClick}
        >

            {children}

        </button>

    );

}