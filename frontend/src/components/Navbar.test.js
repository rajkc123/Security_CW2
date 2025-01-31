import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from './Navbar';
import { BrowserRouter as Router } from 'react-router-dom';

describe('Navbar Component', () => {
    beforeEach(() => {
        // Clear the local storage before each test
        localStorage.clear();
    });

    test('renders Navbar with Home link', () => {
        render(
            <Router>
                <Navbar />
            </Router>
        );
        expect(screen.getByText(/Home/i)).toBeInTheDocument();
    });

    test('renders Register and Login buttons when user is not logged in', () => {
        render(
            <Router>
                <Navbar />
            </Router>
        );
        expect(screen.getByText(/Register/i)).toBeInTheDocument();
        expect(screen.getByText(/Login/i)).toBeInTheDocument();
    });

    test('renders Welcome message and Logout button when user is logged in', () => {
        localStorage.setItem('userData', 'Test User');
        render(
            <Router>
                <Navbar />
            </Router>
        );
        expect(screen.getByText(/Welcome, Test User/i)).toBeInTheDocument();
        expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    });

    test('logs out user when Logout button is clicked', () => {
        localStorage.setItem('userData', 'Test User');
        delete window.location;
        window.location = { href: '' }; // Mocking window.location

        render(
            <Router>
                <Navbar />
            </Router>
        );

        const logoutButton = screen.getByText(/Logout/i);
        fireEvent.click(logoutButton);

        expect(localStorage.getItem('userData')).toBeNull(); // Ensure local storage is cleared
        expect(window.location.href).toContain('/login'); // Ensure redirect to login page
    });
});
