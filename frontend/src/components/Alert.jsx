import React, { useEffect } from 'react';

// Alert component to display a message with a success or error type
const Alert = ({ message, type, onClose }) => {
    useEffect(() => {
        if (message) {
            // Play the appropriate sound based on the alert type
            const audio = new Audio(type === 'success' ? '/success.mp3' : '/error.mp3');
            audio.play();

            // Set a timer to automatically close the alert after 3 seconds
            const timer = setTimeout(() => {
                onClose();
            }, 3000);

            // Cleanup the timer when the component unmounts or dependencies change
            return () => clearTimeout(timer);
        }
    }, [message, type, onClose]);

    return (
        // Render the alert only if there is a message
        message && (
            <div style={{ ...styles.alert, ...styles[type] }}>
                <span style={styles.icon}>
                    {type === 'success' ? '✔️' : '❌'}
                </span>
                {message}
                <button onClick={onClose} style={styles.closeButton}>x</button>
            </div>
        )
    );
};

// Styles object for the alert component
const styles = {
    alert: {
        position: 'fixed', // Fixed positioning to stay in place
        top: '20px', // Position from the top of the viewport
        right: '20px', // Position from the right of the viewport
        padding: '15px 20px', // Padding inside the alert
        borderRadius: '5px', // Rounded corners
        display: 'flex', // Flexbox layout
        alignItems: 'center', // Center items vertically
        justifyContent: 'space-between', // Space between items horizontally
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Box shadow for a slight elevation effect
        zIndex: 1000, // Ensure the alert is above other elements
    },
    success: {
        backgroundColor: '#d4edda', // Light green background for success
        color: '#155724', // Dark green text for success
    },
    danger: {
        backgroundColor: '#f8d7da', // Light red background for error
        color: '#721c24', // Dark red text for error
    },
    icon: {
        marginRight: '10px', // Space between the icon and the message
    },
    closeButton: {
        background: 'none', // No background for the button
        border: 'none', // No border for the button
        color: 'inherit', // Inherit the text color
        cursor: 'pointer', // Pointer cursor on hover
        fontSize: '16px', // Font size for the button text
    },
};

export default Alert;
