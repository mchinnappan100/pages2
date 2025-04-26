// Initialize Monaco Editor
require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.34.0/min/vs' } });
require(['vs/editor/editor.main'], () => {
  const editor = monaco.editor.create(document.getElementById('editor'), {
    value: JSON.stringify(generateManifest(), null, 2),
    language: 'json',
    theme: 'vs-dark',
    automaticLayout: true,
    
  });

  // Update editor on form changes
  document.getElementById('manifestForm').addEventListener('input', () => {
    const manifest = generateManifest();
    editor.setValue(JSON.stringify(manifest, null, 2));
  });

  // Toggle feature options visibility
  document.getElementById('sidePanel').addEventListener('change', (e) => {
    document.getElementById('sidePanelOptions').classList.toggle('hidden', !e.target.checked);
  });
  document.getElementById('background').addEventListener('change', (e) => {
    document.getElementById('backgroundOptions').classList.toggle('hidden', !e.target.checked);
  });
  document.getElementById('oauth').addEventListener('change', (e) => {
    document.getElementById('oauthOptions').classList.toggle('hidden', !e.target.checked);
  });
});

// Generate manifest.json based on form inputs
function generateManifest() {
  const name = document.getElementById('name').value || 'My Extension';
  const version = document.getElementById('version').value || '1.0';
  const description = document.getElementById('description').value || '';
  
  // Permissions
  const permissions = Array.from(document.querySelectorAll('input[name="permissions"]:checked'))
    .map(input => input.value);
  
  // Features
  const sidePanelEnabled = document.getElementById('sidePanel').checked;
  const backgroundEnabled = document.getElementById('background').checked;
  const oauthEnabled = document.getElementById('oauth').checked;

  // Base manifest
  const manifest = {
    manifest_version: 3,
    name,
    version,
    description: description || undefined,
    permissions: permissions.length ? permissions : undefined,
    options_page: "options.html",
    action: {
      "default_icon": {
        "16": "icons/icon16.png",
        "48": "icons/icon48.png",
        "128": "icons/icon128.png"
      }
    },
    icons: {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  };

  // Add side panel
  if (sidePanelEnabled) {
    const sidePanelPath = document.getElementById('sidePanelPath').value || 'sidepanel.html';
    manifest.side_panel = { default_path: sidePanelPath };
    if (!manifest.permissions) manifest.permissions = [];
    if (!manifest.permissions.includes('sidePanel')) manifest.permissions.push('sidePanel');
  }

  // Add background script
  if (backgroundEnabled) {
    const backgroundPath = document.getElementById('backgroundPath').value || 'background.js';
    manifest.background = { service_worker: backgroundPath };
  }

  // Add OAuth2
  if (oauthEnabled) {
    const clientId = document.getElementById('clientId').value || '';
    const scopes = document.getElementById('scopes').value.split(',').map(s => s.trim()).filter(s => s);
    if (clientId) {
      manifest.oauth2 = { client_id: clientId, scopes: scopes.length ? scopes : undefined };
      if (!manifest.permissions) manifest.permissions = [];
      if (!manifest.permissions.includes('identity')) manifest.permissions.push('identity');
    }
  }

  // Clean up undefined fields
  Object.keys(manifest).forEach(key => {
    if (manifest[key] === undefined) delete manifest[key];
  });

  return manifest;
}