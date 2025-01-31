import React from 'react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import './homepage.css'; // Import custom CSS for this component

const HomePage = () => {
    const navigate = useNavigate();

        const handleGetStarted = () => {
            navigate('/practice');
        };
    return (


        
        <>
            <Navbar />
            <div className="homepage">


                {/* Hero Section */}
                <div className="backgroundhome">
                <img src="/profile_back.jpg" alt="bg-image" className="bg-image" />

                    <div className="hero-content">
                    <img src="/uplingoologo.png" alt="bg-image" className="logo-image" />
                        <h1>Build Your Confidence</h1>
                        <p>Let us help you achieve a great score in your Duolingo English Test. Start your free practice today.</p>
                        <button className="hero-cta" onClick={handleGetStarted}>Get Started</button>
                    </div>
                    <div className="hero-background"></div>
                </div>

                {/* Introduction Section */}
                <div className="introduction-section">
                    <div className="introduction-content">
                        <h2>Why Choose Uplingoo?</h2>
                        <p>Uplingoo offers the most effective and engaging practice platform for Duolingo English Test takers. Whether you're a beginner or looking to improve your score, our personalized learning paths, realistic practice tests, and instant feedback will guide you to success.</p>
                    </div>
                    <div className="introduction-image">
                        <img src="uplingoologo.png" alt="Introduction" />
                    </div>
                </div>

                {/* Features Section */}
                <div className="features-section">
                    <h2>Our Features</h2>
                    <div className="features-grid">
                        <div className="feature-item">
                            <img src="uplingoologo.png" alt="Personalized Learning Paths" />
                            <h3>Personalized Learning Paths</h3>
                            <p>Tailored study plans that adapt to your learning needs.</p>
                        </div>
                        <div className="feature-item">
                            <img src="uplingoologo.png" alt="Realistic Practice Tests" />
                            <h3>Realistic Practice Tests</h3>
                            <p>Practice tests that closely resemble the actual Duolingo English Test.</p>
                        </div>
                        <div className="feature-item">
                            <img src="uplingoologo.png" alt="Instant Feedback" />
                            <h3>Instant Feedback</h3>
                            <p>Get immediate insights into your performance to improve quickly.</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="footer-section">
                    <div className="footer-links">
                        <a href="/practice">Practice</a>
                        <a href="/pricing">Pricing</a>
                        <a href="/about">About Us</a>
                        <a href="/contact">Contact</a>
                    </div>
                    <div className="footer-contact">
                        <p>Email: contact@uplingoo.com</p>
                        <div className="social-media-icons">
                            <a href="your_facebook_link"><img src="path_to_facebook_icon" alt="Facebook" /></a>
                            <a href="your_twitter_link"><img src="path_to_twitter_icon" alt="Twitter" /></a>
                            {/* Add more social media links as needed */}
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default HomePage;
