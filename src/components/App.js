import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './Home';
import Register from './Register';
import Login from './Login';
import Profile from './Profile';
import Hotels from './Hotels';
import AdminPanel from './AdminPanel';
import HotelManager from './HotelManager';
import ManageHotel from './ManageHotel';
import HotelDetails from './HotelDetails';
import RoomDetails from './RoomDetails';
import ManageRoom from './ManageRoom';
import CreateRoom from './CreateRoom';
import EditReservation from './EditReservation';
import ManageReservations from './ManageReservations';

function App() {
  return (
    <div className="App">
      <h1 className="text-center text-4xl my-4">Hotel Management System</h1>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/hotel/:hotelId" element={<HotelDetails />} />
        <Route path="/panel" element={<AdminPanel />} />
        <Route path="/manage_hotels" element={<HotelManager />} />
        <Route path="/manage_hotel/:hotelId" element={<ManageHotel />} />
        <Route path="/manage_room/:roomId/:hotelId" element={<ManageRoom />} />
        <Route path="/room/:hotelId/:roomId" element={<RoomDetails />} />
        <Route path="/create_room/:hotelId" element={<CreateRoom />} />
        <Route path="/edit-reservation/:resId" element={<EditReservation />} />
        <Route path="/manage_reservations/:hotelId/:roomId" element={<ManageReservations />} />

      </Routes>
    </div>
  );
}

export default App;
