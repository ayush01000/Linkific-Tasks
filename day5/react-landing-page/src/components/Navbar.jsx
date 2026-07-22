function Navbar() {
    return (
        <header className="header">
            <nav className="navbar">
                <a href="#home" className="logo">
                    MyPortfolio<span>.</span>
                </a>

                <ul className="nav-links">
                    <li><a href="#home">Home</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#skills">Skills</a></li>
                    <li><a href="#projects">Projects</a></li>
                </ul>

                <a href="#contact" className="nav-button">
                    Let's Talk
                </a>
            </nav>
        </header>
    );
}

export default Navbar;