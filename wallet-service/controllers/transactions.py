from flask import Blueprint, request, jsonify
from sqlalchemy.exc import SQLAlchemyError
from db import db
from models.transaction import Transaction
from middleware import extract_user_middleware

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.before_request
@extract_user_middleware

@transactions_bp.route('/', methods=['GET'])
def get_transactions():
    try:
        UserId = getattr(request, 'UserId', None)
        if not UserId:
            return jsonify({'message': 'Unauthorized: UserId not found'}), 401

        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('page_size', 10))
        offset = (page - 1) * page_size

        transactions_query = (
            db.session.query(Transaction)
            .filter((Transaction.From == UserId) | (Transaction.To == UserId))
            .order_by(Transaction.Date.desc())
        )

        total_transactions = transactions_query.count()
        transactions = transactions_query.limit(page_size).offset(offset).all()

        transactions_data = [transaction.to_dict() for transaction in transactions]

        return jsonify({
            'page': page,
            'page_size': page_size,
            'total_transactions': total_transactions,
            'transactions': transactions_data
        }), 200

    except SQLAlchemyError as e:
        print(f'Database error: {e}')
        return jsonify({'message': 'Database error', 'error': str(e)}), 500
    except Exception as e:
        print(f'Server error: {e}')
        return jsonify({'message': 'Server error', 'error': str(e)}), 500
