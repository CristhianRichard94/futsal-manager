from flask import Blueprint, jsonify, request, current_app


users_bp = Blueprint('users', __name__)

@users_bp.route('/users', methods=['GET'])
def get_users():
    mycursor = current_app.mycursor
    mycursor.execute("SELECT * FROM users")
    users = mycursor.fetchall()
    # Convert each user tuple to a dictionary
    user_list = []
    for user in users:
        user_dict = {
            "id": user[0],
            "name": user[1],
            "email": user[2],
            "phone": user[3]
        }
        user_list.append(user_dict)

    return jsonify(user_dict), 200

@users_bp.route('/users', methods=['POST'])
def add_user():
    mycursor = current_app.mycursor
    mydb = current_app.mydb
    data = request.json
    sql = "INSERT INTO users (name, email, phone) VALUES (%s, %s, %s)"
    val = (data['name'], data['email'], data['phone'])
    mycursor.execute(sql, val)
    mydb.commit()
    return jsonify({"message": "User added successfully"}), 201

@users_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    mycursor = current_app.mycursor
    mydb = current_app.mydb
    data = request.json
    sql = "UPDATE users SET name = %s, email = %s, phone = %s WHERE userId = %s"
    val = (data['name'], data['email'], data['phone'], user_id)
    mycursor.execute(sql, val)
    mydb.commit()
    return jsonify({"message": "User updated successfully"}), 200

@users_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    mycursor = current_app.mycursor
    mydb = current_app.mydb
    sql = "DELETE FROM users WHERE userId = %s"
    val = (user_id,)
    mycursor.execute(sql, val)
    mydb.commit()
    return jsonify({"message": "User deleted successfully"}), 200