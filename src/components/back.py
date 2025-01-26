from flask import Flask, request, jsonify, session, Response
import psycopg2
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'supersecretkey'
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

DB_CONFIG = {
    'dbname': 'auth_db',
    'user': 'auth_user',
    'password': 'auth',
    'host': 'localhost'
}

RES_DB_CONFIG = {
    'dbname': 'res_db',
    'user': 'res_user',
    'password': 'res',
    'host': 'localhost'
}

HOTEL_DB_CONFIG = {
     'dbname': 'hotel_db',
     'user': 'hotel_user',
     'password': 'hotel',
     'host': 'localhost'
 }

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)


def get_db_connection_hotel():
    return psycopg2.connect(**HOTEL_DB_CONFIG)

def get_db_connection_res():
    return psycopg2.connect(**RES_DB_CONFIG)

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    last_name = data.get('last_name')
    email = data.get('email')
    password = data.get('password')
    hashed_password = generate_password_hash(password)

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO users (name, last_name, email, hash_pw, register_date, role) VALUES (%s, %s, %s, %s, %s, user)',
            (name, last_name, email, hashed_password, datetime.utcnow())
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Registration successful'}), 201

    except psycopg2.Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user and check_password_hash(user[3], password):  # user[3] - to `hash_pw`
            session['user_id'] = user[0]  # user[0] - to `userid`
            return jsonify({'message': 'Login successful'})
        else:
            return jsonify({'error': 'Invalid credentials'}), 401

    except psycopg2.Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully'})

@app.route('/profile', methods=['GET'])
def profile():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT name, last_name, role FROM users WHERE userid = %s', (user_id,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user:
            return jsonify({'name': user[0], 'last_name': user[1], 'role': user[2]})
        else:
            return jsonify({'error': 'User not found'}), 404

    except psycopg2.Error as e:
        return jsonify({'error': str(e)}), 500


@app.route('/hotels', methods=['GET'])
def get_hotels():
    try:
        conn = get_db_connection_hotel()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM hotels')
        hotels = cursor.fetchall()
        cursor.close()
        conn.close()

        hotel_list = [{'hotelID': hotel[0], 'name': hotel[1], 'address': hotel[2], 'city': hotel[3], 'descr': hotel[4]} for hotel in hotels]
        return jsonify({'hotels': hotel_list})

    except psycopg2.Error as e:
        return jsonify({'error': str(e)}), 500

# Get details of a specific hotel
@app.route('/hotels/<int:hotel_id>', methods=['GET'])
def get_hotel(hotel_id):
    try:
        conn = get_db_connection_hotel()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM hotels WHERE hotelID = %s', (hotel_id,))
        hotel = cursor.fetchone()
        cursor.close()
        conn.close()

        if hotel:
            hotel_data = {
                'hotelID': hotel[0],
                'name': hotel[1],
                'address': hotel[2],
                'city': hotel[3],
                'descr': hotel[4]
            }
            return jsonify(hotel_data)
        else:
            return jsonify({'error': 'Hotel not found'}), 404

    except psycopg2.Error as e:
        return jsonify({'error': str(e)}), 500

# Get rooms for a specific hotel
@app.route('/hotels/<int:hotel_id>/rooms', methods=['GET'])
def get_rooms(hotel_id):
    try:
        conn = get_db_connection_hotel()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM rooms WHERE hotelID = %s', (hotel_id,))
        rooms = cursor.fetchall()
        cursor.close()
        conn.close()

        if rooms:
            room_list = [{'roomID': room[0], 'hotelID': room[1], 'nBeds': room[2], 'descr': room[3], 'pricePerDay': room[4], 'name': room[5]} for room in rooms]
            return jsonify({'rooms': room_list})
        else:
            return jsonify({'error': 'No rooms found for this hotel'}), 404

    except psycopg2.Error as e:
        return jsonify({'error': str(e)}), 500
@app.route('/hotels', methods=['POST'])
def add_hotel():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401

    # Only allow admins to add hotels
    #role = session.get('role')
    #if role != 'admin':
    #    return jsonify({'error': 'Permission denied'}), 403

    data = request.json
    name = data.get('name')
    address = data.get('address')
    city = data.get('city')
    descr = data.get('descr')

    try:
        conn = get_db_connection_hotel()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO hotels (name, address, city, descr) VALUES (%s, %s, %s, %s) RETURNING hotelID',
            (name, address, city, descr)
        )
        hotel_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            'message': 'Hotel added successfully',
            'hotel': {'hotelID': hotel_id, 'name': name, 'address': address, 'city': city, 'descr': descr}
        })

    except psycopg2.Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/hotels/<int:hotel_id>', methods=['PUT'])
