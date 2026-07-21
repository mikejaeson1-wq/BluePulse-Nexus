import "./Button.css";

export default function Button({
    children,
    variant = "primary",
    href = "",
    target = "_self",
    rel,
    onClick,
    type = "button",
    className = "",
    ...props
}) {
    const buttonClassName = [
        "button",
        `button--${variant}`,
        className
    ]
        .filter(Boolean)
        .join(" ");

    if (href) {
        const linkRel =
            target === "_blank"
                ? rel ?? "noopener noreferrer"
                : rel;

        return (
            <a
                href={href}
                target={target}
                rel={linkRel}
                className={buttonClassName}
                onClick={onClick}
                {...props}
            >
                {children}
            </a>
        );
    }

    return (
        <button
            type={type}
            className={buttonClassName}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
}