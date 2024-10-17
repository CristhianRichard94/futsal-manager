from flask import Blueprint, jsonify, request, current_app

stadiums_bp = Blueprint('stadiums', __name__)

@stadiums_bp.route('/stadiums', methods=['GET'])
def get_stadiums():
    mycursor = current_app.mycursor
    mycursor.execute("SELECT * FROM stadiums")
    stadiums = mycursor.fetchall()

    # Convert each stadium tuple to a dictionary
    stadium_list = []
    for stadium in stadiums:
        stadium_dict = {
            "id": stadium[0],
            "name": stadium[1],
            "address": stadium[2],
            "phone": stadium[3]
        }
        stadium_list.append(stadium_dict)

    return jsonify(stadium_list), 200

@stadiums_bp.route('/stadiums', methods=['POST'])
def add_stadium():
    mycursor = current_app.mycursor
    data = request.json
    sql = "INSERT INTO stadiums (name, address, phone) VALUES (%s, %s, %s)"
    val = (data['name'], data['address'], data['phone'])
    mycursor.execute(sql, val)
    mydb.commit()
    return jsonify({"message": "Stadium added successfully"}), 201

@stadiums_bp.route('/stadiums/<int:stadium_id>', methods=['PUT'])
def update_stadium(stadium_id):
    mycursor = current_app.mycursor
    data = request.json
    sql = "UPDATE stadiums SET name = %s, address = %s, phone = %s WHERE stadiumId = %s"
    val = (data['name'], data['address'], data['phone'], stadium_id)
    mycursor.execute(sql, val)
    mydb.commit()
    return jsonify({"message": "Stadium updated successfully"}), 200

@stadiums_bp.route('/stadiums/<int:stadium_id>', methods=['DELETE'])
def delete_stadium(stadium_id):
    mycursor = current_app.mycursor
    sql = "DELETE FROM stadiums WHERE stadiumId = %s"
    val = (stadium_id,)
    mycursor.execute(sql, val)
    mydb.commit()
    return jsonify({"message": "Stadium deleted successfully"}), 200
