import "./Navbar.css";

export default function Navbar() {

    return (

        <header className="navbar">

            <div className="navbar__logo">

                <span className="logo-blue">Blue</span>Pulse

            </div>

            <nav>

                <a href="#">Start</a>

                <a href="#">Über uns</a>

                <a href="#">Projekte</a>

                <a href="#">Mitmachen</a>

                <a href="#">Kontakt</a>

            </nav>

            <button className="navbar__button">

                Spenden

            </button>

        </header>

    );

}