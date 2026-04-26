# Water Tank Card - Diagnostic Analysis & Fixes

## Executive Summary

The water-tank-card project is **functionally sound** but has a **critical manifest configuration issue** preventing Home Assistant from loading it. Additional refinements are recommended for production deployment.

---

## Issues Identified

### 🔴 CRITICAL: Missing Custom Element Registration in manifest.json

**Problem:**\
The `manifest.json` is missing the required Lovelace custom card declaration. Home Assistant cannot discover the custom element without this metadata.

**Current manifest.json:**

```json
{
  "name": "Water Tank Card",
  "codeowners": ["@HybridRCG"],
  "config_flow": false,
  "documentation": "https://github.com/HybridRCG/water-tank-card",
  "domains": [],
  "homeassistant": "2024.1.0",
  "iot_class": "local_polling",
  "issue_tracker": "https://github.com/HybridRCG/water-tank-card/issues",
  "requirements": [],
  "version": "1.0.1"
}
```

**Issue:**\
Missing `"lovelace": { "mode": "custom-element" }` declaration that tells Home Assistant this is a Lovelace custom card.

---

### 🟡 MEDIUM: Card Installation Path Issue

The README recommends installing to `/config/www/water-tank-card/`, but the `package.json` lists `"main": "water-tank-card.js"` without clarifying the actual installation structure.

**Impact:**\
Users following the README may place files incorrectly, causing 404 errors when Home Assistant tries to load the card.

---

### 🟡 MEDIUM: Missing HACS Integration Metadata

While the card can be installed manually, HACS discovery is mentioned but not fully configured. Missing:

- Proper GitHub release structure
- dist/ folder with built artifacts (if needed)
- HACS-specific metadata

---

## Code Quality Assessment

### ✅ Strengths:

1. **Clean Class Structure**

   - Proper custom element lifecycle (setConfig, hass setter)
   - No setter recursion (uses private `_hass` field)
   - Efficient rendering with shadowRoot

2. **Responsive Design**

   - Uses `aspect-ratio: 1/1.2` for fluid scaling
   - Mobile-friendly CSS with max-width constraints
   - Proper viewport scaling

3. **Error Handling**

   - Checks for missing entities
   - Graceful fallback messaging
   - Safe state parsing (parseFloat with defaults)

4. **Customization**

   - Entity binding is flexible
   - Image paths are user-configurable
   - Sensible defaults provided

### ⚠️ Areas for Improvement:

1. **Accessibility**

   - No ARIA labels for screen readers
   - No semantic HTML structure (uses divs)
   - Color contrast may fail WCAG AA on some backgrounds

2. **Performance**

   - `this.render()` called on every hass update (though idempotent, could be optimized with state diffing)
   - No entity subscription filtering
   - Full innerHTML replacement on each render (minor impact but could use DOM patching)

3. **Browser Compatibility**

   - No polyfills declared for older browsers
   - Assumes CSS custom properties support (modern browsers only)

4. **Documentation**

   - No JSDoc comments
   - No inline comments explaining the private field pattern
   - Missing troubleshooting guide

---

## Installation Issues Checklist

### For Manual Installation:

Users should:

1. Create folder: `/config/www/water-tank-card/`
2. Place `water-tank-card.js` in that folder
3. Place custom images (if used) in `/config/www/TANK/`
4. Add Lovelace resource in Home Assistant frontend config
5. Restart Home Assistant or reload Lovelace frontend

**Problem:** README doesn't explain step 5 clearly.

### For HACS Installation:

HACS cannot currently discover this repo because:

- Repository is marked as a card, but lacks `lovelace` metadata
- No GitHub releases with versioned artifacts
- HACS looks for specific file structures

---

## Configuration Error Root Cause

When Home Assistant tries to load a custom card without proper manifest metadata:

```
Configuration error: Unknown card type "custom:water-tank-card"
```

This occurs because:

1. Home Assistant looks for card declaration in manifest.json
2. Finding none, it doesn't register the card type
3. Browser can't find `window.customCards` entry (which IS in the JS, but never executes)
4. Config validation fails before JavaScript loads

**The card JavaScript file contains the registration code**, but Home Assistant's YAML validation happens BEFORE the script loads.

---

## Recommended Fixes

### Fix #1: Update manifest.json (CRITICAL)

**Add Lovelace declaration:**

```json
{
  "name": "Water Tank Card",
  "codeowners": ["@HybridRCG"],
  "config_flow": false,
  "documentation": "https://github.com/HybridRCG/water-tank-card",
  "domains": [],
  "homeassistant": "2024.1.0",
  "iot_class": "local_polling",
  "issue_tracker": "https://github.com/HybridRCG/water-tank-card/issues",
  "lovelace": {
    "mode": "custom-element"
  },
  "requirements": [],
  "version": "1.0.1"
}
```

**This tells Home Assistant:** "This is a custom Lovelace card, load it as a custom element."

---

### Fix #2: Add HACS Manifest (OPTIONAL but recommended)

Create `.hacs-metadata` (hidden file) in root:

```json
{
  "homeassistant": "2024.1.0",
  "hacs": {
    "category": "lovelace",
    "filename": "water-tank-card.js"
  }
}
```

Or add to `package.json`:

```json
{
  ...
  "homeassistant": "2024.1.0",
  "hacs": {
    "category": "lovelace",
    "filename": "water-tank-card.js"
  }
}
```

---

### Fix #3: Enhanced README with Troubleshooting

Add to README after installation sections:

