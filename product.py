from ..utils.database import mysql

class Product:
    @staticmethod
    def get_all():
        cursor = mysql.connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM products")
        products = cursor.fetchall()
        cursor.close()
        return products

    @staticmethod
    def get_by_id(product_id):
        cursor = mysql.connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM products WHERE product_id = %s", (product_id,))
        product = cursor.fetchone()
        cursor.close()
        return product

    @staticmethod
    def get_by_category(category):
        cursor = mysql.connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM products WHERE category = %s", (category,))
        products = cursor.fetchall()
        cursor.close()
        return products

    @staticmethod
    def get_related_products(product_id, category):
        cursor = mysql.connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM products WHERE category = %s AND product_id != %s LIMIT 4",
            (category, product_id)
        )
        products = cursor.fetchall()
        cursor.close()
        return products