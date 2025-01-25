from flask import Blueprint, request, jsonify
from models.wallet import Wallet
from utils.redis_client import get_redis_client
from datetime import timedelta

balance_bp = Blueprint('balance', __name__)

# Redis client
client = get_redis_client()

@balance_bp.route('/', methods=['POST'])
def get_balance():
    UserId = request.get_json().get('UserId')
    if not UserId:
        return jsonify({'message': 'user Id is required'}), 400

    try:
        # Check Redis for cached balance
        cached_balance = client.get(f'wallet_balance:{UserId}')

        if cached_balance:
            
            return jsonify({
                'message': 'Wallet balance fetched from cache',
                'balance': cached_balance.decode('utf-8')  
            }), 200

        
        wallet = Wallet.query.filter_by(UserId=UserId).first()

        if not wallet:
            return jsonify({'message': 'Wallet not found'}), 404

        wallet_balance = wallet.balance

        
        client.setex(f'wallet_balance:{UserId}', timedelta(seconds=3600), str(wallet_balance))

        return jsonify({
            'message': 'Wallet balance fetched from database and cached',
            'balance': wallet_balance
        }), 200

    except Exception as e:
        print(f'Error fetching wallet balance: {e}')
        return jsonify({'message': 'Server error'}), 500
