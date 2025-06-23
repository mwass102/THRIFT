from flask_mysqldb import MySQL
from config import Config

mysql = MySQL()

def init_db(app):
    app.config['MYSQL_HOST'] = Config().DB_HOST
    app.config['MYSQL_USER'] = Config().DB_USER
    app.config['MYSQL_PASSWORD'] = Config().DB_PASSWORD
    app.config['MYSQL_DB'] = Config().DB_NAME
    mysql.init_app(app)