def edit_hotel(hotel_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401

    # Only allow admins to edit hotels
    #role = session.get('role')
    #if role != 'admin':
    #    return jsonify({'error': 'Permission denied'}), 403

    data = request.json
    name = data.get('name')
    address = data.get('address')
    city = data.get('city')
    descr = data.get('descr')

    try:
        conn = get_db_connection_hotel()
        cursor = conn.cursor()
        cursor.execute(
            'UPDATE hotels SET name = %s, address = %s, city = %s, descr = %s WHERE hotelID = %s RETURNING hotelID',
            (name, address, city, descr, hotel_id)
        )
        updated_hotel = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()

        if updated_hotel:
            return jsonify({
                'message': 'Hotel updated successfully',
                'hotel': {'hotelID': updated_hotel[0], 'name': name, 'address': address, 'city': city, 'descr': descr}
            })
        else:
            return jsonify({'error': 'Hotel not found'}), 404

    except psycopg2.Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/hotels/<int:hotel_id>', methods=['DELETE'])
def delete_hotel(hotel_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401

    # Only allow admins to delete hotels
    #role = session.get('role')
    #if role != 'admin':
    #    return jsonify({'error': 'Permission denied'}), 403

    try:
        conn = get_db_connection_hotel()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM hotels WHERE hotelID = %s RETURNING hotelID', (hotel_id,))
        deleted_hotel = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()

        if deleted_hotel:
            return jsonify({'message': 'Hotel deleted successfully'})
        else:
            return jsonify({'error': 'Hotel not found'}), 404

    except psycopg2.Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/hotels/<int:hotel_id>/rooms', methods=['POST'])
def add_room(hotel_id):
    data = request.json
    nBeds = data.get('nBeds')
    descr = data.get('descr')
    pricePerDay = data.get('pricePerDay')
    name = data.get('name')

    if not nBeds or not descr or not pricePerDay or not name:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        conn = get_db_connection_hotel()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO rooms (hotelID, nBeds, descr, pricePerDay, name) VALUES (%s, %s, %s, %s, %s) RETURNING roomid',
            (hotel_id, nBeds, descr, pricePerDay, name)
        )
        room_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            'message': 'Room created successfully',
            'room': {
                'roomID': room_id,
                'hotelID': hotel_id,
                'nBeds': nBeds,
                'descr': descr,
                'pricePerDay': pricePerDay,
                'name': name
            }
        }), 201

    except psycopg2.Error as e:
        return jsonify({'error': str(e)}), 500


@app.route('/room/<int:roomID>', methods=['DELETE'])
def delete_room(roomID):
    try:
        conn = get_db_connection_hotel()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM rooms WHERE roomID = %s', (roomID,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Room deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/room/<int:roomID>', methods=['PUT'])
def edit_room(roomID):
    try:
        data = request.get_json()

        descr = data.get('descr')
        pricePerDay = data.get('pricePerDay')
        nBeds = data.get('nBeds')

        if not descr or not pricePerDay or not nBeds:
            return jsonify({'error': 'Missing required fields'}), 400

        try:
            pricePerDay = float(pricePerDay)
        except ValueError:
            return jsonify({'error': 'Invalid price format'}), 400

        conn = get_db_connection_hotel()
        cursor = conn.cursor()

        cursor.execute(
            '''UPDATE rooms
               SET descr = %s, pricePerDay = %s, nBeds = %s
               WHERE roomID = %s''',
            (descr, pricePerDay, nBeds, roomID)
        )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'message': 'Room updated successfully'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/room/<int:roomID>', methods=['GET'])
