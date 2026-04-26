# Water Tank Card v1.2.0 - HACS Compatible Release

**Release Date:** 2026-04-26 (Final HACS Fix)  
**Status:** ✅ HACS Fully Compatible  
**Version:** 1.2.0  
**Issue:** v1.1.0 & v1.1.1 had incompatible manifest structure

---

## 🔴 Problem with v1.1.0 and v1.1.1

HACS validation failed because:
- ❌ Manifest contained custom `hacs` section (not standard)
- ❌ Manifest contained `lovelace.resources` array (conflicts with HACS handling)
- ❌ Over-complicated configuration for a simple custom card

HACS **expects a minimal manifest** for Lovelace cards without custom metadata.

---

## ✅ Solution: v1.2.0 - Clean Manifest

### Simplified manifest.json:
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
  "version": "1.2.0"
}
```

### Why This Works:
- ✅ Minimal, clean structure
- ✅ Only `lovelace.mode` declaration (standard)
- ✅ No custom `hacs` section (HACS auto-detects from GitHub)
- ✅ No `resources` array (HACS handles file paths)
- ✅ Fully HACS-compliant

---

## 🚀 HACS Installation (Now Works)

### Step-by-Step:

**1. Add Custom Repository:**
- Open Home Assistant
- Go to **HACS** → **Frontend**
- Click **⋮** (three dots) → **Custom repositories**
- Paste: `https://github.com/HybridRCG/water-tank-card`
- Category: **Lovelace**
- Click **Create**

**2. Install Card:**
- Search for "Water Tank Card"
- Click **Install**
- Restart Home Assistant

**3. Add to Dashboard:**
```yaml
type: custom:water-tank-card
entity_level: sensor.tank_level
entity_liters: sensor.tank_liters
title: "Water Tank"
```

---

## 📊 Version Comparison

| Version | Issue | HACS Status | Notes |
|---------|-------|-------------|-------|
| **v1.0.0** | Config error | ❌ Not compatible | Missing Lovelace declaration |
| **v1.1.0** | HACS incompatible | ❌ Failed | Over-complicated manifest |
| **v1.1.1** | Still incompatible | ❌ Failed | Wrong metadata structure |
| **v1.2.0** | ✅ FIXED | ✅ Works | Minimal, clean manifest |

---

## 🎯 What Changed from v1.1.1 to v1.2.0

### manifest.json Changes:
```diff
- "lovelace": {
-   "mode": "custom-element",
-   "resources": [
-     {
-       "url": "/hacsfiles/water-tank-card/water-tank-card.js",
-       "type": "module"
-     }
-   ]
- },
- "hacs": {
-   "category": "lovelace",
-   "zip_release": true,
-   "filename": "water-tank-card.js"
- }

+ "lovelace": {
+   "mode": "custom-element"
+ }
```

**Result:** Clean, minimal, HACS-compliant manifest

### Code Changes:
- ✓ `water-tank-card.js` - **No changes** (works perfectly)
- ↑ `manifest.json` - **Simplified** (removed problematic sections)
- ↑ `package.json` - Version 1.1.1 → 1.2.0

---

## ✨ Key Learning

**HACS Works Best With Minimal Manifests:**
- HACS auto-detects the integration type from GitHub repository structure
- For Lovelace custom cards, it only needs the `lovelace` mode declaration
- Custom metadata sections confuse HACS validators
- File paths and resources are managed entirely by HACS, not the manifest

**Lesson:** Sometimes simpler is better. Less configuration = fewer compatibility issues.

---

## 🔄 Migration Guide

### From v1.1.0/v1.1.1 to v1.2.0:

**If Using HACS:**
1. Remove the card from HACS
2. Update to v1.2.0
3. Reinstall from HACS
4. Restart Home Assistant
5. Card should now work ✓

**If Using Manual Installation:**
1. Download v1.2.0
2. Replace `manifest.json` in your install
3. Restart Home Assistant
4. No other changes needed

---

## 📋 Testing Checklist

- ✅ Manifest passes HACS validation
- ✅ Lovelace declaration present
- ✅ No extra metadata sections
- ✅ Card loads in Home Assistant
- ✅ Real-time updates work
- ✅ HACS discovers and installs card
- ✅ Manual installation still works

---

## 🎉 Summary

**v1.2.0 is the definitive HACS-compatible release:**

✅ Clean, minimal manifest  
✅ Full HACS compatibility  
✅ Same great card functionality  
✅ Comprehensive documentation  
✅ Zero breaking changes  

**Recommended:** Upgrade to v1.2.0 for full HACS support.

---

## 📞 Support

- **Issues:** https://github.com/HybridRCG/water-tank-card/issues
- **Documentation:**
  - Installation: `README.md`
  - Quick fix: `QUICK_FIX.md`
  - Troubleshooting: `TROUBLESHOOTING.md`
  - HACS setup: `HACS_COMPATIBLE.md` (this file)

---

**Release v1.2.0 | 2026-04-26 | HACS Fully Compatible ✅**
