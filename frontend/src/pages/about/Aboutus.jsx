import React from 'react';
import Navbar from '../../components/Navbar';
import './AboutUs.css'; // Import the custom CSS for this component

const AboutUs = () => {
    return (
        <>
            <Navbar />
            <div className='background'>

                <img src="/profile_back.jpg" alt="bg-image" className="bg-image" />


                <div className="about-us-section">
                    <h2>About Uplingoo</h2>
                    <p>At Uplingoo, our mission is to help students achieve their best possible scores in the Duolingo English Test. We provide personalized learning paths, realistic practice tests, and instant feedback to guide you on your journey to success.</p>
                    <img src="path_to_your_image" alt="Students learning" className="about-image" />
                </div>

                

                {/* Features Section */}
                <div className='background'>
                    <img src="/profile_back.jpg" alt="bg-image" className="bg-image" />


                <div className="features-section">
                


                    <h2>Our Features</h2>
                    <div className="features-grid">
                        <div className="feature-item">
                            <img src="path_to_icon_1" alt="Personalized Learning Paths" />
                            <h3>Personalized Learning Paths</h3>
                            <p>Tailored study plans that adapt to your learning needs.</p>
                        </div>
                        <div className="feature-item">
                            <img src="path_to_icon_2" alt="Realistic Practice Tests" />
                            <h3>Realistic Practice Tests</h3>
                            <p>Practice tests that closely resemble the actual Duolingo English Test.</p>
                        </div>
                        
                        <div className="feature-item">
                            <img src="path_to_icon_4" alt="Track Your Progress" />
                            <h3>Track Your Progress</h3>
                            <p>Monitor your improvements over time with detailed reports.</p>
                        </div>
                    </div>
                </div>
                </div>

                {/* Call to Action Section */}
                <div className="cta-section">
                    <h2>Ready to Start Your Journey?</h2>
                    <button className="cta-button">Join Uplingoo Today</button>
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

export default AboutUs;
