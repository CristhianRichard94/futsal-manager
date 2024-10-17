from .stadiums import stadiums_bp
from .users import users_bp
from .reservations import reservations_bp

def register_routes(app):
    app.register_blueprint(stadiums_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(reservations_bp)

