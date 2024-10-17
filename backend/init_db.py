import mysql.connector

mydb = mysql.connector.connect(
  host="CristhianRichard94.mysql.pythonanywhere-services.com",
  user="CristhianRichard",
  password="yFwHpSmPe9!._GR",
  database="CristhianRichard$futsal-manager"
)

mycursor = mydb.cursor()


def create_tables():
    create_stadiums_table()
    create_users_table()
    create_reservations_table()


def create_stadiums_table():
    mycursor.execute("DROP TABLE IF EXISTS reservations")
    mycursor.execute("DROP TABLE IF EXISTS stadiums")
    mycursor.execute("CREATE TABLE stadiums (stadiumId int not null, name VARCHAR(255), address VARCHAR(255), phone int not null, PRIMARY KEY(stadiumId))")


def create_users_table():
    mycursor.execute("DROP TABLE IF EXISTS users")
    mycursor.execute("CREATE TABLE users (userId int not null, name VARCHAR(255) not null, email VARCHAR(255) not null, phone int, PRIMARY KEY(userId))")


def create_reservations_table():
    mycursor.execute("DROP TABLE IF EXISTS reservations")
    mycursor.execute("CREATE TABLE reservations (stadiumId int, userId int, datetime VARCHAR(255), FOREIGN KEY (stadiumId) REFERENCES stadiums(stadiumId), FOREIGN KEY (userId) REFERENCES users(userId))")


def fill_data():
    # Insert dummy data into stadiums table
    mycursor.execute("INSERT INTO stadiums (stadiumId, name, address, phone) VALUES (1, 'Futsal Arena', '123 Main St', 1234567890), (2, 'Soccer City', '456 Park Ave', 9876543210)")

    # Insert dummy data into users table
    mycursor.execute("INSERT INTO users (userId, name, email, phone) VALUES (1, 'John Doe', 'john@example.com', 1112223333), (2, 'Jane Smith', 'jane@example.com', 4445556666)")

    # Insert dummy data into reservations table
    mycursor.execute("INSERT INTO reservations (stadiumId, userId, datetime) VALUES (1, 1, '2023-06-01 18:00:00'), (2, 2, '2023-06-02 19:30:00')")

    # Commit the changes
    mydb.commit()


create_tables()
# fill_data()
