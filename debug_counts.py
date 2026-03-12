import sqlite3

def check_counts():
    conn = sqlite3.connect('c:/Users/jawad/OneDrive/Desktop/Low cost/prisma/dev.db')
    cursor = conn.cursor()
    
    print("--- Categories and Product Counts ---")
    cursor.execute("""
        SELECT c.id, c.name, c.slug, COUNT(p.id) as product_count
        FROM Category c
        LEFT JOIN Product p ON c.id = p.categoryId
        GROUP BY c.id
    """)
    rows = cursor.fetchall()
    for row in rows:
        print(f"ID: {row[0]}, Name: {row[1]}, Slug: {row[2]}, Count: {row[3]}")
        
    print("\n--- Orphaned Products ---")
    cursor.execute("SELECT id, name, categoryId FROM Product WHERE categoryId NOT IN (SELECT id FROM Category)")
    orphans = cursor.fetchall()
    for o in orphans:
        print(o)

    conn.close()

if __name__ == "__main__":
    check_counts()
