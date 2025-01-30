import jwt
from flask import request, jsonify, g
from functools import wraps
import os
from dotenv import load_dotenv


load_dotenv()
SECRET_KEY = os.getenv('JWT_SECRET')

def extract_user_middleware(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            
            auth_header = request.headers.get('cookie')
            
            if not auth_header:
                return jsonify({'message': 'Missing or invalid Authorization header'}), 401
            
            token = auth_header.split('=')[1]
            decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            
            request.UserId = decoded_token.get('UserId')
            
            if not request.UserId:
                return jsonify({'message': 'UserId not found in token'}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'message': 'An error occurred', 'error': str(e)}), 500

        return f(*args, **kwargs)
    return decorated_function
