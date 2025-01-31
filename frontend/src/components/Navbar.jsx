import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Import custom CSS

const Navbar = () => {
    const [userName, setUserName] = useState();

    // Retrieve user data from local storage
    const user = JSON.parse(localStorage.getItem('username'));

    // Logout function to clear user data and redirect to login page
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    useEffect(() => {
        setUserName(localStorage.getItem('userData'));
    }, []);

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-glass">
                <div className="container-fluid">
                    {/* Logo */}
                    <img src="uplingoologo.png" alt="home" width="70px" className="navbar-logo" />

                    {/* Toggler button for mobile view */}
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Navbar links */}
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link" to="/home">Home</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/practice">Practice</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/pricing">Pricing</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/about">About us</Link>
                            </li>
                        </ul>

                        {/* User login/logout buttons */}
                        <form className="d-flex" role="search">
                            {userName ? (
                                <>
                                    {/* Dropdown menu for logged-in user */}
                                    <div className="dropdown">
                                        <button className="btn btn-secondary dropdown-toggle user-dropdown" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            Welcome, {userName}
                                        </button>
                                        <ul className="dropdown-menu">
                                            <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                                            <li><button onClick={handleLogout} className="dropdown-item">Logout</button></li>
                                        </ul>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Register and login buttons for guests */}
                                    <Link to={'/register'} className="btn btn-outline-light btn-highlight me-2" type="submit">Register</Link>
                                    <Link to={'/'} className="btn btn-outline-light btn-highlight" type="submit">Login</Link>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
