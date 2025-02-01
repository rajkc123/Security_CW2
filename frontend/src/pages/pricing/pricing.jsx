import { loadStripe } from '@stripe/stripe-js';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { upgradeSubscription } from '../../apis/Api'; // API call for creating payment intent
import Navbar from '../../components/Navbar';
import { Modal, Button } from 'react-bootstrap'; // Import Bootstrap Modal

// Load Stripe with publishable key
const stripePromise = loadStripe('pk_test_51QnPjsKHS4M3pw9sso6VE94QOUdxLfCc1kvc81RVLHh5KaHV966alwedZrnPhmHiq4ZPAG4Th4VoayVWfoqqXvd800I3HZxH4k');

const Pricing = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Check for the `paymentSuccess` parameter and display the success modal
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('paymentSuccess') === 'true') {
            setShowSuccessModal(true);
        }
    }, [location]);

    // Handle the free plan (no payment required)
    const handleGetStarted = () => {
        navigate('/practice');
    };

    // Handle upgrading to a paid plan using Stripe
    const handleUpgrade = async (days) => {
        setLoading(true);
        try {
            const amount = days === 7 ? 1099 : 1499; // Set the amount based on the plan
            const response = await upgradeSubscription({ amount, plan: `${days}-days` });

            if (response.data.success) {
                const stripe = await stripePromise;
                await stripe.redirectToCheckout({ sessionId: response.data.sessionId });
            } else {
                alert('Failed to initiate payment. Please try again.');
            }
        } catch (error) {
            console.error('Payment initiation failed:', error);
            alert('Payment initiation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <div className="background">
                <img src="/profile_back.jpg" alt="bg-image" className="bg-image" />

                <div className="container text-center my-5">
                    <h1 className="mb-3">Start your practice for free!</h1>
                    <p className="lead mb-4">For unlimited Practice Questions, Upgrade to Premium.</p>
                    <hr className="mb-5" />
                    <div className="row">
                        {/* Free Plan Card */}
                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm" style={{ borderRadius: '15px', border: 'none' }}>
                                <div className="card-body">
                                    <img src="/free-questions-icon.png" alt="Free Questions" className="mb-3" style={{ width: '50px' }} />
                                    <h5 className="card-title" style={{ fontSize: '1.5rem', marginTop: '1rem' }}>Free Questions</h5>
                                    <button className="btn btn-primary mt-3" onClick={handleGetStarted}>Get Started</button>
                                </div>
                            </div>
                        </div>

                        {/* 7-Days Plan Card */}
                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm" style={{ borderRadius: '15px', border: 'none' }}>
                                <div className="card-body">
                                    <img src="/7-days-icon.png" alt="7 Days Access" className="mb-3" style={{ width: '50px' }} />
                                    <h5 className="card-title" style={{ fontSize: '1.5rem', marginTop: '1rem' }}>Unlimited Access <br /> 7 Days</h5>
                                    <p className="card-text" style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>NPR 1099</p>
                                    <button 
                                        className="btn btn-warning mt-3" 
                                        onClick={() => handleUpgrade(7)}
                                        disabled={loading}
                                    >
                                        {loading ? 'Processing...' : 'Upgrade'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 15-Days Plan Card */}
                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm" style={{ borderRadius: '15px', border: 'none' }}>
                                <div className="card-body">
                                    <img src="/15-days-icon.png" alt="15 Days Access" className="mb-3" style={{ width: '50px' }} />
                                    <h5 className="card-title" style={{ fontSize: '1.5rem', marginTop: '1rem' }}>Unlimited Access <br /> 15 Days</h5>
                                    <p className="card-text" style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>NPR 1499</p>
                                    <button 
                                        className="btn btn-warning mt-3" 
                                        onClick={() => handleUpgrade(15)}
                                        disabled={loading}
                                    >
                                        {loading ? 'Processing...' : 'Upgrade'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Success</Modal.Title>
                </Modal.Header>
                <Modal.Body>Your subscription has been purchased successfully!</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default Pricing;
