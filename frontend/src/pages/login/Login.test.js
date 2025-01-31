import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { toast } from 'react-toastify';
import Login from './login';
import { loginUser } from '../../apis/Api';

jest.mock('../../apis/Api', () => ({
    loginUser: jest.fn()
}));

jest.mock('react-toastify', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn()
    }
}));

beforeEach(() => {
    // Mock localStorage functions
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.clear = jest.fn();
});

describe('Login Component', () => {
    test('renders Login component correctly', () => {
        render(
            <Router>
                <Login />
            </Router>
        );

        expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    });

    test('shows error if fields are empty', () => {
        render(
            <Router>
                <Login />
            </Router>
        );

        fireEvent.click(screen.getByRole('button', { name: /Login/i }));
        expect(toast.error).toHaveBeenCalledWith('All fields are required');
    });

    test('handles login with correct credentials', async () => {
        loginUser.mockResolvedValue({
            data: {
                success: true,
                userData: { username: 'testUser' },
                token: 'testToken'
            }
        });

        render(
            <Router>
                <Login />
            </Router>
        );

        fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /Login/i }));

        await waitFor(() => {
            expect(localStorage.setItem).toHaveBeenCalledWith('userData', 'testUser');
            expect(localStorage.setItem).toHaveBeenCalledWith('token', 'testToken');
            expect(toast.success).toHaveBeenCalledWith('Login successful');
        });
    });

    test('shows error on failed login', async () => {
        loginUser.mockResolvedValue({
            data: {
                success: false,
                message: 'Invalid credentials'
            }
        });

        render(
            <Router>
                <Login />
            </Router>
        );

        fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'wrongpassword' } });
        fireEvent.click(screen.getByRole('button', { name: /Login/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
        });
    });

});
