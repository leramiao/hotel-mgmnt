from flask import Flask, request, jsonify, session, Response
import psycopg2
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'supersecretkey'
CORS(app, resources={r"/*": {"origins": "http://localhost:5000"}}, supports_credentials=True)

# Database configuration
DB_CONFIG = {
    'dbname': 'auth_db',
    'user': 'auth_user',
    'password': 'auth',
    'host': 'localhost'
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)



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


if __name__ == '__main__':
    app.run(debug=True, port=5001)
