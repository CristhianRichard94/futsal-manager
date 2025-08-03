import mysql.connector

connection = mysql.connector.connect(
  host="CristhianRichard94.mysql.pythonanywhere-services.com",
  user="CristhianRichard",
  password="yFwHpSmPe9!._GR",
  database="CristhianRichard$futsal-manager"
)

cursor = connection.cursor()


def drop_all_tables():
    """
    Connects to a MySQL database and drops all tables.

    Args:
        host (str): The database host.
        user (str): The database username.
        password (str): The database password.
        database (str): The name of the database.
    """
    try:

        # Disable foreign key checks to allow dropping tables with constraints
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")

        # Get all table names from the database
        cursor.execute("SHOW TABLES;")
        tables = cursor.fetchall()

        if not tables:
            print("No tables found in the database.")
            return

        # Generate and execute DROP TABLE statements for each table
        print(f"Dropping all tables from database")
        for table_name in tables:
            table_name = table_name[0]
            print(f"Dropping table: {table_name}")
            drop_query = f"DROP TABLE IF EXISTS `{table_name}`;"
            cursor.execute(drop_query)

        # Re-enable foreign key checks
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")

        # Commit the changes
        connection.commit()
        print("All tables have been successfully dropped.")

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        # Rollback in case of error
        if 'connection' in locals() and connection.is_connected():
            connection.rollback()
    finally:
        # Close the cursor and connection
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("Database connection closed.")


def create_tables():
    create_stadiums_table()
    create_users_table()
    create_reservations_table()


def create_stadiums_table():
    cursor.execute("DROP TABLE IF EXISTS reservations")
    cursor.execute("DROP TABLE IF EXISTS stadiums")
    cursor.execute("CREATE TABLE stadiums (stadiumId VARCHAR(255) not null, name VARCHAR(255), address VARCHAR(255), phone int not null, PRIMARY KEY(stadiumId))")


def create_users_table():
    cursor.execute("DROP TABLE IF EXISTS users")
    cursor.execute("CREATE TABLE users (userId VARCHAR(255) not null, userRole int not null, name VARCHAR(255) not null, email VARCHAR(255) not null, phone int, PRIMARY KEY(userId))")


def create_reservations_table():
    cursor.execute("DROP TABLE IF EXISTS reservations")
    cursor.execute("CREATE TABLE reservations (stadiumId VARCHAR(255), userId VARCHAR(255), datetime VARCHAR(255), FOREIGN KEY (stadiumId) REFERENCES stadiums(stadiumId), FOREIGN KEY (userId) REFERENCES users(userId))")


def fill_data():
    # Insert dummy data into stadiums table
    cursor.execute("INSERT INTO stadiums (stadiumId, name, address, phone) VALUES (1, 'Futsal Arena', '123 Main St', 1234567890), (2, 'Soccer City', '456 Park Ave', 9876543210)")

    # Insert dummy data into users table
    cursor.execute("INSERT INTO users (userId, name, email, phone) VALUES (1, 'John Doe', 'john@example.com', 1112223333), (2, 'Jane Smith', 'jane@example.com', 4445556666)")

    # Insert dummy data into reservations table
    cursor.execute("INSERT INTO reservations (stadiumId, userId, datetime) VALUES (1, 1, '2023-06-01 18:00:00'), (2, 2, '2023-06-02 19:30:00')")

    # Commit the changes
    connection.commit()


create_tables()
fill_data()
# drop_all_tables()
