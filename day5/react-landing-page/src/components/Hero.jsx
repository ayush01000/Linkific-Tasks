function Hero() {
    return (
        <main className="hero" id="home">
            <div className="hero-content">
                <p className="availability">
                    <span></span>
                    hey, This is Ayush.dev
                </p>

                <h1>
                    Building reliable backend systems and
                    <strong> modern web experiences.</strong>
                </h1>

                <p className="hero-description">
                    I’m a full-stack developer skilled in Python, Django, React and
                    machine learning. I build secure REST APIs, intelligent data-driven
                    solutions and responsive web applications using SQL, Git and Docker.
                </p>

                <div className="hero-buttons">
                    <a href="#projects" className="primary-button">
                        View my work
                    </a>

                    <a
                        href="https://github.com/ayush01000"
                        target="_blank"
                        rel="noreferrer"
                        className="secondary-button"
                    >
                        Visit GitHub
                    </a>
                </div>

                <div className="hero-stats">
                    <div>
                        <strong>10+</strong>
                        <span>Projects</span>
                    </div>

                    <div>
                        <strong>Python</strong>
                        <span>Main language</span>
                    </div>

                    <div>
                        <strong>Django</strong>
                        <span>Backend framework</span>
                    </div>
                </div>
            </div>

            <div className="profile-wrapper">
                <div className="decoration decoration-one"></div>
                <div className="decoration decoration-two"></div>

                <div className="profile-card">
                    <div className="profile-image">
                        <span>AS</span>
                    </div>

                    <div className="profile-information">
                        <p>Hello, I'm</p>
                        <h2>Ayush Kumar Singh</h2>
                        <h3>Backend Developer</h3>

                        <div className="technology-list">
                            <span>Python</span>
                            <span>Django</span>
                            <span>React</span>
                            <span>REST API</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Hero;