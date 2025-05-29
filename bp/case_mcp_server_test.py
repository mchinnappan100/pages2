import pytest
import types
import asyncio

import case_mcp_server

def test_send_email(capsys):
    """Test the send_email function prints and returns the correct message."""
    email = "test@example.com"
    case_number = "000123"
    msg = case_mcp_server.send_email(email, case_number)
    captured = capsys.readouterr()
    assert email in msg
    assert case_number in msg
    assert "We are working on your case" in msg
    assert captured.out.strip() == msg

def test_get_sf_conn(monkeypatch, tmp_path):
    """Test get_sf_conn loads correct data from sf_conn.json."""
    sf_conn_json = {
        "result": {
            "accessToken": "token123",
            "instanceUrl": "https://test.salesforce.com",
            "apiVersion": "59.0"
        }
    }
    sf_conn_path = tmp_path / "sf_conn.json"
    sf_conn_path.write_text(str(sf_conn_json).replace("'", '"'))
    monkeypatch.chdir(tmp_path)
    conn = case_mcp_server.get_sf_conn()
    assert conn["access_token"] == "token123"
    assert conn["instance_url"] == "https://test.salesforce.com"
    assert conn["api_version"] == "59.0"

@pytest.mark.asyncio
async def test_sf_query(monkeypatch):
    """Test sf_query returns records from Salesforce (mocked)."""
    # Mock httpx.AsyncClient.get to return a fake response
    class MockResponse:
        def raise_for_status(self): pass
        def json(self):
            return {"records": [{"Id": "1", "CaseNumber": "0001", "Contact": {"Email": "a@b.com"}}]}
    class MockClient:
        async def __aenter__(self): return self
        async def __aexit__(self, exc_type, exc, tb): pass
        async def get(self, url, headers=None, params=None, timeout=None):
            return MockResponse()
    monkeypatch.setattr(case_mcp_server.httpx, "AsyncClient", lambda: MockClient())
    sf_conn = {"instance_url": "url", "api_version": "v", "access_token": "tok"}
    soql = "SELECT Id FROM Case"
    records = await case_mcp_server.sf_query(soql, sf_conn)
    assert isinstance(records, list)
    assert records[0]["CaseNumber"] == "0001"

@pytest.mark.asyncio
async def test_get_unresolved_cases_and_notify(monkeypatch):
    """Test get_unresolved_cases_and_notify returns expected summary."""
    # Mock get_sf_conn to return dummy connection
    monkeypatch.setattr(case_mcp_server, "get_sf_conn", lambda: {"instance_url": "url", "api_version": "v", "access_token": "tok"})
    # Mock sf_query to return fake cases
    async def fake_sf_query(soql, sf_conn):
        return [
            {"CaseNumber": "0001", "Contact": {"Email": "a@b.com"}},
            {"CaseNumber": "0002", "Contact": {"Email": "b@c.com"}}
        ]
    monkeypatch.setattr(case_mcp_server, "sf_query", fake_sf_query)
    # Mock send_email to just return a string
    monkeypatch.setattr(case_mcp_server, "send_email", lambda email, num: f"Mock email to {email} for {num}")
    result = await case_mcp_server.get_unresolved_cases_and_notify()
    assert "Mock email to a@b.com for 0001" in result
    assert "Mock email to b@c.com for 0002" in result

@pytest.mark.asyncio
async def test_get_unresolved_cases_and_notify_none(monkeypatch):
    """Test get_unresolved_cases_and_notify returns message if no cases."""
    monkeypatch.setattr(case_mcp_server, "get_sf_conn", lambda: {})
    async def fake_sf_query(soql, sf_conn):
        return []
    monkeypatch.setattr(case_mcp_server, "sf_query", fake_sf_query)
    result = await case_mcp_server.get_unresolved_cases_and_notify()
    assert "No unresolved cases found" in result