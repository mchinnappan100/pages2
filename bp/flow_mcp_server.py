from typing import Any
import httpx
import json
import subprocess
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP("salesforce-flow")


def get_sf_conn(username: str = "username") -> dict[str, str]:
    """Run Salesforce CLI to get connection info (accessToken, instanceUrl, apiVersion)."""
    try:
        result = subprocess.run(
            ["sf", "force", "org", "display", "-u", username, "--json"],
            capture_output=True,
            check=True,
            text=True
        )
        data = json.loads(result.stdout)
        return {
            "access_token": data["result"]["accessToken"],
            "instance_url": data["result"]["instanceUrl"],
            "api_version": data["result"]["apiVersion"]
        }
    except Exception as e:
        raise RuntimeError(f"Failed to get Salesforce connection info: {e}")

async def run_flow(
    flow_api_name: str,
    input_variables: dict[str, Any],
    sf_conn: dict[str, str]
) -> dict[str, Any]:
    """Invoke a Salesforce Flow via REST API."""
    url = f"{sf_conn['instance_url']}/services/data/v{sf_conn['api_version']}/actions/custom/flow/{flow_api_name}"
    headers = {
        "Authorization": f"Bearer {sf_conn['access_token']}",
        "Content-Type": "application/json"
    }
    payload = {"inputs": [input_variables]}
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, headers=headers, json=payload, timeout=30.0)
        resp.raise_for_status()
        return resp.json()

@mcp.tool()
async def call_salesforce_flow(
    flow_api_name: str,
    input_variables: dict = {},
    username: str = "username"
) -> dict:
    """Call a Salesforce Flow by API name and input variables.

    Args:
        flow_api_name: The API name of the Flow (e.g., 'My_Flow').
        input_variables: Dictionary of input variables for the Flow.
        username: Salesforce org username or alias (default: "username").

    Returns:
        The Flow result as a dictionary.
    """
    sf_conn = get_sf_conn(username)
    result = await run_flow(flow_api_name, input_variables, sf_conn)
    return result

if __name__ == "__main__":
    mcp.run(transport="stdio")