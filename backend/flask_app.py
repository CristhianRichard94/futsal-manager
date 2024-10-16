import mysql.connector
from flask import Flask

mydb = mysql.connector.connect(
  host="CristhianRichard94.mysql.pythonanywhere-services.com",
  user="CristhianRichard",
  password="yFwHpSmPe9!._GR",
  database="futsal-manager"
)

mycursor = mydb.cursor()


app = Flask(__name__)

@app.route('/new')
def add():
    return 'Hello from Flask!'

