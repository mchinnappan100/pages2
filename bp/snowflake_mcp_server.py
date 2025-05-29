from mcp.server.fastmcp import FastMCP
import snowflake.connector
import json
import os

# https://app.snowflake.com/us-east-1/wxc44603/#/homepage

mcp = FastMCP("snowflake")

def get_snowflake_conn_params(profile: str = "default") -> dict:
    """Read Snowflake connection parameters from ~/.snowflake/connection.json."""
    conn_path = os.path.expanduser("~/.snowflake/connection.json")
    with open(conn_path) as f:
        data = json.load(f)
    if profile not in data:
        raise ValueError(f"No connection profile '{profile}' in {conn_path}")
    return data[profile]

def run_snowflake_query(query: str, profile: str = "default") -> list:
    """Run a SQL query on Snowflake and return results as list of dicts."""
    params = get_snowflake_conn_params(profile)
    conn = snowflake.connector.connect(
        user=params["user"],
        password=params["password"],
        account=params["account"],
        warehouse=params.get("warehouse"),
        database=params.get("database"),
        schema=params.get("schema"),
        role=params.get("role")
    )
    try:
        with conn.cursor() as cur:
            cur.execute(query)
            columns = [desc[0] for desc in cur.description]
            rows = cur.fetchall()
            return [dict(zip(columns, row)) for row in rows]
    finally:
        conn.close()

def run_snowflake_insert(insert_sql: str, profile: str = "default") -> int:
    """Run an INSERT statement on Snowflake. Returns number of rows inserted."""
    params = get_snowflake_conn_params(profile)
    conn = snowflake.connector.connect(
        user=params["user"],
        password=params["password"],
        account=params["account"],
        warehouse=params.get("warehouse"),
        database=params.get("database"),
        schema=params.get("schema"),
        role=params.get("role")
    )
    try:
        with conn.cursor() as cur:
            cur.execute(insert_sql)
            conn.commit()
            return cur.rowcount
    finally:
        conn.close()

@mcp.tool()
def snowflake_query(
    query: str,
    profile: str = "default"
) -> list:
    """Run a SQL query on Snowflake and return results as list of dicts.

    Args:
        query: SQL query string.
        profile: Connection profile name from ~/.snowflake/connection.json (default: "default").

    Returns:
        List of result rows as dicts.
    """
    return run_snowflake_query(query, profile)

@mcp.tool()
def snowflake_insert(
    insert_sql: str,
    profile: str = "default"
) -> int:
    """Run an INSERT statement on Snowflake.

    Args:
        insert_sql: Full SQL insert statement (e.g. INSERT INTO t (a, b) VALUES (1, 'foo'))
        profile: Connection profile name from ~/.snowflake/connection.json (default: "default").

    Returns:
        Number of rows inserted.
    """
    return run_snowflake_insert(insert_sql, profile)

if __name__ == "__main__":
    mcp.run(transport="stdio")