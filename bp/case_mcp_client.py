import asyncio
from mcp.client.fastmcp import FastMCPClient

async def main():
    client = FastMCPClient("salesforce-cases")
    result = await client.call("get_unresolved_cases_and_notify")
    print("MCP Server Response:")
    print(result)

if __name__ == "__main__":
    asyncio.run(main())