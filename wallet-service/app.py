from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
from db import init_app
import os
from dotenv import load_dotenv
from controllers.create_wallet import create_wallet_bp
from controllers.get_balance import balance_bp
from controllers.transfer import transfer_bp
from controllers.transactions import transactions_bp

load_dotenv()

app = Flask(__name__)

init_app(app)

@app.route('/')
def hello_world():
    return 'Hello, World!'

# Apply middleware to specific blueprints
app.register_blueprint(create_wallet_bp, url_prefix='/create-wallet')
app.register_blueprint(balance_bp, url_prefix='/balance')
app.register_blueprint(transfer_bp, url_prefix='/transfer')
app.register_blueprint(transactions_bp, url_prefix='/transactions')
CORS(app, resources={r'/*': {'origins': os.getenv('FRONTEND_URL'), 'supports_credentials': True}})

def before_request_middleware():
    pass


if __name__ == "__main__":
    app.run(debug=True)