```markdown
## Troubleshooting

### "Unknown card type: custom:water-tank-card"
This error means Home Assistant hasn't loaded the card yet.

**Solutions:**
1. Verify the resource URL is correct:
   - Browser DevTools → Network → check for 404 on water-tank-card.js
2. Hard-refresh your browser: Ctrl+Shift+R (Cmd+Shift+R on Mac)
3. Clear Home Assistant frontend cache:
   - Settings → Developer Tools → Template
   - Call: `frontend.reload_themes`
4. Restart Home Assistant completely (not just reload Lovelace)

### Images not displaying
- Verify paths are correct: `/local/TANK/water_tank_background_clean.png`
- Check file exists: Settings → File Editor → browse `/config/www/`
- Browser console (F12 → Network) should show image loaded
- If 404: file is missing or path is wrong

### Card doesn't update when sensor changes
- Verify entity IDs exist in Developer Tools → States
- Check card configuration has correct entity IDs
- Look for red box with error message on card
```

---

### Fix #4: Add JSDoc Comments to JavaScript (OPTIONAL)

```javascript
/**
 * Water Tank Card - Custom Lovelace card for displaying water tank levels
 * @customElement water-tank-card
 * @element water-tank-card
 */
class WaterTankCard extends HTMLElement {
  /**
   * Constructor
   */
  constructor() {
    super();
    this._hass = null; // Private field - never triggers setter recursion
  }

  /**
   * Set card configuration from YAML
   * @param {Object} config - Card configuration object
   * @param {string} config.entity_level - Entity ID for tank level (0-100)
   * @param {string} config.entity_liters - Entity ID for remaining liters
   * @param {string} [config.title] - Card title
   * @param {string} [config.background_image] - Background image URL
   * @param {string} [config.fill_image] - Fill pattern image URL
   */
  setConfig(config) {
    this.config = config;
  }

  /**
   * Home Assistant object setter
   * Called by HA when states change; triggers re-render
   * @param {Object} hass - Home Assistant object with states
   */
  set hass(hass) {
    this._hass = hass;
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    this.render();
  }

  // ... rest of code
}
```

---

### Fix #5: Add Schema Validation (Optional but improves dev UX)

Add to water-tank-card.js after the class:

```javascript
customElements.define('water-tank-card', WaterTankCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'water-tank-card',
  name: 'Water Tank Card',
  description: 'Water tank level visualization with animation',
  preview: true,
  documentationURL: 'https://github.com/HybridRCG/water-tank-card'
});
```

---

## Step-by-Step Fix Implementation

### For Your Local Development:

1. **Update manifest.json:**

   ```bash
   # Add the "lovelace" key to manifest.json
   ```

2. **Test locally:**

   ```bash
   cd /Users/riaangrobler/water-tank-card
   cat manifest.json  # Verify changes
   ```

3. **Reinstall in Home Assistant:**

   - If HACS: Remove and reinstall repo
   - If Manual: Replace `water-tank-card.js` in `/config/www/water-tank-card/`
   - Restart Home Assistant

4. **Test the card:**

   - Go to Dashboard → Edit → Add card
   - Search for "Water Tank" or type `custom:water-tank-card`
   - Configure with your entity IDs

---

## Expected Behavior After Fix

### Before Fix:

```
✗ Home Assistant can't find the card type
✗ "Unknown card type: custom:water-tank-card" error
✗ Config validation fails in YAML editor
```

### After Fix:

```
✓ Home Assistant discovers the custom element
✓ Card appears in Lovelace card picker
✓ Config validates without errors
✓ Real-time updates as sensor states change
✓ Smooth animations on fill level changes
```

---

## Additional Recommendations

### For Production Release:

1. **Version Management**

   - Keep `manifest.json` and `package.json` versions in sync
   - Use semantic versioning (MAJOR.MINOR.PATCH)
   - Create GitHub releases for each version

2. **Testing**

   - Test with Home Assistant 2024.1.0+
   - Test with different entity state types (strings, numbers, unknowns)
   - Test with missing/unavailable entities
   - Test image loading with various CDNs and local paths

3. **Performance**

   - Monitor render frequency with many cards on dashboard
   - Consider entity subscription optimization
   - Profile memory usage with long-running instances

4. **Accessibility**

   - Add `role="img"` to main tank container
   - Add `aria-label` describing tank state
   - Ensure color contrast meets WCAG AA (4.5:1 for text)
   - Test with screen readers (NVDA, JAWS)

5. **Browser Compatibility**

   - Test in Chrome 90+, Firefox 88+, Safari 14+
   - Add fallback for browsers without CSS custom properties
   - Test on mobile browsers (iOS Safari, Chrome Mobile)

---

## Files to Modify

FileChangePriority`manifest.json`Add `"lovelace": {"mode": "custom-element"}`🔴 CRITICAL`README.md`Add troubleshooting section🟡 Medium`water-tank-card.js`Add JSDoc comments🟢 Nice-to-have`package.json`Add HACS metadata🟢 Nice-to-have

---

## Summary

Your card is **well-engineered** but blocked by a **simple configuration issue**. The fix is a single addition to `manifest.json`. After that, Home Assistant will properly discover and load your custom element.

**Estimated fix time: 5 minutes**\
**Estimated testing time: 5 minutes**\
**Total: 10 minutes to production-ready**

---

## Questions?

For more help:

- Home Assistant custom card docs: <https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card>
- Lovelace development: <https://github.com/home-assistant/frontend/blob/dev/docs/development.md>
- Community help: <https://github.com/home-assistant/frontend/discussions>
