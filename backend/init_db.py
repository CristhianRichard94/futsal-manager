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
    mycursor.execute("CREATE TABLE stadiums (stadiumId int not null, name VARCHAR(255), address VARCHAR(255), PRIMARY KEY(stadiumId))")


def create_users_table():
    mycursor.execute("CREATE TABLE users (userId int not null, name VARCHAR(255), address VARCHAR(255), PRIMARY KEY(userId))")


def create_reservations_table():
    mycursor.execute("CREATE TABLE reservations (stadiumId int, userId int, datetime VARCHAR(255), FOREIGN KEY (stadiumId) REFERENCES stadiums(stadiumId), FOREIGN KEY (userId) REFERENCES users(userId))")