# models/wallet.py
from db import db

class Wallet(db.Model):
    __tablename__ = 'wallets'  # Define the table name

    UserId = db.Column(db.String(50), primary_key=True, nullable=False)
    balance = db.Column(db.Float, nullable=False, default=0.0)

    def __init__(self, UserId, balance=0.0):
        self.UserId = UserId
        self.balance = balance

    def to_dict(self):
        return {
            'UserId': self.UserId,
            'balance': self.balance
        }