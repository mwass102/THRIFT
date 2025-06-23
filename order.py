from ..utils.database import mysql

class Order:
    @staticmethod
    def create(user_id, total_amount, payment_method):
        cursor = mysql.connection.cursor()
        try:
            cursor.execute(
                "INSERT INTO orders (user_id, total_amount, payment_method) VALUES (%s, %s, %s)",
                (user_id, total_amount, payment_method)
            )
            order_id = cursor.lastrowid
            mysql.connection.commit()
            return order_id
        except Exception as e:
            mysql.connection.rollback()
            raise e
        finally:
            cursor.close()

    @staticmethod
    def add_order_items(order_id, items):
        cursor = mysql.connection.cursor()
        try:
            for item in items:
                cursor.execute(
                    """INSERT INTO order_items 
                    (order_id, product_id, quantity, price) 
                    VALUES (%s, %s, %s, %s)""",
                    (order_id, item['product_id'], item['quantity'], item['price'])
                )
            mysql.connection.commit()
            return True
        except Exception as e:
            mysql.connection.rollback()
            raise e
        finally:
            cursor.close()

    @staticmethod
    def update_status(order_id, status):
        cursor = mysql.connection.cursor()
        try:
            cursor.execute(
                "UPDATE orders SET status = %s WHERE order_id = %s",
                (status, order_id)
            )
            mysql.connection.commit()
            return True
        except Exception as e:
            mysql.connection.rollback()
            raise e
        finally:
            cursor.close()

    @staticmethod
    def get_by_id(order_id):
        cursor = mysql.connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM orders WHERE order_id = %s", (order_id,))
        order = cursor.fetchone()
        cursor.close()
        return order