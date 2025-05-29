from mcp.server.fastmcp import FastMCP
import psycopg2
import json
import os

mcp = FastMCP("postgres")

def get_pg_conn_params(profile: str = "default") -> dict:
    """Read PostgreSQL connection parameters from ~/.pg/connection.json."""
    conn_path = os.path.expanduser("~/.pg/connection.json")
    with open(conn_path) as f:
        data = json.load(f)
    if profile not in data:
        raise ValueError(f"No connection profile '{profile}' in {conn_path}")
    return data[profile]

def run_pg_query(query: str, profile: str = "default") -> list:
    """Run a SQL query on PostgreSQL and return results as list of dicts."""
    params = get_pg_conn_params(profile)
    conn = psycopg2.connect(
        host=params["host"],
        port=params.get("port", 5432),
        user=params["user"],
        password=params["password"],
        dbname=params["dbname"]
    )
    try:
        with conn.cursor() as cur:
            cur.execute(query)
            columns = [desc[0] for desc in cur.description]
            rows = cur.fetchall()
            return [dict(zip(columns, row)) for row in rows]
    finally:
        conn.close()

def run_pg_insert(insert_sql: str, profile: str = "default") -> int:
    """Run an INSERT statement on PostgreSQL. Returns number of rows inserted."""
    params = get_pg_conn_params(profile)
    conn = psycopg2.connect(
        host=params["host"],
        port=params.get("port", 5432),
        user=params["user"],
        password=params["password"],
        dbname=params["dbname"]
    )
    try:
        with conn.cursor() as cur:
            cur.execute(insert_sql)
            conn.commit()
            return cur.rowcount
    finally:
        conn.close()

@mcp.tool()
def pg_query(
    query: str,
    profile: str = "default"
) -> list:
    """Run a SQL query on PostgreSQL and return results as list of dicts.

    Args:
        query: SQL query string.
        profile: Connection profile name from ~/.pg/connection.json (default: "default").

    Returns:
        List of result rows as dicts.
    """
    return run_pg_query(query, profile)

@mcp.tool()
def pg_insert(
    insert_sql: str,
    profile: str = "default"
) -> int:
    """Run an INSERT statement on PostgreSQL.

    Args:
        insert_sql: Full SQL insert statement (e.g. INSERT INTO t (a, b) VALUES (1, 'foo'))
        profile: Connection profile name from ~/.pg/connection.json (default: "default").

    Returns:
        Number of rows inserted.
    """
    return run_pg_insert(insert_sql, profile)

if __name__ == "__main__":
    mcp.run(transport="stdio")