
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import './Profile.css';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');


    const handleChangePassword = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await axios.post(
                'http://localhost:5002/api/profile/change-password',
                { oldPassword, newPassword },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setMessage(response.data.message);
            toast.success(response.data.message);
            setShowPasswordModal(false);
        } catch (error) {
            setMessage(error.response.data.message || 'Error changing password');

            toast.error(error.response.data.message);
        }
    };


    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5002/api/profile/profile', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUserData(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

 

    useEffect(() => {
        fetchProfile();
    }, []);

    if (!userData) {
        return <div>Loading...</div>;
    }

    return (
        <>
        <Navbar/>
        <div className='backgorund'>
        <img src="/profile_back.jpg" alt="bg-image" className="bg-image" />

        <div className="profile-container">
            <div className="profile-avatar">
                <img src="profile.jpg" alt="Avatar" /> {/* Display default avatar */}
            </div>
            <div className="profile-details">
                <h2>{userData.username}</h2>
                <p>{userData.email}</p>
                <h1>Your Subscription plan: Free</h1>
                <p>expire on : 8/18/2024</p>
            </div>
            <button className="btn btn-warning" onClick={() => setShowPasswordModal(true)}>Change Password</button>

            

            {showPasswordModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setShowPasswordModal(false)}>&times;</span>
                        <h2>Change Password</h2>
                        <input
                            type="text"
                            placeholder="Old Password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button type="submit" onClick={handleChangePassword}>Submit</button>
                    </div>
                </div>
            )}
        </div>
        </div>
        </>
    );
};

export default Profile;
