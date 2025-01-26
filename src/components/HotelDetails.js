import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function HotelDetails() {
    const { hotelId } = useParams(); // Get hotelId from URL params
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!hotelId) {
            setMessage('Hotel ID is missing');
            return;
        }

        const fetchHotelData = async () => {
            try {
                const hotelResponse = await fetch(`http://127.0.0.1:5000/hotels/${hotelId}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const hotelData = await hotelResponse.json();

                if (hotelResponse.ok) {
                    setHotel(hotelData);
                    setMessage('');
                } else {
                    setMessage(hotelData.error || 'Error fetching hotel details');
                    return;
                }

                const roomsResponse = await fetch(`http://127.0.0.1:5000/hotels/${hotelId}/rooms`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const roomsData = await roomsResponse.json();

                if (roomsResponse.ok) {
                    setRooms(roomsData.rooms);  // Update rooms state
                } else {
                    setMessage(roomsData.error || 'Error fetching rooms');
                }

            } catch (error) {
                setMessage('Error connecting to server');
            }
        };

        fetchHotelData();
    }, [hotelId]);

    const handleGoBack = () => {
        navigate('/profile');
    };

    const handleRoomClick = (roomId) => {
        navigate(`/room/${hotelId}/${roomId}`);
    };

    return (
        <div style={styles.container}>
            {hotel ? (
                <div style={styles.detailsCard}>
                    <h2 style={styles.hotelName}>Hotel Details: {hotel.name}</h2>
                    <p style={styles.text}>Address: {hotel.address}</p>
                    <p style={styles.text}>City: {hotel.city}</p>
                    <p style={styles.text}>Description: {hotel.descr}</p>

                    <h3 style={styles.roomsTitle}>Rooms</h3>
                    {rooms.length > 0 ? (
                        <ul style={styles.roomsList}>
                            {rooms.map((room) => (
                                <li key={room.roomID} style={styles.roomItem}>
                                    <div style={styles.roomInfo}>
                                        <h4 style={styles.roomName}>{room.name}</h4>
                                        <p style={styles.roomDetails}>
                                            {room.descr} | ${room.pricePerDay} per night
                                        </p>
                                        <button
                                            onClick={() => handleRoomClick(room.roomID)}
                                            style={styles.roomButton}
                                        >
                                            View Room Details
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={styles.noRoomsMessage}>No rooms available at the moment.</p>
                    )}

                    <button onClick={handleGoBack} style={styles.button}>Go Back to Profile</button>
                </div>
            ) : (
                <p style={styles.errorMessage}>{message || 'Loading hotel details...'}</p>
            )}
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#f4f7fa',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '900px',
        margin: '0 auto',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    detailsCard: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    hotelName: {
        fontSize: '26px',
        color: '#2c3e50',
        marginBottom: '10px',
    },
    text: {
        fontSize: '18px',
        color: '#7f8c8d',
        marginBottom: '10px',
    },
    roomsTitle: {
        fontSize: '24px',
        color: '#34495e',
        marginTop: '20px',
        marginBottom: '10px',
    },
    roomsList: {
        listStyleType: 'none',
        padding: 0,
        marginTop: '10px',
    },
    roomItem: {
        backgroundColor: 'white',
        padding: '15px',
        marginBottom: '15px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    roomInfo: {
        textAlign: 'left',
    },
    roomName: {
        fontSize: '22px',
        color: '#2c3e50',
        marginBottom: '10px',
    },
    roomDetails: {
        fontSize: '16px',
        color: '#7f8c8d',
        marginBottom: '10px',
    },
    roomButton: {
        padding: '10px 20px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s',
    },
    noRoomsMessage: {
        fontSize: '16px',
        color: '#7f8c8d',
    },
    button: {
        padding: '12px 25px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s',
        marginTop: '20px',
        width: '100%',
        textAlign: 'center',
    },
    errorMessage: {
        color: 'red',
        fontSize: '18px',
        textAlign: 'center',
    },
};

export default HotelDetails;
