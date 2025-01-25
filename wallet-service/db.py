# db.py
import os
from dotenv import load_dotenv
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

load_dotenv()  # Load environment variables from .env file

# Initialize the database
db = SQLAlchemy()

def init_app(app: Flask):
    # Database URL from environment variables
    db_url = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Disable modification tracking
    db.init_app(app)

    # Create tables if they don't exist
    with app.app_context():
        db.create_all()  
