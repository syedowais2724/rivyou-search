import os
import django

def reset():
    # Setup Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rivyou.settings')
    django.setup()
    
    from django.db import connection
    print("Resetting database schema (dropping public schema)...")
    with connection.cursor() as cursor:
        cursor.execute("DROP SCHEMA public CASCADE;")
        cursor.execute("CREATE SCHEMA public;")
        # Note: grant permissions on the new schema
        cursor.execute("GRANT ALL ON SCHEMA public TO public;")
        cursor.execute("GRANT ALL ON SCHEMA public TO rivyou;")
    print("Database schema reset successfully!")

if __name__ == '__main__':
    reset()
