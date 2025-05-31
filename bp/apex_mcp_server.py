from typing import Any
import httpx
import json
import subprocess
import os
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP("salesforce-apex")

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

def get_llm_model_from_config(config_path: str = "~/.llm/config.json") -> str:
    """Read the model name from the LLM config file."""
    config_path = os.path.expanduser(config_path)
    try:
        with open(config_path, "r") as f:
            config = json.load(f)
        return config.get("default", {}).get("model", "llama3:latest")
    except Exception as e:
        print(f"Could not read model from {config_path}: {e}")
        return "llama3:latest"

async def get_apex_class_by_name(class_name: str, sf_conn: dict[str, str]) -> dict[str, Any]:
    """Fetch Apex class metadata and body by name."""
    url = f"{sf_conn['instance_url']}/services/data/v{sf_conn['api_version']}/tooling/query"
    headers = {
        "Authorization": f"Bearer {sf_conn['access_token']}",
        "Content-Type": "application/json"
    }
    soql = f"SELECT Id, Name, Body FROM ApexClass WHERE Name = '{class_name}'"
    params = {"q": soql}
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers, params=params, timeout=30.0)
        resp.raise_for_status()
        records = resp.json()["records"]
        if not records:
            raise ValueError(f"Apex class '{class_name}' not found.")
        return records[0]

async def call_ollama_llama32(prompt: str) -> str:
    """Call local Ollama Llama3.2 model with the given prompt and return the response."""
    ollama_url = "http://localhost:11434/api/generate"
    model_name = get_llm_model_from_config()
    payload = {
        "model": model_name,
        "prompt": prompt,
        "stream": False
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(ollama_url, json=payload, timeout=60.0)
        resp.raise_for_status()
        data = resp.json()
        return data.get("response", "").strip()

@mcp.tool()
async def write_inline_doc_for_apex_class(
    class_name: str,
    username: str = "username"
) -> str:
    """Generate inline documentation for the given Apex class using local Llama3.2 LLM.

    Args:
        class_name: Name of the Apex class.
        username: Salesforce org username or alias.

    Returns:
        Apex class code with inline documentation.
    """
    sf_conn = get_sf_conn(username)
    apex_class = await get_apex_class_by_name(class_name, sf_conn)
    body = apex_class["Body"]
    prompt = (
        f"Add detailed inline documentation (Javadoc style) to the following Salesforce Apex class code. "
        f"Keep all code, just add meaningful doc comments above the class and each method. "
        f"Code:\n\n{body}\n"
    )
    doc_code = await call_ollama_llama32(prompt)
    return doc_code

@mcp.tool()
async def write_test_class_for_apex_class(
    class_name: str,
    username: str = "username"
) -> str:
    """Generate a test class for the given Apex class using local Llama3.2 LLM.

    Args:
        class_name: Name of the Apex class.
        username: Salesforce org username or alias.

    Returns:
        Apex test class code as a string.
    """
    sf_conn = get_sf_conn(username)
    apex_class = await get_apex_class_by_name(class_name, sf_conn)
    body = apex_class["Body"]
    prompt = (
        f"Write a Salesforce Apex test class for the following Apex class. "
        f"Include @isTest annotation and at least one test method that covers the main logic. "
        f"Class code:\n\n{body}\n"
    )
    test_code = await call_ollama_llama32(prompt)
    return test_code

@mcp.tool()
async def get_apex_class_code(
    class_name: str,
    username: str = "username"
) -> str:
    """Return the Apex class code for the given class name.

    Args:
        class_name: Name of the Apex class.
        username: Salesforce org username or alias.

    Returns:
        The Apex class code as a string.
    """
    sf_conn = get_sf_conn(username)
    apex_class = await get_apex_class_by_name(class_name, sf_conn)
    return apex_class["Body"]

if __name__ == "__main__":
    mcp.run(transport="stdio")