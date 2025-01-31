import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const Pricing = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/practice');
    };

    const handleUpgrade = (days) => {
        console.log(`User selected ${days} days plan.`);
        navigate('/practice');
    };

    return (
        <>
        <Navbar />

        <div className='background'>
        <img src="/profile_back.jpg" alt="bg-image" className="bg-image" />


        <div className="container text-center my-5">
            
            <h1 className="mb-3">Start your practice for free!</h1>
            <p className="lead mb-4">For unlimited Practice Questions, Upgrade to Premium.</p>
            <hr className="mb-5" />
            <div className="row">
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm" style={{ borderRadius: '15px', border: 'none' }}>
                        <div className="card-body">
                            <img src="/free-questions-icon.png" alt="Free Questions" className="mb-3" style={{ width: '50px' }} />
                            <h5 className="card-title" style={{ fontSize: '1.5rem', marginTop: '1rem' }}>Free Questions</h5>
                            <button className="btn btn-primary mt-3" style={{ backgroundColor: '#007bff', borderColor: '#007bff' }} onClick={handleGetStarted}>Get Started</button>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm" style={{ borderRadius: '15px', border: 'none' }}>
                        <div className="card-body">
                            <img src="/7-days-icon.png" alt="7 Days Access" className="mb-3" style={{ width: '50px' }} />
                            <h5 className="card-title" style={{ fontSize: '1.5rem', marginTop: '1rem' }}>Unlimited Access <br /> 7 Days</h5>
                            <p className="card-text" style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>NPR 1099</p>
                            <button className="btn btn-warning mt-3" style={{ backgroundColor: '#ff8c42', borderColor: '#ff8c42' }} onClick={() => handleUpgrade(7)}>Upgrade</button>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm" style={{ borderRadius: '15px', border: 'none' }}>
                        <div className="card-body">
                            <img src="/15-days-icon.png" alt="15 Days Access" className="mb-3" style={{ width: '50px' }} />
                            <h5 className="card-title" style={{ fontSize: '1.5rem', marginTop: '1rem' }}>Unlimited Access <br /> 15 Days</h5>
                            <p className="card-text" style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>NPR 1499</p>
                            <button className="btn btn-warning mt-3" style={{ backgroundColor: '#ff8c42', borderColor: '#ff8c42' }} onClick={() => handleUpgrade(15)}>Upgrade</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
        </>
    );
};

export default Pricing;
