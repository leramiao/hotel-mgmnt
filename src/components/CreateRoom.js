import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function CreateRoom() {
    const { hotelId } = useParams(); // Get hotelId from URL params
    const [name, setName] = useState('');
    const [descr, setDescription] = useState('');
    const [pricePerDay, setPrice] = useState('');
    const [nBeds, setNBeds] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleCreateRoom = async (e) => {
        e.preventDefault();

        if (!nBeds || !descr || !pricePerDay || !name) {
            setMessage('Please fill in all fields.');
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:5000/hotels/${hotelId}/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nBeds,
                    descr,
                    pricePerDay,
                    name,
                }),
                credentials: 'include',
            });
            const data = await response.json();

            if (response.ok) {
                setMessage('Room created successfully');
                navigate(`/manage_hotel/${hotelId}`); // Redirect to hotel management page
            } else {
                setMessage(data.error || 'Error creating room');
            }
        } catch (error) {
            setMessage('Error connecting to server');
        }
    };

    return (
        <div>
            <h2>Create a New Room</h2>
            <form onSubmit={handleCreateRoom} style={styles.form}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Room Name"
                    required
                    style={styles.input}
                />
                <textarea
                    value={descr}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Room Description"
                    required
                    style={styles.textarea}
                />
                <input
                    type="number"
                    value={nBeds}
                    onChange={(e) => setNBeds(e.target.value)}
                    placeholder="Number of Beds"
                    required
                    style={styles.input}
                />
                <input
                    type="number"
                    value={pricePerDay}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Price per night"
                    required
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>Create Room</button>
            </form>
            {message && <p>{message}</p>}
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

export default CreateRoom;
