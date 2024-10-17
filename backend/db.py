import mysql.connector

def init_db(app):
    app.mydb = mysql.connector.connect(
        host=app.config['MYSQL_HOST'],
        user=app.config['MYSQL_USER'],
        password=app.config['MYSQL_PASSWORD'],
        database=app.config['MYSQL_DATABASE']
    )
    app.mycursor = app.mydb.cursor()

