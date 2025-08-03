from flask import Blueprint, jsonify, request, current_app

users_bp = Blueprint('users', __name__)


@users_bp.route('/users', methods=['GET'])
def get_users():
    try:
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
    except Exception as e:
        current_app.logger.error(f"Error fetching users: {e}")
        return jsonify({"message": "An error occurred while fetching users"}), 500


@users_bp.route('/users', methods=['POST'])
def add_user():
    try:
        mycursor = current_app.mycursor
        mydb = current_app.mydb
        data = request.json
        sql = "INSERT INTO users (name, email, phone) VALUES (%s, %s, %s)"
        val = (data['name'], data['email'], data['phone'])
        mycursor.execute(sql, val)
        mydb.commit()
        return jsonify({"message": "User added successfully"}), 201
    except Exception as e:
        current_app.logger.error(f"Error adding user: {e}")
        return jsonify({"message": "An error occurred while adding the user"}), 500


@users_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        mycursor = current_app.mycursor
        mydb = current_app.mydb
        data = request.json
        sql = "UPDATE users SET name = %s, email = %s, phone = %s WHERE userId = %s"
        val = (data['name'], data['email'], data['phone'], user_id)
        mycursor.execute(sql, val)
        mydb.commit()
        return jsonify({"message": "User updated successfully"}), 200
    except Exception as e:
        current_app.logger.error(f"Error updating user {user_id}: {e}")
        return jsonify({"message": "An error occurred while updating the user"}), 500


@users_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        mycursor = current_app.mycursor
        mydb = current_app.mydb
        sql = "DELETE FROM users WHERE userId = %s"
        val = (user_id,)
        mycursor.execute(sql, val)
        mydb.commit()
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        current_app.logger.error(f"Error deleting user {user_id}: {e}")
        return jsonify({"message": "An error occurred while deleting the user"}), 500


@users_bp.route('/users', methods=['GET'])
def get_user():
    try:
        mycursor = current_app.mycursor

        user_id = request.args.get('id')
        user_email = request.args.get('email')

        if user_email:
            sql = "SELECT * FROM users WHERE email = %s"
            val = (user_email,)
        elif user_id:
            sql = "SELECT * FROM users WHERE userId = %s"
            val = (user_id,)
        else:
            return jsonify({"message": "Please provide either an 'id' or 'email' query parameter"}), 400

        mycursor.execute(sql, val)
        user = mycursor.fetchone()  # Use fetchone since we expect a single user

        if not user:
            return jsonify({"message": "User not found"}), 404

        # Convert the user tuple to a dictionary
        user_dict = {
            "id": user[0],
            "name": user[1],
            "email": user[2],
            "phone": user[3]
        }

        return jsonify(user_dict), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching user by ID {user_id}: {e}")
        return jsonify({"message": "An error occurred while fetching the user"}), 500
