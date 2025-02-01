import { loadStripe } from '@stripe/stripe-js';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { upgradeSubscription } from '../../apis/Api';
import Navbar from '../../components/Navbar';

// Load Stripe with the publishable key
const stripePromise = loadStripe('pk_test_51QnPjsKHS4M3pw9sso6VE94QOUdxLfCc1kvc81RVLHh5KaHV966alwedZrnPhmHiq4ZPAG4Th4VoayVWfoqqXvd800I3HZxH4k');

const Pricing = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [userId, setUserId] = useState(null); // Track logged-in user ID

    // Simulate fetching userId from localStorage or API (adjust this according to your auth implementation)
    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        setUserId(storedUserId);
    }, []);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('paymentSuccess') === 'true') {
            setShowSuccessModal(true);
            queryParams.delete('paymentSuccess');
            navigate({ search: queryParams.toString() }, { replace: true });  // Clean the URL
        }
    }, [location, navigate]);

    const handleGetStarted = () => {
        navigate('/practice');
    };

    const handleUpgrade = async (days) => {
        if (!userId) {
            alert('User not logged in.');
            return;
        }

        setLoading(true);
        try {
            const amount = days === 7 ? 1099 : 1499;
            const response = await upgradeSubscription({ amount, plan: `${days}-days`, userId });

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
                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">Free Questions</h5>
                                    <button className="btn btn-primary mt-3" onClick={handleGetStarted}>
                                        Get Started
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">7 Days Unlimited Access</h5>
                                    <p>NPR 1099</p>
                                    <button className="btn btn-warning mt-3" onClick={() => handleUpgrade(7)} disabled={loading}>
                                        {loading ? 'Processing...' : 'Upgrade'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">15 Days Unlimited Access</h5>
                                    <p>NPR 1499</p>
                                    <button className="btn btn-warning mt-3" onClick={() => handleUpgrade(15)} disabled={loading}>
                                        {loading ? 'Processing...' : 'Upgrade'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
