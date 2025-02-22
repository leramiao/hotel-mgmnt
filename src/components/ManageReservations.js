import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns'; // Import date-fns for formatting

function ManageReservations() {
    const { hotelId, roomId } = useParams();
    const [reservations, setReservations] = useState([]);
    const [message, setMessage] = useState('');
    const [guestNames, setGuestNames] = useState({});  // State to hold guest names by guestId
    const navigate = useNavigate();

    // Fetch reservations for the room
    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/rooms/${roomId}/reservations`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();

                if (response.ok) {
                    setReservations(data.reservations);

                    // Fetch guest names for each reservation
                    const guestIds = data.reservations.map(res => res.guestId);
                    fetchGuestNames(guestIds);
                } else {
                    setMessage(data.error || 'Error fetching reservations');
                }
            } catch (error) {
                setMessage('Error connecting to server');
            }
        };

        fetchReservations();
    }, [roomId]);

    // Function to fetch guest names by guestId
    const fetchGuestNames = async (guestIds) => {
        const guestNameMap = {};

        // Fetch each guest's name
        for (const guestId of guestIds) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/guests/${guestId}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();

                if (response.ok) {
                    guestNameMap[guestId] = data.guestName;
                } else {
                    guestNameMap[guestId] = 'Unknown';  // Fallback in case guest is not found
                }
            } catch (error) {
                guestNameMap[guestId] = 'Error fetching name';
            }
        }

        // Set all guest names after fetching them
        setGuestNames(guestNameMap);
    };

    // Function to format dates
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return format(date, 'MMMM dd, yyyy'); // Format as "Month day, year" (e.g., "March 14, 2025")
    };

    const handleCancelReservation = async (reservationId) => {
        if (window.confirm('Are you sure you want to cancel this reservation?')) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/reservations/delete/${reservationId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                const data = await response.json();

                if (response.ok) {
                    setMessage('Reservation cancelled successfully');
                    setReservations((prevReservations) =>
                        prevReservations.filter((res) => res.resID !== reservationId)
                    );
                } else {
                    setMessage(data.error || 'Error canceling reservation');
                }
            } catch (error) {
                setMessage('Error connecting to server');
            }
        }
    };

    const handleBackToHotel = () => {
        navigate(`/manage_hotel/${hotelId}`);
    };

    return (
        <div>
            <h2>Manage Reservations for Room {roomId}</h2>
            {message && <p>{message}</p>}

            {reservations.length > 0 ? (
                <ul style={styles.reservationsList}>
                    {reservations.map((reservation) => (
                        <li key={reservation.resID} style={styles.reservationItem}>
                            <div style={styles.reservationInfo}>
                                <p style={styles.reservationDetails}>
                                    Guest: {guestNames[reservation.guestId] || 'Loading...'}<br />
                                    Dates: {formatDate(reservation.dateStart)} - {formatDate(reservation.dateEnd)}<br />
                                    Guests: {reservation.nGuests}
                                </p>
                                <button
                                    onClick={() => handleCancelReservation(reservation.resID)}
                                    style={styles.cancelButton}
                                >
                                    Cancel Reservation
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No reservations for this room yet.</p>
            )}

            <button onClick={handleBackToHotel} style={styles.button}>Back to Hotel Details</button>
        </div>
    );
}

const styles = {
    reservationsList: {
        listStyleType: 'none',
        padding: 0,
    },
    reservationItem: {
        backgroundColor: '#f9f9f9',
        padding: '15px',
        marginBottom: '10px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    reservationInfo: {
        textAlign: 'left',
    },
    reservationDetails: {
        fontSize: '16px',
        color: '#7f8c8d',
        marginBottom: '10px',
    },
    cancelButton: {
        padding: '10px 20px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s',
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
};

export default ManageReservations;
