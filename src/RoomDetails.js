import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function RoomDetails() {
    const { hotelId, roomId } = useParams();  // Get hotelId and roomId from URL
    const [room, setRoom] = useState(null);
    const [hotel, setHotel] = useState(null);
    const [message, setMessage] = useState('');
    const [reservationData, setReservationData] = useState({
        checkInDate: '',
        checkOutDate: '',
        guests: 1,
    });
    const [reservationMessage, setReservationMessage] = useState('');

    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                // Fetch hotel details
                const hotelResponse = await fetch(`http://127.0.0.1:5000/hotels/${hotelId}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const hotelData = await hotelResponse.json();

                if (hotelResponse.ok) {
                    setHotel(hotelData);
                } else {
                    setMessage(hotelData.error || 'Error fetching hotel details');
                }

                const roomResponse = await fetch(`http://127.0.0.1:5000/room/${roomId}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const roomData = await roomResponse.json();

                if (roomResponse.ok) {
                    setRoom(roomData);
                } else {
                    setMessage(roomData.error || 'Error fetching room details');
                }
            } catch (error) {
                setMessage('Error connecting to server');
            }
        };

        fetchRoomData();
    }, [hotelId, roomId]);

    const handleReservationChange = (e) => {
        const { name, value } = e.target;
        setReservationData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleReservationSubmit = async (e) => {
        e.preventDefault();
        const { checkInDate, checkOutDate, guests } = reservationData;

        if (!checkInDate || !checkOutDate) {
            setReservationMessage('Please provide both check-in and check-out dates');
            return;
        }

        const reservationPayload = {
            roomId: roomId,
            hotelId: hotelId,
            checkInDate,
            checkOutDate,
            guests,
        };

        try {
            const response = await fetch('http://127.0.0.1:5000/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(reservationPayload),
            });

            const data = await response.json();

            if (response.ok) {
                setReservationMessage('Reservation successful! You will receive a confirmation email.');
            } else {
                setReservationMessage(data.error || 'Error making the reservation');
            }
        } catch (error) {
            setReservationMessage('Error connecting to server');
        }
    };

    return (
        <div style={styles.container}>
            {room && hotel ? (
                <div style={styles.detailsCard}>
                    <h2 style={styles.roomName}>Room {room.roomID} at {hotel.name}</h2>
                    <p style={styles.text}>Description: {room.descr}</p>
                    <p style={styles.text}>Beds: {room.nBeds}</p>
                    <p style={styles.text}>Price: ${room.pricePerDay} per night</p>
                    <p style={styles.text}>Hotel: {hotel.name} - {hotel.address}, {hotel.city}</p>

                    {/* Reservation Form */}
                    <div style={styles.reservationForm}>
                        <h3 style={styles.reservationTitle}>Make a Reservation</h3>
                        <form onSubmit={handleReservationSubmit} style={styles.form}>
                            <label htmlFor="checkInDate">Check-in Date:</label>
                            <input
                                type="date"
                                id="checkInDate"
                                name="checkInDate"
                                value={reservationData.checkInDate}
                                onChange={handleReservationChange}
                                style={styles.input}
                            />

                            <label htmlFor="checkOutDate">Check-out Date:</label>
                            <input
                                type="date"
                                id="checkOutDate"
                                name="checkOutDate"
                                value={reservationData.checkOutDate}
                                onChange={handleReservationChange}
                                style={styles.input}
                            />

                            <label htmlFor="guests">Number of Guests:</label>
                            <input
                                type="number"
                                id="guests"
                                name="guests"
                                min="1"
                                value={reservationData.guests}
                                onChange={handleReservationChange}
                                style={styles.input}
                            />

                            <button type="submit" style={styles.reservationButton}>
                                Make Reservation
                            </button>
                        </form>

                        {reservationMessage && (
                            <p style={styles.reservationMessage}>{reservationMessage}</p>
                        )}
                    </div>

                    <button onClick={() => window.history.back()} style={styles.button}>Go Back</button>
                </div>
            ) : (
                <p style={styles.errorMessage}>{message || 'Loading room details...'}</p>
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
    roomName: {
        fontSize: '26px',
        color: '#2c3e50',
        marginBottom: '10px',
    },
    text: {
        fontSize: '18px',
        color: '#7f8c8d',
        marginBottom: '10px',
    },
    reservationForm: {
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
    },
    reservationTitle: {
        fontSize: '24px',
        marginBottom: '15px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        padding: '10px',
        marginBottom: '15px',
        fontSize: '16px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    reservationButton: {
        padding: '12px 25px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s',
    },
    reservationMessage: {
        marginTop: '15px',
        fontSize: '18px',
        color: '#2ecc71',
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

export default RoomDetails;
