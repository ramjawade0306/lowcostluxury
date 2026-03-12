import sqlite3
import datetime

conn = sqlite3.connect('prisma/dev.db')
cursor = conn.cursor()
cursor.execute('SELECT id, createdAt, total FROM "Order" ORDER BY createdAt DESC LIMIT 5')
orders = cursor.fetchall()
print("Recent 5 Orders:")
for o in orders:
    print(o)
conn.close()
