import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ManageRoom() {
    const { roomId, hotelId } = useParams();  //  roomId and hotelId from the URL params
    const [room, setRoom] = useState(null);
    const [descr, setDescr] = useState('');
    const [pricePerDay, setPricePerDay] = useState('');
    const [nBeds, setNBeds] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!roomId || !hotelId) {
            setMessage('Room ID or Hotel ID is missing');
            return;
        }

        const fetchRoomData = async () => {
            try {
                const roomResponse = await fetch(`http://127.0.0.1:5000/room/${roomId}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const roomData = await roomResponse.json();

                if (roomResponse.ok) {
                    setRoom(roomData);
                    setDescr(roomData.descr);
                    setPricePerDay(roomData.pricePerDay);
                    setNBeds(roomData.nBeds);
                } else {
                    setMessage(roomData.error || 'Error fetching room');
                }
            } catch (error) {
                setMessage('Error connecting to server');
            }
        };

        fetchRoomData();
    }, [roomId, hotelId]);
    const handleUpdateRoom = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`http://127.0.0.1:5000/room/${roomId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    descr,
                    pricePerDay,
                    nBeds,
                }),
                credentials: 'include',
            });
            const data = await response.json();

            if (response.ok) {
                setMessage('Room updated successfully');
                setRoom(data.room);
            } else {
                setMessage(data.error || 'Error updating room');
            }
        } catch (error) {
            setMessage('Error connecting to server');
        }
    };

    const handleDeleteRoom = async () => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/room/${roomId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                const data = await response.json();

                if (response.ok) {
                    setMessage('Room deleted successfully');
                    navigate(`/manage_hotel/${hotelId}`);
                } else {
                    setMessage(data.error || 'Error deleting room');
                }
            } catch (error) {
                setMessage('Error connecting to server');
            }
        }
    };

    const handleGoBackToHotel = () => {
        navigate(`/manage_hotel/${hotelId}`);
    };

    return (
        <div>
            {room ? (
                <div>
                    <h2>Manage Room: {room.roomID}</h2>
                    <form onSubmit={handleUpdateRoom} style={styles.form}>
                        <textarea
                            value={descr}
                            onChange={(e) => setDescr(e.target.value)}
                            placeholder="Description"
                            required
                            style={styles.textarea}
                        />
                        <input
                            type="number"
                            value={pricePerDay}
                            onChange={(e) => setPricePerDay(e.target.value)}
                            placeholder="Price Per Day"
                            required
                            style={styles.input}
                        />
                        <input
                            type="number"
                            value={nBeds}
                            onChange={(e) => setNBeds(e.target.value)}
                            placeholder="Number of Beds"
                            required
                            style={styles.input}
                        />
                        <button type="submit" style={styles.button}>Update Room</button>
                    </form>
                    <button onClick={handleDeleteRoom} style={styles.button}>Delete Room</button>

                    <button onClick={handleGoBackToHotel} style={styles.button}>Go Back to Hotel</button>
                </div>
            ) : (
                <p>{message || 'Loading room details...'}</p>
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
};

export default ManageRoom;
