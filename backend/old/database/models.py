from .db import db



class User(db.Document):
    name = db.StringField(required=True, unique=True)
    email = db.StringField(required=True, unique=True)
    _id = db.ObjectIdField()


class Field(db.Document):
    name = db.StringField(required=True, unique=True)
    address = db.StringField(required=True, unique=True)
    phone = db.IntField(required=True, unique=True)
    _id = db.ObjectIdField()

class Shift(db.Document):
    year = db.IntField(required=True, unique=True)
    month = db.IntField(required=True, unique=True)
    day = db.IntField(required=True, unique=True)
    hour = db.IntField(required=True, unique=True)
    _id = db.ObjectIdField()
    field = db.ReferenceField('Field')
