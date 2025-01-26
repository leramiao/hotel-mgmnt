import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminPanel() {
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/profile', {
                    method: 'GET',
                    credentials: 'include'
                });
                const data = await response.json();

                if (response.ok) {
                    if (data.role !== 'admin') {
                        navigate('/profile');  // Redirect to profile if not an admin
                    } else {
                        setMessage('Welcome to Admin Panel');
                    }
                } else {
                    setMessage('Error fetching profile data');
                    navigate('/login');
                }
            } catch (error) {
                setMessage('Error connecting to server');
                navigate('/login');
            }
        };

        checkAdmin();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/logout', {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                navigate('/login');
            } else {
                setMessage('Failed to log out');
            }
        } catch (error) {
            setMessage('Error during logout');
        }
    };

    const goToHotelManager = () => {
        navigate('/manage_hotels');
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.welcomeMessage}>{message || 'Loading admin panel...'}</h1>
                <div style={styles.buttonContainer}>
                    <button onClick={handleLogout} style={styles.button}>
                        Logout
                    </button>
                    <button onClick={goToHotelManager} style={styles.button}>
                        Go to Hotel Manager
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#f4f7fa',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    header: {
        textAlign: 'center',
        marginBottom: '20px',
    },
    welcomeMessage: {
        fontSize: '24px',
        color: '#333',
    },
    buttonContainer: {
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s',
    },
    buttonHover: {
        backgroundColor: '#2980b9',
    }
};

export default AdminPanel;
