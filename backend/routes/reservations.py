from flask import Blueprint, jsonify, request, current_app

reservations_bp = Blueprint('reservations', __name__)


@reservations_bp.route('/reservations', methods=['GET'])
def get_reservations():
    mycursor = current_app.mycursor
    mycursor.execute("""
        SELECT r.*, s.name as stadium_name, s.address, s.phone,
               u.name as user_name, u.email, u.phone as user_phone
        FROM reservations r
        JOIN stadiums s ON r.stadiumId = s.stadiumId
        JOIN users u ON r.userId = u.userId
    """)
    reservations = mycursor.fetchall()
    # Convert each reservation tuple to a dictionary
    reservation_list = []
    for reservation in reservations:
        reservation_dict = {
            "stadiumId": reservation[0],
            "userId": reservation[1],
            "datetime": reservation[2],
            "stadium": {
                "name": reservation[3],
                "address": reservation[4],
                "phone": reservation[5]
            },
            "user": {
                "name": reservation[6],
                "email": reservation[7],
                "phone": reservation[8]
            }
        }
        reservation_list.append(reservation_dict)

    return jsonify(reservation_list), 200

@reservations_bp.route('/reservations', methods=['POST'])
def add_reservation():
    mycursor = current_app.mycursor
    mydb = current_app.mydb
    data = request.json
    sql = "INSERT INTO reservations (stadiumId, userId, datetime) VALUES (%s, %s, %s)"
    val = (data['stadiumId'], data['userId'], data['datetime'])
    mycursor.execute(sql, val)
    mydb.commit()
    return jsonify({"message": "Reservation added successfully"}), 201

@reservations_bp.route('/reservations/<int:reservation_id>', methods=['PUT'])
def update_reservation(reservation_id):
    mycursor = current_app.mycursor
    mydb = current_app.mydb
    data = request.json
    sql = "UPDATE reservations SET stadiumId = %s, userId = %s, datetime = %s WHERE id = %s"
    val = (data['stadiumId'], data['userId'], data['datetime'], reservation_id)
    mycursor.execute(sql, val)
    mydb.commit()
    return jsonify({"message": "Reservation updated successfully"}), 200

@reservations_bp.route('/reservations/<int:reservation_id>', methods=['DELETE'])
def delete_reservation(reservation_id):
    mycursor = current_app.mycursor
    mydb = current_app.mydb
    sql = "DELETE FROM reservations WHERE id = %s"
    val = (reservation_id,)
    mycursor.execute(sql, val)
    mydb.commit()
    return jsonify({"message": "Reservation deleted successfully"}), 200

