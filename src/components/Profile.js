import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('');
    const [message, setMessage] = useState('');
    const [reservations, setReservations] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/profile', {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();

                if (response.ok && data.name && data.last_name) {
                    setName(data.name);
                    setLastName(data.last_name);
                    setRole(data.role);
                    setMessage(`Hello, ${data.name} ${data.last_name}`);

                    if (data.role === 'admin') {
                        navigate('/panel');  // Redirect to Admin Panel if the user is an admin
                    }
                } else {
                    setMessage(data.error || 'Error loading profile');
                }
            } catch (error) {
                setMessage('Error connecting to server');
            }
        };

        const fetchReservations = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/user/reservations', {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();

                if (response.ok && data.reservations) {
                    setReservations(data.reservations);
                } else {
                    setMessage(data.message || 'Error loading reservations');
                }
            } catch (error) {
                setMessage('Error fetching reservations');
            }
        };

        fetchProfile();
        fetchReservations();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/logout', {
                method: 'POST',
                credentials: 'include',
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

    const handleSearchNavigate = () => {
        navigate('/hotels');
    };

    const handleEditReservation = (resID, dateStart, dateEnd) => {
        navigate(`/edit-reservation/${resID}`, { state: { resID, dateStart, dateEnd } });
    };

    const isEditable = (dateStart) => {
        const today = new Date();
        const startDate = new Date(dateStart);
        const timeDiff = startDate - today;
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        return daysDiff >= 30; // Check if the reservation is at least a month away
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.welcomeMessage}>{message || 'Loading profile...'}</h1>
                {name && lastName && (
                    <div style={styles.userInfo}>
                        <div style={styles.buttonContainer}>
                            <button onClick={handleLogout} style={styles.button}>
                                Logout
                            </button>
                            <button onClick={handleSearchNavigate} style={styles.button}>
                                Browse Hotels
                            </button>
                        </div>
                    </div>
                )}

                {reservations.length > 0 && (
                    <div style={styles.reservationsContainer}>
                        <h2>Your Reservations:</h2>
                        <ul style={styles.reservationList}>
                            {reservations.map((reservation) => (
                                <li key={reservation.resID} style={styles.reservationItem}>
                                    <p><strong>Hotel:</strong> {reservation.hotelName}</p>
                                    <p><strong>Check-in Date:</strong> {reservation.dateStart}</p>
                                    <p><strong>Check-out Date:</strong> {reservation.dateEnd}</p>
                                    <p><strong>Guests:</strong> {reservation.nGuests}</p>
                                    <p><strong>Total Price:</strong> ${reservation.total_price}</p>
                                    {isEditable(reservation.dateStart) && (
                                        <button
                                            style={styles.button}
                                            onClick={() => handleEditReservation(reservation.resID, reservation.dateStart, reservation.dateEnd)}
                                        >
                                            Edit Reservation
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
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
    userInfo: {
        marginTop: '20px',
    },
    buttonContainer: {
        marginTop: '15px',
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
    },
    reservationsContainer: {
        marginTop: '30px',
    },
    reservationList: {
        listStyleType: 'none',
        padding: 0,
    },
    reservationItem: {
        padding: '10px',
        marginBottom: '10px',
        backgroundColor: '#fff',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
};

export default Profile;
