from mcp.server.fastmcp import FastMCP
import socket

mcp = FastMCP("whois")

def whois_query(domain: str) -> str:
    """Perform a WHOIS lookup for a domain name."""
    WHOIS_SERVER = "whois.iana.org"
    try:
        # Find the authoritative WHOIS server for the TLD
        with socket.create_connection((WHOIS_SERVER, 43), timeout=10) as s:
            s.sendall((domain + "\r\n").encode())
            response = b""
            while True:
                data = s.recv(4096)
                if not data:
                    break
                response += data
        response_text = response.decode(errors="ignore")
        # Find the "refer:" line for the authoritative server
        refer_line = next((line for line in response_text.splitlines() if line.lower().startswith("refer:")), None)
        if refer_line:
            whois_server = refer_line.split(":", 1)[1].strip()
        else:
            whois_server = WHOIS_SERVER

        # Query the authoritative WHOIS server
        with socket.create_connection((whois_server, 43), timeout=10) as s:
            s.sendall((domain + "\r\n").encode())
            response = b""
            while True:
                data = s.recv(4096)
                if not data:
                    break
                response += data
        return response.decode(errors="ignore")
    except Exception as e:
        return f"WHOIS lookup failed: {e}"

@mcp.tool()
def whois(domain: str) -> str:
    """Get WHOIS information for a domain name.

    Args:
        domain: The domain name to look up (e.g. example.com)

    Returns:
        The raw WHOIS response as a string.
    """
    return whois_query(domain)

if __name__ == "__main__":
    mcp.run(transport="stdio")