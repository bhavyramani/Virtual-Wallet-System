from flask import Blueprint, request, jsonify
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_, and_
from db import db
from models.transaction import Transaction
from middleware import extract_user_middleware
from datetime import datetime, timedelta

transactions_bp = Blueprint("transactions", __name__)

@transactions_bp.before_request
@extract_user_middleware
@transactions_bp.route("", methods=["GET"])
def get_transactions():
    try:
        UserId = getattr(request, "UserId", None)
        if not UserId:
            return jsonify({"message": "Unauthorized: UserId not found"}), 401

        # Filters for sender/receiver
        base_filter = or_(Transaction.From == UserId, Transaction.To == UserId)

        # Check for PDF mode (start_date and end_date present)
        start_date_str = request.args.get("start_date")
        end_date_str = request.args.get("end_date")

        if start_date_str and end_date_str:
            try:
                start_date = datetime.fromisoformat(start_date_str)
                end_date = datetime.fromisoformat(end_date_str) + timedelta(days=1) 
            except ValueError:
                return jsonify({"message": "Invalid date format. Use YYYY-MM-DD."}), 400

            # PDF mode: date filtering only
            filters = and_(base_filter, Transaction.Date >= start_date, Transaction.Date <= end_date)
            transactions = db.session.query(Transaction).filter(filters).order_by(Transaction.Date.desc()).all()
            return jsonify({
                "transactions": [tx.to_dict() for tx in transactions]
            }), 200

        # UI paginated mode (only page and page_size matter)
        page = int(request.args.get("page", 1))
        page_size = int(request.args.get("page_size", 10))
        offset = (page - 1) * page_size

        query = db.session.query(Transaction).filter(base_filter).order_by(Transaction.Date.desc())
        total_transactions = query.count()
        transactions = query.limit(page_size).offset(offset).all()

        return jsonify({
            "page": page,
            "page_size": page_size,
            "total_transactions": total_transactions,
            "transactions": [tx.to_dict() for tx in transactions]
        }), 200

    except SQLAlchemyError as e:
        print(f"Database error: {e}")
        return jsonify({"message": "Database error", "error": str(e)}), 500
    except Exception as e:
        print(f"Server error: {e}")
        return jsonify({"message": "Server error", "error": str(e)}), 500
