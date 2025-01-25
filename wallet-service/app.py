from flask import Flask
from db import init_app
from controllers.create_wallet import create_wallet_bp
from controllers.get_balance import balance_bp
from controllers.transfer import transfer_bp

# Create Flask application
app = Flask(__name__)

# Initialize the app with the database
init_app(app)

@app.route('/')
def hello_world():
    return 'Hello, World!'

# Apply middleware to specific blueprints
app.register_blueprint(create_wallet_bp, url_prefix='/create-wallet')
app.register_blueprint(balance_bp, url_prefix='/balance')
app.register_blueprint(transfer_bp, url_prefix='/transfer')

def before_request_middleware():
    pass

# Check if the app is running
if __name__ == "__main__":
    app.run(debug=True)
