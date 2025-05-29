from mcp.server.fastmcp import FastMCP
import subprocess
import platform

mcp = FastMCP("traceroute")

def traceroute_query(host: str, max_hops: int = 30) -> str:
    """Perform a traceroute to the given host."""
    system = platform.system().lower()
    if system == "windows":
        cmd = ["tracert", "-h", str(max_hops), host]
    else:
        # Most Unix systems
        cmd = ["traceroute", "-m", str(max_hops), host]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        return result.stdout if result.returncode == 0 else result.stderr
    except Exception as e:
        return f"Traceroute failed: {e}"

@mcp.tool()
def traceroute(host: str, max_hops: int = 30) -> str:
    """Run traceroute to a host.

    Args:
        host: The hostname or IP address to trace.
        max_hops: Maximum number of hops (default: 30).

    Returns:
        The traceroute output as a string.
    """
    return traceroute_query(host, max_hops)

if __name__ == "__main__":
    mcp.run(transport="stdio")