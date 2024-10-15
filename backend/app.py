from flask import Flask, jsonify, request
from flask_marshmallow import Marshmallow
import os
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from flask_mongoengine import MongoEngine
from database import db
from database.models import User, Field, Shift

app = Flask(__name__)
baseDir = os.path.abspath(os.path.dirname(__file__))

app.config['MONGODB_SETTINGS'] = {
    'db': 'futsal-manager',
    'host': 'localhost',
    'port': 27017
}

db.initialize_db(app)

ma = Marshmallow(app)
jwt = JWTManager(app)


@app.route("/")
def hello_world():
    return f"hello {__name__}"



@app.route("/register", methods=["POST"])
def register():
    body = request.get_json()
    user = User(**body).save()
    return jsonify({'id': str(user._id)}), 201

@app.route("/shifts", methods=["POST"])
def add_shift():
    body = request.get_json()
    shift = Shift(**body).save()
    return jsonify({'id': str(shift._id)}), 201

@app.route("/shifts", methods=["PUT"])
def edit_shift():
    body = request.get_json()
    print(body)
    shift = Shift.query.filter_by(shift_id=shift_id)
    if shift:
        shift = Shift(**body).save()
        return jsonify({'id': str(shift._id)}), 201
    else:
        return 'Shift not found', 404

@app.route("/fields", methods=["GET"])
def get_fields():
    return jsonify(Field.objects.all()), 200

@app.route("/fields", methods=["POST"])
def add_field():
    body = request.get_json()
    print(body)
    field = Field(**body).save()
    return jsonify({'id': str(field.pk)}), 201

@app.route("/fields", methods=["PUT"])
def edit_field():
    body = request.get_json()
    print(body)
    shift = Shift.query.filter_by(shift_id=shift_id)
    if shift:
        shift = Shift(**body).save()
        return jsonify({'id': str(shift._id)}), 201
    else:
        return 'Shift not found', 404

if __name__ == "__main__":
    app.run(port=8081, debug=True)
