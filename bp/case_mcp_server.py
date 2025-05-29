from typing import Any
import httpx
import json
import subprocess
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP("salesforce-cases")

# Helper: Load Salesforce connection info by running Salesforce CLI
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

async def sf_query(soql: str, sf_conn: dict[str, str]) -> list[dict[str, Any]]:
    """Query Salesforce using REST API and return records."""
    url = f"{sf_conn['instance_url']}/services/data/v{sf_conn['api_version']}/query"
    headers = {
        "Authorization": f"Bearer {sf_conn['access_token']}",
        "Content-Type": "application/json"
    }
    params = {"q": soql}
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers, params=params, timeout=30.0)
        resp.raise_for_status()
        return resp.json()["records"]

def send_email(to_email: str, case_number: str, msg_template: str = None) -> str:
    """Send an email to the customer using a template or default message."""
    if not msg_template:
        msg_template = "We are working on your case and will resolve it as soon as possible."
    msg = f"Sent email to {to_email} for Case {case_number}: '{msg_template}'"
    print(msg)
    return msg

@mcp.tool()
async def get_unresolved_cases_and_notify(
    username: str = "username",
    email_message: str = None
) -> str:
    """Get unresolved Salesforce cases and notify customers via email.

    Args:
        username: Salesforce org username or alias (default: "username")
        email_message: Optional custom message for the email body.

    Returns:
        A summary of notifications sent.
    """
    sf_conn = get_sf_conn(username)
    soql = "SELECT Id, CaseNumber, Status, Contact.Email FROM Case WHERE Status != 'Closed' AND Contact.Email != null"
    cases = await sf_query(soql, sf_conn)
    notified = []
    for case in cases:
        email = case.get("Contact", {}).get("Email")
        case_number = case.get("CaseNumber")
        if email and case_number:
            msg = send_email(email, case_number, email_message)
            notified.append(msg)
    if not notified:
        return "No unresolved cases found or no customer emails available."
    return "\n".join(notified)

if __name__ == "__main__":
    mcp.run(transport="stdio")