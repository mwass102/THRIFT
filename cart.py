from ..utils.database import mysql

class Cart:
    @staticmethod
    def get_user_cart(user_id):
        cursor = mysql.connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT c.cart_id, p.product_id, p.name, p.price, p.image_url, c.quantity 
            FROM cart c 
            JOIN products p ON c.product_id = p.product_id 
            WHERE c.user_id = %s
        """, (user_id,))
        items = cursor.fetchall()
        cursor.close()
        return items

    @staticmethod
    def add_item(user_id, product_id, quantity):
        cursor = mysql.connection.cursor()
        try:
            # Check if item already exists in cart
            cursor.execute(
                "SELECT * FROM cart WHERE user_id = %s AND product_id = %s",
                (user_id, product_id)
            )
            existing_item = cursor.fetchone()
            
            if existing_item:
                # Update quantity
                cursor.execute(
                    "UPDATE cart SET quantity = quantity + %s WHERE cart_id = %s",
                    (quantity, existing_item[0])
                )
            else:
                # Add new item
                cursor.execute(
                    "INSERT INTO cart (user_id, product_id, quantity) VALUES (%s, %s, %s)",
                    (user_id, product_id, quantity)
                )
            mysql.connection.commit()
            return True
        except Exception as e:
            mysql.connection.rollback()
            raise e
        finally:
            cursor.close()

    @staticmethod
    def update_quantity(cart_id, quantity):
        cursor = mysql.connection.cursor()
        try:
            cursor.execute(
                "UPDATE cart SET quantity = %s WHERE cart_id = %s",
                (quantity, cart_id)
            )
            mysql.connection.commit()
            return True
        except Exception as e:
            mysql.connection.rollback()
            raise e
        finally:
            cursor.close()

    @staticmethod
    def remove_item(cart_id):
        cursor = mysql.connection.cursor()
        try:
            cursor.execute("DELETE FROM cart WHERE cart_id = %s", (cart_id,))
            mysql.connection.commit()
            return cursor.rowcount > 0
        except Exception as e:
            mysql.connection.rollback()
            raise e
        finally:
            cursor.close()

    @staticmethod
    def get_cart_count(user_id):
        cursor = mysql.connection.cursor()
        cursor.execute(
            "SELECT SUM(quantity) FROM cart WHERE user_id = %s",
            (user_id,)
        )
        count = cursor.fetchone()[0] or 0
        cursor.close()
        return count

    @staticmethod
    def clear_cart(user_id):
        cursor = mysql.connection.cursor()
        try:
            cursor.execute("DELETE FROM cart WHERE user_id = %s", (user_id,))
            mysql.connection.commit()
            return True
        except Exception as e:
            mysql.connection.rollback()
            raise e
        finally:
            cursor.close()