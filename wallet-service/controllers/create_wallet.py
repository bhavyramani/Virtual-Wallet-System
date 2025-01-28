from flask import Blueprint, request, jsonify
from models.wallet import Wallet
from db import db

create_wallet_bp = Blueprint('create_wallet', __name__)

# Route to handle the wallet creation after receiving the profile data
@create_wallet_bp.route('/', methods=['POST'])
def create_wallet():
    data = request.get_json()
    UserId = data.get('UserId')

    if not UserId:
        return jsonify({'message': 'UserId is required'}), 400

    try:
        new_wallet = Wallet(UserId=UserId, Balance=0)
        db.session.add(new_wallet)
        db.session.commit()
        return jsonify({'message': 'Wallet created successfully', 'wallet': new_wallet.to_dict()}), 201
    except Exception as e:
        return jsonify({'message': 'Error while creating wallet', 'error': str(e)}), 500
