from ..utils.database import mysql
from ..utils.auth import hash_password, check_password

class User:
    @staticmethod
    def create(username, email, password):
        hashed_pw = hash_password(password)
        cursor = mysql.connection.cursor()
        try:
            cursor.execute(
                "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
                (username, email, hashed_pw)
            )
            mysql.connection.commit()
            return cursor.lastrowid
        except Exception as e:
            mysql.connection.rollback()
            raise e
        finally:
            cursor.close()

    @staticmethod
    def get_by_email(email):
        cursor = mysql.connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        return user

    @staticmethod
    def get_by_id(user_id):
        cursor = mysql.connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()
        cursor.close()
        return user

    @staticmethod
    def verify_credentials(email, password):
        user = User.get_by_email(email)
        if user and check_password(user['password'], password):
            return user
        return None