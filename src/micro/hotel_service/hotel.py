from flask import Flask, request, jsonify, session, Response
import psycopg2
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'supersecretkey'  # Session key
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# Database configuration


HOTEL_DB_CONFIG = {
     'dbname': 'hotel_db',
     'user': 'hotel_user',
     'password': 'hotel',
     'host': 'localhost'
 }


def get_db_connection_hotel():
    return psycopg2.connect(**HOTEL_DB_CONFIG)

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
            room_list = [{'roomID': room[0], 'hotelID': room[1], 'nBeds': room[2], 'descr': room[3], 'pricePerDay': room[4]} for room in rooms]
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
    #role = session.get('role')  # Assuming user role is stored in session
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
    #role = session.get('role')  # Assuming user role is stored in session
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
    #role = session.get('role')  # Assuming user role is stored in session
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
    name = data.get('name')  # Now expecting the 'name' field for the room

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
                'name': name  # Now including the name
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
        # Get data from the request
        data = request.get_json()

        # Extract the updated fields from the request body
        descr = data.get('descr')
        pricePerDay = data.get('pricePerDay')
        nBeds = data.get('nBeds')

        # Validate the input data
        if not descr or not pricePerDay or not nBeds:
            return jsonify({'error': 'Missing required fields'}), 400

        # Convert pricePerDay to a float to ensure proper format
        try:
            pricePerDay = float(pricePerDay)
        except ValueError:
            return jsonify({'error': 'Invalid price format'}), 400

        # Connect to the database
        conn = get_db_connection_hotel()
        cursor = conn.cursor()

        # Update the room details in the database
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
        # Connect to the database
        conn = get_db_connection_hotel()
        cursor = conn.cursor()

        # Query the database to retrieve room details
        cursor.execute('SELECT roomID, descr, pricePerDay, nBeds FROM rooms WHERE roomID = %s', (roomID,))
        room = cursor.fetchone()

        # If room is found, return its details
        if room:
            room_data = {
                'roomID': room[0],
                'descr': room[1],
                'pricePerDay': room[2],
                'nBeds': room[3]
            }
            cursor.close()
            conn.close()
            return jsonify(room_data)

        # If room not found
        cursor.close()
        conn.close()
        return jsonify({'error': 'Room not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True, port=5003)
