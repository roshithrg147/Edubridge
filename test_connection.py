import psycopg2
import sys

def test_connection():
    host = "aws-1-ap-southeast-2.pooler.supabase.com"
    port = 5432
    user = "postgres.qzbdttfkakoqyxyawotj"
    password = "iKnowTheQuery"
    database = "postgres"
    
    # Try with SSL mode require as per Supabase docs
    dsn = f"host={host} port={port} user={user} password={password} dbname={database} sslmode=require"

    print(f"Testing connection to {host}:{port} as {user} with psycopg2...")

    try:
        conn = psycopg2.connect(dsn)
        print("SUCCESS: Connection established!")
        
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()
        print(f"Database Version: {version[0]}")
        
        cur.close()
        conn.close()
        return True
    except psycopg2.OperationalError as e:
        print(f"FAILURE: OperationalError: {e}")
        return False
    except Exception as e:
        print(f"FAILURE: Unexpected error: {e}")
        return False

if __name__ == "__main__":
    test_connection()
