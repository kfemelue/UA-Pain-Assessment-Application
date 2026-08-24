import uaalogo from '../assets/uaalogo.png';

function Header() {
    return (
        <div>
            <header className="site-header">
                <div className="top-bar">
                    <div className="top-wrap">
                        <span className="top-brand" id="top-brand-span">THE UNIVERSITY OF ARIZONA</span>
                        <span className="top-sub" id="top-sub-span">Experimental Research Tool</span>
                        <a className="top-about" href="#" role="link">About</a>
                    </div>
                </div>

                <div className="app-hero">
                    <div className="hero-wrap">
                        <div className="brand">
                            <img src={uaalogo} alt="Arizona Anesthesia logo" />
                            <div className="brand-heading">
                                <div className="title-row">
                                    <h1>Pediatric Pain Score Detector</h1>
                                </div>
                                <span>Realtime monitoring powered by <a href="https://py-feat.org/pages/intro.html">Py-Feat</a> Expression Measurement</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </div>
    )

}

export default Header;
