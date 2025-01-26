from flask import Flask, request, jsonify, session, Response
import psycopg2
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'supersecretkey'
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

RES_DB_CONFIG = {
    'dbname': 'res_db',
    'user': 'res_user',
    'password': 'res',
    'host': 'localhost'
}

def get_db_connection_res():
    return psycopg2.connect(**RES_DB_CONFIG)

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
    nGuests = data.get('nGuests', 1)  # Default to 1 guest

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
                'guestName': reservation[1],
                'dateStart': reservation[2],
                'dateEnd': reservation[3],
                'nGuests': reservation[4]
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


if __name__ == '__main__':
    app.run(debug=True, port=5002)
