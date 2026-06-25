import os
import django

def reset():
    # Setup Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rivyou.settings')
    django.setup()
    
    from django.db import connection
    print("Dropping products_product and django_migrations tables...")
    with connection.cursor() as cursor:
        cursor.execute("DROP TABLE IF EXISTS products_product CASCADE;")
        cursor.execute("DROP TABLE IF EXISTS django_migrations CASCADE;")
    print("Database tables dropped successfully!")

if __name__ == '__main__':
    reset()