def get_room(roomID):
    try:
        conn = get_db_connection_hotel()
        cursor = conn.cursor()

        cursor.execute('SELECT roomID, descr, pricePerDay, nBeds, name FROM rooms WHERE roomID = %s', (roomID,))
        room = cursor.fetchone()

        if room:
            room_data = {
                'roomID': room[0],
                'descr': room[1],
                'pricePerDay': room[2],
                'nBeds': room[3],
                'name': room[4]
            }
            cursor.close()
            conn.close()
            return jsonify(room_data)

        cursor.close()
        conn.close()
        return jsonify({'error': 'Room not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/reservations', methods=['POST'])
def make_reservation():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401

    data = request.json
    roomID = data.get('roomId')
    hotelID = data.get('hotelId')
    dateStart = data.get('checkInDate')
    dateEnd = data.get('checkOutDate')
    nGuests = data.get('nGuests', 1)

    if not roomID :
            return jsonify({'error': 'Missing required roomID'}), 400
    if not hotelID :
            return jsonify({'error': 'Missing required hotelID'}), 400

    if not dateStart:
            return jsonify({'error': 'Missing required dateStart'}), 400

    if not dateEnd:
            return jsonify({'error': 'Missing required dateEnd'}), 400

    try:
        conn = get_db_connection_hotel()
        cursor = conn.cursor()

        cursor.execute('SELECT pricePerDay FROM rooms WHERE roomID = %s AND hotelID = %s', (roomID, hotelID))
        room = cursor.fetchone()

        if not room:
            return jsonify({'error': 'Room not found'}), 404

        pricePerDay = room[0]

        dateStart = datetime.strptime(dateStart, '%Y-%m-%d')
        dateEnd = datetime.strptime(dateEnd, '%Y-%m-%d')
        delta = dateEnd - dateStart
        num_days = delta.days

        if num_days <= 0:
            return jsonify({'error': 'End date must be after start date'}), 400

        total_price = pricePerDay * num_days * nGuests

        conn_res = get_db_connection_res()
        cursor_res = conn_res.cursor()

        cursor_res.execute('''
            SELECT * FROM reservations
            WHERE roomID = %s AND hotelID = %s
            AND (dateStart <= %s AND dateEnd >= %s)
        ''', (roomID, hotelID, dateEnd, dateStart))

        existing_reservation = cursor_res.fetchone()
        if existing_reservation:
            return jsonify({'error': 'Room is already booked for the selected dates'}), 400

        cursor_res.execute(
            '''INSERT INTO reservations (userID, roomID, hotelID, dateStart, dateEnd, nGuests, total_price)
               VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING resID''',
            (user_id, roomID, hotelID, dateStart, dateEnd, nGuests, total_price)
        )
        res_id = cursor_res.fetchone()[0]
        conn_res.commit()
        cursor_res.close()
        conn_res.close()

        return jsonify({
            'message': 'Reservation made successfully',
            'reservation': {
                'resID': res_id,
                'userID': user_id,
                'roomID': roomID,
                'hotelID': hotelID,
                'dateStart': dateStart.strftime('%Y-%m-%d'),
                'dateEnd': dateEnd.strftime('%Y-%m-%d'),
                'nGuests': nGuests,
                'total_price': round(total_price, 2)
            }
        }), 201

    except psycopg2.Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/user/reservations', methods=['GET'])
def get_user_reservations():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401

    try:
        conn_res = get_db_connection_res()
        cursor_res = conn_res.cursor()

        cursor_res.execute('''
            SELECT resID, roomID, hotelID, dateStart, dateEnd, nGuests, total_price
            FROM reservations
            WHERE userID = %s
            ORDER BY dateStart
        ''', (user_id,))


        reservations = cursor_res.fetchall()

        if not reservations:
            return jsonify({'message': 'No reservations found'}), 404

        user_reservations = []
        for reservation in reservations:
            resID, roomID, hotelID, dateStart, dateEnd, nGuests, total_price = reservation

            conn_hotel = get_db_connection_hotel()
            cursor_hotel = conn_hotel.cursor()

            cursor_hotel.execute('SELECT name, descr FROM rooms WHERE roomID = %s AND hotelID = %s', (roomID, hotelID))
            room = cursor_hotel.fetchone()

            cursor_hotel.execute('SELECT name FROM hotels WHERE hotelID = %s', (hotelID,))
            hotel = cursor_hotel.fetchone()

            cursor_hotel.close()
            conn_hotel.close()

            if room and hotel:
                room_name, room_descr = room
                hotel_name = hotel[0]

                user_reservations.append({
                    'resID': resID,
                    'roomID': roomID,
                    'hotelID': hotelID,
                    'hotelName': hotel_name,
                    'roomName': room_name,
                    'roomDescr': room_descr,
                    'dateStart': dateStart.strftime('%Y-%m-%d'),
                    'dateEnd': dateEnd.strftime('%Y-%m-%d'),
                    'nGuests': nGuests,
                    'total_price': round(total_price, 2)
                })

        cursor_res.close()
        conn_res.close()

        return jsonify({'reservations': user_reservations})

    except psycopg2.Error as e:
        return jsonify({'error': str(e)}), 500


@app.route('/reservations/edit', methods=['PUT'])
def edit_reservation():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401

    data = request.json
    res_id = data.get('resID')
    new_date_start = data.get('newDateStart')
    new_date_end = data.get('newDateEnd')
    new_guests = data.get('newGuests')

    if not res_id or not new_date_start or not new_date_end or new_guests is None:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        conn_res = get_db_connection_res()
        cursor_res = conn_res.cursor()

        cursor_res.execute('SELECT * FROM reservations WHERE resID = %s AND userID = %s', (res_id, user_id))
        reservation = cursor_res.fetchone()

        if not reservation:
            return jsonify({'error': 'Reservation not found'}), 404

        new_date_start = datetime.strptime(new_date_start, '%Y-%m-%d')
        if (new_date_start - datetime.now()).days < 30:
            return jsonify({'error': 'You can only edit the reservation if the check-in date is at least a month away'}), 400

        cursor_res.execute('''
            UPDATE reservations
            SET dateStart = %s, dateEnd = %s, nGuests = %s
            WHERE resID = %s
        ''', (new_date_start, new_date_end, new_guests, res_id))

        conn_res.commit()
        cursor_res.close()
        conn_res.close()

        return jsonify({'message': 'Reservation updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/reservations/delete/<int:res_id>', methods=['DELETE'])
def delete_reservation_admin(res_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401

    try:
        conn_res = get_db_connection_res()
        cursor_res = conn_res.cursor()

        cursor_res.execute('SELECT * FROM reservations WHERE resID = %s', (res_id,))
        reservation = cursor_res.fetchone()

        if not reservation:
            return jsonify({'error': 'Reservation not found or does not belong to the user'}), 404

        cursor_res.execute('DELETE FROM reservations WHERE resID = %s', (res_id,))
        conn_res.commit()

        cursor_res.close()
        conn_res.close()

        return jsonify({'message': 'Reservation deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/rooms/<int:room_id>/reservations', methods=['GET'])
def get_reservations_for_room(room_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401

    try:
        conn_res = get_db_connection_res()
        cursor_res = conn_res.cursor()

        cursor_res.execute('SELECT * FROM reservations WHERE roomID = %s', (room_id,))
        reservations = cursor_res.fetchall()

        if not reservations:
            return jsonify({'message': 'No reservations found for this room'}), 404

        reservation_list = []
        for reservation in reservations:
            reservation_list.append({
                'resID': reservation[0],
                'guestId': reservation[1],
                'dateStart': reservation[3],
                'dateEnd': reservation[4],
                'nGuests': reservation[5]
            })

        cursor_res.close()
        conn_res.close()

        return jsonify({'reservations': reservation_list}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/reservations/manage/<int:res_id>', methods=['PUT'])
def update_reservation(res_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401

    data = request.json
    new_date_start = data.get('newDateStart')
    new_date_end = data.get('newDateEnd')
    new_guests = data.get('newGuests')

    if not new_date_start or not new_date_end or new_guests is None:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        conn_res = get_db_connection_res()
        cursor_res = conn_res.cursor()

        cursor_res.execute('SELECT * FROM reservations WHERE resID = %s AND userID = %s', (res_id, user_id))
        reservation = cursor_res.fetchone()

        if not reservation:
            return jsonify({'error': 'Reservation not found or does not belong to you'}), 404

        cursor_res.execute('''
            UPDATE reservations
            SET dateStart = %s, dateEnd = %s, nGuests = %s
            WHERE resID = %s
        ''', (new_date_start, new_date_end, new_guests, res_id))

        conn_res.commit()
        cursor_res.close()
        conn_res.close()

        return jsonify({'message': 'Reservation updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/reservations/manage/<int:res_id>', methods=['DELETE'])
def delete_reservation(res_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401

    try:
        conn_res = get_db_connection_res()
        cursor_res = conn_res.cursor()

        cursor_res.execute('SELECT * FROM reservations WHERE resID = %s AND userID = %s', (res_id, user_id))
        reservation = cursor_res.fetchone()

        if not reservation:
            return jsonify({'error': 'Reservation not found or does not belong to you'}), 404

        cursor_res.execute('DELETE FROM reservations WHERE resID = %s', (res_id,))
        conn_res.commit()
        cursor_res.close()
        conn_res.close()

        return jsonify({'message': 'Reservation deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/guests/<int:guest_id>', methods=['GET'])
def get_guest_by_id(guest_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('SELECT name, last_name FROM users WHERE userid = %s', (guest_id,))
        guest = cursor.fetchone()

        if guest:
            return jsonify({'guestName': f'{guest[0]} {guest[1]}'}), 200
        else:
            return jsonify({'error': 'Guest not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
