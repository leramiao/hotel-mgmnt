import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Hotels() {
    const [hotels, setHotels] = useState([]);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/hotels', {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();

                if (response.ok && Array.isArray(data.hotels)) {
                    setHotels(data.hotels);
                } else {
                    setMessage(data.error || 'Error loading hotels list');
                }
            } catch (error) {
                setMessage('Error connecting to server');
            }
        };

        fetchHotels();
    }, []);

    const handleHotelClick = (hotelId) => {
        navigate(`/hotel/${hotelId}`);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Hotel List</h1>
                {message && <p style={styles.errorMessage}>{message}</p>}
                <div style={styles.hotelsContainer}>
                    {hotels.length > 0 ? (
                        <ul style={styles.hotelsList}>
                            {hotels.map((hotel) => (
                                <li key={hotel.hotelID} style={styles.hotelItem}>
                                    <div style={styles.hotelInfo}>
                                        <h2 style={styles.hotelName}>{hotel.name}</h2>
                                        <p style={styles.hotelLocation}>{hotel.city}</p>
                                        <button
                                            onClick={() => handleHotelClick(hotel.hotelID)}
                                            style={styles.button}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={styles.noHotelsMessage}>No hotels available at the moment.</p>
                    )}
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
    title: {
        fontSize: '24px',
        color: '#333',
    },
    hotelsContainer: {
        marginTop: '20px',
    },
    hotelsList: {
        listStyleType: 'none',
        padding: 0,
    },
    hotelItem: {
        backgroundColor: 'white',
        padding: '15px',
        marginBottom: '15px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    hotelInfo: {
        textAlign: 'center',
    },
    hotelName: {
        fontSize: '22px',
        color: '#2c3e50',
    },
    hotelLocation: {
        fontSize: '16px',
        color: '#7f8c8d',
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
        marginTop: '10px',
    },
    errorMessage: {
        color: 'red',
        fontSize: '16px',
    },
    noHotelsMessage: {
        fontSize: '16px',
        color: '#7f8c8d',
    },
};

export default Hotels;
