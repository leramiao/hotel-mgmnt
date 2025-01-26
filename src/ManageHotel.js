import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ManageHotel() {
    const { hotelId } = useParams();
    const [hotel, setHotel] = useState(null);
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [descr, setDescr] = useState('');
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
                    setName(hotelData.name);
                    setAddress(hotelData.address);
                    setCity(hotelData.city);
                    setDescr(hotelData.descr);

                    const roomsResponse = await fetch(`http://127.0.0.1:5000/hotels/${hotelId}/rooms`, {
                        method: 'GET',
                        credentials: 'include',
                    });
                    const roomsData = await roomsResponse.json();

                    if (roomsResponse.ok) {
                        setHotel((prevHotel) => ({
                            ...prevHotel,
                            rooms: roomsData.rooms,
                        }));
                    } else {
                        setMessage(roomsData.error || 'Error fetching rooms');
                    }
                } else {
                    setMessage(hotelData.error || 'Error fetching hotel');
                }
            } catch (error) {
                setMessage('Error connecting to server');
            }
        };

        fetchHotelData();
    }, [hotelId]);

    const handleUpdateHotel = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`http://127.0.0.1:5000/hotels/${hotelId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    address,
                    city,
                    descr,
                }),
                credentials: 'include',
            });
            const data = await response.json();

            if (response.ok) {
                setMessage('Hotel updated successfully');
                setHotel(data.hotel);
            } else {
                setMessage(data.error || 'Error updating hotel');
            }
        } catch (error) {
            setMessage('Error connecting to server');
        }
    };

    const handleDeleteHotel = async () => {
        if (window.confirm('Are you sure you want to delete this hotel?')) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/hotels/${hotelId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                const data = await response.json();

                if (response.ok) {
                    setMessage('Hotel deleted successfully');
                    navigate('/manage_hotels');  // Redirect back to the hotel management page
                } else {
                    setMessage(data.error || 'Error deleting hotel');
                }
            } catch (error) {
                setMessage('Error connecting to server');
            }
        }
    };

    const handleRoomEdit = (roomId) => {
        navigate(`/manage_room/${roomId}/${hotelId}`);
    };

    const handleCreateRoom = () => {
        navigate(`/create_room/${hotelId}`);
    };

    const handleManageReservations = (roomId) => {
        navigate(`/manage_reservations/${hotelId}/${roomId}`);
    };

    const handleBackToManageHotels = () => {
        navigate('/manage_hotels');
    };

    return (
        <div>
            {hotel ? (
                <div>
                    <h2>Manage Hotel: {hotel.name}</h2>
                    <form onSubmit={handleUpdateHotel} style={styles.form}>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Hotel Name"
                            required
                            style={styles.input}
                        />
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Hotel Address"
                            required
                            style={styles.input}
                        />
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="City"
                            required
                            style={styles.input}
                        />
                        <textarea
                            value={descr}
                            onChange={(e) => setDescr(e.target.value)}
                            placeholder="Description"
                            required
                            style={styles.textarea}
                        />
                        <button type="submit" style={styles.button}>Update Hotel</button>
                    </form>
                    <button onClick={handleDeleteHotel} style={styles.button}>Delete Hotel</button>

                    <h3 style={styles.roomsTitle}>Rooms</h3>
                    {hotel.rooms && hotel.rooms.length > 0 ? (
                        <ul style={styles.roomsList}>
                            {hotel.rooms.map((room) => (
                                <li key={room.roomID} style={styles.roomItem}>
                                    <div style={styles.roomInfo}>
                                        <h4 style={styles.roomName}>{room.name}</h4>
                                        <p style={styles.roomDetails}>
                                            {room.descr} | ${parseFloat(room.pricePerDay).toFixed(2)} per night
                                        </p>
                                        <button
                                            onClick={() => handleRoomEdit(room.roomID)}
                                            style={styles.roomButton}
                                        >
                                            Edit Room
                                        </button>
                                        <button
                                            onClick={() => handleManageReservations(room.roomID)}
                                            style={{ ...styles.roomButton, backgroundColor: '#8e44ad' }}
                                        >
                                            Manage Reservations
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={styles.noRoomsMessage}>No rooms available at the moment.</p>
                    )}

                    <button onClick={handleCreateRoom} style={styles.button}>Create New Room</button>

                    <button onClick={handleBackToManageHotels} style={styles.button}>Back to Manage Hotels</button>
                </div>
            ) : (
                <p>{message || 'Loading hotel details...'}</p>
            )}
        </div>
    );
}

const styles = {
    form: {
        marginBottom: '30px',
    },
    input: {
        width: '100%',
        padding: '12px',
        margin: '10px 0',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '1rem',
        outline: 'none',
    },
    textarea: {
        width: '100%',
        padding: '12px',
        margin: '10px 0',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '1rem',
        outline: 'none',
        resize: 'vertical',
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
    roomsTitle: {
        fontSize: '24px',
        marginTop: '20px',
        color: '#2c3e50',
    },
    roomsList: {
        listStyleType: 'none',
        padding: 0,
    },
    roomItem: {
        backgroundColor: '#f9f9f9',
        padding: '15px',
        marginBottom: '10px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    roomInfo: {
        textAlign: 'left',
    },
    roomName: {
        fontSize: '22px',
        color: '#34495e',
    },
    roomDetails: {
        fontSize: '16px',
        color: '#7f8c8d',
        marginBottom: '10px',
    },
    roomButton: {
        padding: '10px 20px',
        backgroundColor: '#e67e22',
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
};

export default ManageHotel;
