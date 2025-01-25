from db import db

class Transaction(db.Model):
    __tablename__ = 'transactions'  # Define the table name

    id = db.Column(db.Integer, primary_key=True)
    from_user = db.Column(db.String(50), nullable=False)
    to_user = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False)

    def __init__(self, from_user, to_user, amount, date):
        self.from_user = from_user
        self.to_user = to_user
        self.amount = amount
        self.date = date

    def to_dict(self):
        return {
            'id': self.id,
            'from_user': self.from_user,
            'to_user': self.to_user,
            'amount': self.amount,
            'date': self.date.isoformat()  # Convert datetime to ISO string format
        }
