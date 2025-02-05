from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from sqlalchemy.exc import SQLAlchemyError
from db import db
from models.wallet import Wallet
from models.transaction import Transaction
from utils.redis_client import get_redis_client
from middleware import extract_user_middleware

transfer_bp = Blueprint('transfer', __name__)
client = get_redis_client()

@transfer_bp.before_request
@extract_user_middleware


@transfer_bp.route('', methods=['POST'])
def transfer_funds():
    try:
        
        data = request.get_json()
        From = data.get('From')

        if From != request.UserId:
            return jsonify({'message': 'Unauthorized'}), 401
        
        To = data.get('To')
        Amount = int(data.get('Amount'))
        
        if not From or not To or Amount is None:
            print(From, To, Amount)
            return jsonify({'message': 'From, To, and Amount are required'}), 400
        if From == To:
            return jsonify({'message': 'Cannot transfer funds to yourself'}), 400
        if Amount <= 0:
            return jsonify({'message': 'Transfer amount must be greater than 0'}), 400

        sender_wallet = Wallet.query.filter_by(UserId=From).first()
        receiver_wallet = Wallet.query.filter_by(UserId=To).first()

        if not sender_wallet or not receiver_wallet:
            return jsonify({'message': 'Sender or receiver wallet not found'}), 404

        if sender_wallet.Balance < Amount:
            return jsonify({'message': 'Insufficient balance'}), 400

        sender_wallet.Balance -= Amount
        receiver_wallet.Balance += Amount

        transaction = Transaction(
            From=From,
            To=To,
            Amount=Amount,
            Date=datetime.utcnow()
        )
        db.session.add(transaction)

        db.session.commit()

        client.setex(f'wallet_balance:{From}', timedelta(seconds=3600), str(sender_wallet.Balance))
        client.setex(f'wallet_balance:{To}', timedelta(seconds=3600), str(receiver_wallet.Balance))
        return jsonify({
            'message': 'Transfer successful',
            'transaction': transaction.to_dict()
        }), 201

    except SQLAlchemyError as e:
        db.session.rollback() 
        print(f'Database error: {e}')
        return jsonify({'message': 'Database error', 'error': str(e)}), 500
    except Exception as e:
        print(f'Server error: {e}')
        return jsonify({'message': 'Server error', 'error': str(e)}), 500
