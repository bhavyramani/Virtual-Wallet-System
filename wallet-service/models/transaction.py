from db import db


class Transaction(db.Model):
    __tablename__ = "transactions"
    Id = db.Column(db.Integer, primary_key=True)
    From = db.Column(db.String(50), nullable=False)
    To = db.Column(db.String(50), nullable=False)
    Amount = db.Column(db.Float, nullable=False)
    Date = db.Column(db.DateTime, nullable=False)

    def __init__(self, From, To, Amount, Date):
        self.From = From
        self.To = To
        self.Amount = Amount
        self.Date = Date

    def to_dict(self):
        return {
            "Id": self.Id,
            "From": self.From,
            "To": self.To,
            "Amount": self.Amount,
            "Date": self.Date.isoformat(),  # Convert datetime to ISO string format
        }
