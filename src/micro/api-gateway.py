from flask import Flask, request, jsonify
import requests

from flask_cors import CORS
app = Flask(__name__)

# Backend service URLs
BACKEND_AUTH = 'http://localhost:5001'
BACKEND_RES = 'http://localhost:5002'
BACKEND_HOTEL = 'http://localhost:5003'


CORS(app, origins="http://localhost:3000", supports_credentials=True)
# Registration and login routes
@app.route('/register', methods=['POST'])
def register():
    try:
        response = requests.post(f'{BACKEND_AUTH}/register', json=request.json)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to contact auth service'}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        response = requests.post(f'{BACKEND_AUTH}/login', json=request.json)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to contact auth service'}), 500



@app.route('/logout', methods=['POST'])
def logout():
    try:
        response = requests.post(f'{BACKEND_AUTH}/logout', cookies=request.cookies)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to contact auth service'}), 500



@app.route('/profile', methods=['GET'])
def profile():

    try:
        response = requests.get(f'{BACKEND_AUTH}/profile', cookies=request.cookies)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to contact auth service'}), 500



@app.route('/hotels', methods=['GET'])
def get_hotels():
    try:
        response = requests.get(f'{BACKEND_HOTEL}/hotels', json=request.json)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to contact hotel service'}), 500

# Get details of a specific hotel
@app.route('/hotels/<int:hotel_id>', methods=['GET'])
def get_hotel(hotel_id):
    try:
        response = requests.get(f'{BACKEND_HOTEL}/hotels/<int:hotel_id>', json=request.json)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to contact hotel service'}), 500

# Get rooms for a specific hotel
@app.route('/hotels/<int:hotel_id>/rooms', methods=['GET'])
def get_rooms(hotel_id):
    try:
        response = requests.get(f'{BACKEND_HOTEL}/hotels/<int:hotel_id>/rooms', json=request.json)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to contact hotel service'}), 500

@app.route('/hotels', methods=['POST'])
def add_hotel():
    try:
        response = requests.get(f'{BACKEND_HOTEL}/hotels', json=request.json)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to contact hotel service'}), 500


@app.route('/hotels/<int:hotel_id>', methods=['PUT'])
def edit_hotel(hotel_id):
    try:
        response = requests.get(f'{BACKEND_HOTEL}/hotels/<int:hotel_id>', json=request.json)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to contact hotel service'}), 500

@app.route('/hotels/<int:hotel_id>', methods=['DELETE'])
def delete_hotel(hotel_id):
    try:
        response = requests.get(f'{BACKEND_HOTEL}/hotels/<int:hotel_id>', json=request.json)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to contact hotel service'}), 500

@app.route('/hotels/<int:hotel_id>/rooms', methods=['POST'])
def add_room(hotel_id):
    try:
        response = requests.get(f'{BACKEND_HOTEL}/hotels/<int:hotel_id>/rooms', json=request.json)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to contact hotel service'}), 500


@app.route('/room/<int:roomID>', methods=['DELETE'])
def delete_room(roomID):
    try:
        response = requests.get(f'{BACKEND_HOTEL}/room/<int:roomID>', json=request.json)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to contact hotel service'}), 500

@app.route('/room/<int:roomID>', methods=['PUT'])
def edit_room(roomID):
    try:
        response = requests.get(f'{BACKEND_HOTEL}/room/<int:roomID>', json=request.json)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to contact hotel service'}), 500

@app.route('/room/<int:roomID>', methods=['GET'])
def get_room(roomID):
    try:
        response = requests.get(f'{BACKEND_HOTEL}/room/<int:roomID>', json=request.json)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to contact hotel service'}), 500

@app.route('/reservations', methods=['POST'])
def make_reservation():
    try:
        response = requests.get(f'{BACKEND_RES}/reservations', json=request.json)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to contact reservation service'}), 500

@app.route('/user/reservations', methods=['GET'])
def get_user_reservations():
    try:
        response = requests.get(f'{BACKEND_RES}/user/reservations', json=request.json)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to contact reservation service'}), 500


@app.route('/reservations/edit', methods=['PUT'])
def edit_reservation():
    try:
        response = requests.get(f'{BACKEND_RES}/reservations/edit', json=request.json)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to contact reservation service'}), 500

@app.route('/reservations/delete/<int:res_id>', methods=['DELETE'])
def delete_reservation_admin(res_id):
    try:
        response = requests.get(f'{BACKEND_RES}/reservations/delete/<int:res_id>', json=request.json)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to contact reservation service'}), 500

@app.route('/rooms/<int:room_id>/reservations', methods=['GET'])
def get_reservations_for_room(room_id):
    try:
        response = requests.get(f'{BACKEND_RES}/rooms/<int:room_id>/reservations', json=request.json)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to contact reservation service'}), 500

@app.route('/reservations/manage/<int:res_id>', methods=['PUT'])
def update_reservation(res_id):
    try:
        response = requests.get(f'{BACKEND_RES}/reservations/manage/<int:res_id>', json=request.json)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to contact reservation service'}), 500

@app.route('/reservations/manage/<int:res_id>', methods=['DELETE'])
def delete_reservation(res_id):
    try:
        response = requests.get(f'{BACKEND_RES}/reservations/manage/<int:res_id>', json=request.json)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to contact reservation service'}), 500


# Running the Flask app
if __name__ == '__main__':
    app.run(debug=True, port=5000)
