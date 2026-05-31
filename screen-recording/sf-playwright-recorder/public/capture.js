/**
 * capture.js — injected into every page/frame by Playwright addInitScript.
 * Captures user interactions and sends them to the Node server via
 * the exposed __playwrightRecorderEvent function.
 *
 * Salesforce-aware:
 *  - Pierces shadow roots to build shadow-DOM paths for LWC/Aura components
 *  - Reads aria-label, lightning-input labels, and placeholder text
 */

(function () {
  'use strict';

  if (window.__sfRecorderInstalled) return;
  window.__sfRecorderInstalled = true;

  // ── Helpers ────────────────────────────────────────────────────────────────

  function getCssSelector(el) {
    if (!el || el === document.body) return 'body';
    const parts = [];
    let cur = el;
    while (cur && cur !== document.documentElement) {
      let seg = cur.tagName.toLowerCase();
      if (cur.id) {
        seg += '#' + cur.id;
        parts.unshift(seg);
        break;
      }
      const siblings = Array.from(cur.parentNode ? cur.parentNode.children : []);
      if (siblings.length > 1) {
        const idx = siblings.indexOf(cur) + 1;
        seg += `:nth-child(${idx})`;
      }
      parts.unshift(seg);
      cur = cur.parentNode;
    }
    return parts.join(' > ');
  }

  // Walk up into shadow hosts to build a shadow-piercing path
  function getShadowPath(el) {
    const path = [];
    let cur = el;
    while (cur && cur !== document.documentElement) {
      const root = cur.getRootNode();
      if (root instanceof ShadowRoot) {
        // inside shadow — record local selector, then step to host
        path.unshift(getCssSelector(cur));
        cur = root.host;
        path.unshift('>> ');
      } else {
        path.unshift(getCssSelector(cur));
        break;
      }
    }
    return path.length > 1 ? path : [];
  }

  function getAriaLabel(el) {
    return el.getAttribute('aria-label') ||
           el.getAttribute('aria-labelledby') && (
             document.getElementById(el.getAttribute('aria-labelledby')) || {}
           ).textContent ||
           null;
  }

  // Resolve an associated <label> element
  function getAssociatedLabel(el) {
    if (el.id) {
      const lbl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (lbl) return lbl.textContent.trim();
    }
    const parent = el.closest('label');
    if (parent) return parent.textContent.trim();
    // Salesforce lightning-input wraps inside shadow; look for label slot
    const host = el.closest('lightning-input, lightning-textarea, lightning-combobox');
    if (host) {
      const lbl = host.shadowRoot && host.shadowRoot.querySelector('label');
      if (lbl) return lbl.textContent.trim();
    }
    return null;
  }

  function getRole(el) {
    const explicit = el.getAttribute('role');
    if (explicit) return explicit;
    const map = {
      BUTTON: 'button', A: 'link', INPUT: el.type === 'checkbox' ? 'checkbox' : 'textbox',
      SELECT: 'combobox', TEXTAREA: 'textbox',
    };
    return map[el.tagName] || null;
  }

  function describeElement(el) {
    const desc = {
      tag: el.tagName,
      css: getCssSelector(el),
      ariaLabel: getAriaLabel(el),
      label: getAssociatedLabel(el),
      placeholder: el.getAttribute('placeholder') || null,
      role: getRole(el),
      // `name` here is the Playwright accessible name — NOT the HTML name attr.
      // Use aria-label or visible text only; never el.getAttribute('name').
      name: el.getAttribute('aria-label') || el.textContent.trim().slice(0, 80) || null,
      text: el.textContent.trim().slice(0, 80) || null,
      testId: el.getAttribute('data-testid') || el.getAttribute('data-id') || null,
      shadowPath: getShadowPath(el),
    };
    // Prefer ariaLabel as label if no form label found
    if (!desc.label && desc.ariaLabel) desc.label = desc.ariaLabel;
    return desc;
  }

  function send(event) {
    if (typeof window.__playwrightRecorderEvent === 'function') {
      window.__playwrightRecorderEvent(event);
    }
  }

  // ── Click ──────────────────────────────────────────────────────────────────

  document.addEventListener('click', (e) => {
    const el = e.target;
    if (!el || el === document.body) return;
    send({ type: 'click', element: describeElement(el), url: location.href });
  }, { capture: true, passive: true });

  // ── Input / Fill ───────────────────────────────────────────────────────────

  let fillTimer = null;
  let pendingFill = null;

  document.addEventListener('input', (e) => {
    const el = e.target;
    if (!['INPUT', 'TEXTAREA'].includes(el.tagName)) return;
    clearTimeout(fillTimer);
    pendingFill = { type: 'fill', element: describeElement(el), value: el.value, url: location.href };
    fillTimer = setTimeout(() => {
      if (pendingFill) send(pendingFill);
      pendingFill = null;
    }, 600);
  }, { capture: true, passive: true });

  // ── Select ─────────────────────────────────────────────────────────────────

  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el.tagName === 'SELECT') {
      send({ type: 'select', element: describeElement(el), value: el.value, url: location.href });
    }
    if (el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')) {
      send({ type: 'check', element: describeElement(el), checked: el.checked, url: location.href });
    }
  }, { capture: true, passive: true });

  // ── Key presses ────────────────────────────────────────────────────────────

  const NOTABLE_KEYS = new Set(['Enter', 'Escape', 'Tab', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight']);
  document.addEventListener('keydown', (e) => {
    if (!NOTABLE_KEYS.has(e.key)) return;
    // Flush any pending fill first
    if (pendingFill) { send(pendingFill); pendingFill = null; clearTimeout(fillTimer); }
    const mods = [];
    if (e.ctrlKey)  mods.push('Control');
    if (e.metaKey)  mods.push('Meta');
    if (e.shiftKey) mods.push('Shift');
    if (e.altKey)   mods.push('Alt');
    const key = mods.length ? mods.join('+') + '+' + e.key : e.key;
    send({ type: 'keypress', key, url: location.href });
  }, { capture: true, passive: true });

})();
