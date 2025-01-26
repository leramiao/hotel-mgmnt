import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function EditReservation() {
    const location = useLocation();
    const navigate = useNavigate();

    const { resID, dateStart, dateEnd, nGuests } = location.state || {};

    const [newDateStart, setNewDateStart] = useState(dateStart || '');
    const [newDateEnd, setNewDateEnd] = useState(dateEnd || '');
    const [newGuests, setNewGuests] = useState(nGuests || 1);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!resID) {
            navigate('/profile');
        }
    }, [resID, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newDateStart || !newDateEnd || newGuests <= 0) {
            setMessage('Please fill out all fields correctly.');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/reservations/edit', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resID,
                    newDateStart,
                    newDateEnd,
                    newGuests,
                }),
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Reservation updated successfully!');
                navigate('/profile');
            } else {
                setMessage(data.error || 'Failed to update reservation.');
            }
        } catch (error) {
            setMessage('Error updating reservation.');
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/reservations/${resID}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Reservation deleted successfully!');
                navigate('/profile');
            } else {
                setMessage(data.error || 'Failed to delete reservation.');
            }
        } catch (error) {
            setMessage('Error deleting reservation.');
        }
    };

    const handleCancel = () => {
        navigate('/profile');
    };

    return (
        <div style={styles.container}>
            <h2>Edit Reservation</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label htmlFor="dateStart">Check-in Date</label>
                    <input
                        type="date"
                        id="dateStart"
                        value={newDateStart}
                        onChange={(e) => setNewDateStart(e.target.value)}
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label htmlFor="dateEnd">Check-out Date</label>
                    <input
                        type="date"
                        id="dateEnd"
                        value={newDateEnd}
                        onChange={(e) => setNewDateEnd(e.target.value)}
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label htmlFor="nGuests">Number of Guests</label>
                    <input
                        type="number"
                        id="nGuests"
                        value={newGuests}
                        onChange={(e) => setNewGuests(e.target.value)}
                        min="1"
                        style={styles.input}
                    />
                </div>
                {message && <p style={styles.message}>{message}</p>}
                <div style={styles.buttonContainer}>
                    <button type="submit" style={styles.button}>
                        Update Reservation
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        style={{ ...styles.button, backgroundColor: '#e74c3c' }}
                    >
                        Delete Reservation
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        style={{ ...styles.button, backgroundColor: '#f39c12' }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
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
        textAlign: 'center',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        alignItems: 'center',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    label: {
        fontSize: '16px',
        color: '#333',
    },
    input: {
        padding: '10px',
        fontSize: '16px',
        width: '100%',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    message: {
        color: '#e74c3c',
        fontSize: '14px',
        marginTop: '10px',
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
};

export default EditReservation;
