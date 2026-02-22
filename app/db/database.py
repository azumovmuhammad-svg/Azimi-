import pymysql

def get_db():
    return pymysql.connect(
        host="127.0.0.1",
        port=3307,
        user="azimi_azimi0908",
        password='Parol12345',
        database="azimi_azimi",
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor
    )
