import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HotelManager() {
    const [hotels, setHotels] = useState([]);
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [descr, setDescr] = useState('');
    const [userRole, setUserRole] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/hotels', {
                    method: 'GET',
                    credentials: 'include'
                });
                const data = await response.json();
                if (response.ok) {
                    setHotels(data.hotels);
                } else {
                    setMessage(data.error || 'Error fetching hotels');
                }
            } catch (error) {
                setMessage('Error connecting to server');
            }
        };

        const fetchUserRole = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/profile', {
                    method: 'GET',
                    credentials: 'include'
                });
                const data = await response.json();
                if (response.ok && data.role === 'admin') {
                    setUserRole('admin');
                } else {
                    setUserRole('user');
                    navigate('/');
                }
            } catch (error) {
                setMessage('Error fetching user profile');
                navigate('/login');
            }
        };

        fetchHotels();
        fetchUserRole();
    }, [navigate]);

    const handleAddHotel = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://127.0.0.1:5000/hotels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, address, city, descr }),
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                setHotels([...hotels, data.hotel]);
                setMessage('Hotel added successfully');
                setName('');
                setAddress('');
                setCity('');
                setDescr('');
            } else {
                setMessage(data.error || 'Error adding hotel');
            }
        } catch (error) {
            setMessage('Error connecting to server');
        }
    };

    const handleEditHotel = (hotelId) => {
        navigate(`/manage_hotel/${hotelId}`);
    };

    const handleDeleteHotel = async (hotelId) => {
        if (window.confirm('Are you sure you want to delete this hotel?')) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/hotels/${hotelId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                const data = await response.json();
                if (response.ok) {
                    setHotels(hotels.filter(hotel => hotel.hotelID !== hotelId));
                    setMessage('Hotel deleted successfully');
                } else {
                    setMessage(data.error || 'Error deleting hotel');
                }
            } catch (error) {
                setMessage('Error connecting to server');
            }
        }
    };

    const handleGoBack = () => {
        navigate('/panel');
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Hotel Manager</h1>
            <button onClick={handleGoBack} style={styles.button}>Go Back to Panel</button>
            <form onSubmit={handleAddHotel} style={styles.form}>
                <h3>Add New Hotel</h3>
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
                <button type="submit" style={styles.button}>Add Hotel</button>
            </form>

            {message && <p style={styles.message}>{message}</p>}

            <h3>Existing Hotels</h3>
            <div>
                {hotels.length > 0 ? (
                    hotels.map(hotel => (
                        <div key={hotel.hotelID} style={styles.hotelCard}>
                            <h4>{hotel.name}</h4>
                            <p>{hotel.address}</p>
                            <p>{hotel.city}</p>
                            <p>{hotel.descr}</p>
                            <button onClick={() => handleEditHotel(hotel.hotelID)} style={styles.button}>Edit</button>
                            <button onClick={() => handleDeleteHotel(hotel.hotelID)} style={styles.button}>Delete</button>
                        </div>
                    ))
                ) : (
                    <p>No hotels available</p>
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
        maxWidth: '900px',
        margin: '0 auto',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    header: {
        textAlign: 'center',
        marginBottom: '20px',
    },
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
        marginRight: '10px',
        marginTop: '10px',
    },
    message: {
        color: 'green',
        textAlign: 'center',
        marginTop: '20px',
    },
    hotelCard: {
        backgroundColor: '#fff',
        padding: '15px',
        margin: '10px 0',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    },
};

export default HotelManager;
