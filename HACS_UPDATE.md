# Water Tank Card v1.1.1 - HACS Compatibility Update

**Release Date:** 2026-04-26 (Updated)  
**Status:** ✅ HACS Compatible  
**Version:** 1.1.1  
**Previous:** v1.1.0  

---

## 🎯 What Changed in v1.1.1

### Critical Addition: HACS Support

The v1.1.0 release couldn't be discovered by HACS because the manifest was missing critical metadata. This release adds complete HACS compatibility.

### Changes Made

**manifest.json:**
```json
{
  ...existing fields...
  "lovelace": {
    "mode": "custom-element",
    "resources": [                    // NEW
      {
        "url": "/hacsfiles/water-tank-card/water-tank-card.js",
        "type": "module"
      }
    ]
  },
  "hacs": {                           // NEW
    "category": "lovelace",
    "zip_release": true,
    "filename": "water-tank-card.js"
  }
}
```

**What This Does:**
- `lovelace.resources` - Tells HACS the file paths and types
- `hacs.category` - Marks this as a Lovelace custom card
- `hacs.zip_release` - Enables proper ZIP distribution for HACS
- `hacs.filename` - Specifies the main file for HACS detection

---

## ✅ Now Works With HACS

### Installation via HACS (Recommended)

**Step 1: Add Custom Repository**
1. Open Home Assistant
2. Go to **HACS** → **Frontend**
3. Click the **⋮** (three dots) menu
4. Select **Custom repositories**
5. Paste URL: `https://github.com/HybridRCG/water-tank-card`
6. Category: **Lovelace**
7. Click **Create**

**Step 2: Install**
1. Refresh HACS or go back to Frontend
2. Search for "Water Tank Card"
3. Click the result
4. Click **Install**

**Step 3: Restart**
1. Go to **Settings** → **System** → **Restart Home Assistant**
2. Wait for full restart (~5 minutes)

**Step 4: Configure**
Add to your dashboard YAML:
```yaml
type: custom:water-tank-card
entity_level: sensor.tank_level
entity_liters: sensor.tank_liters
```

---

## 📊 Version Comparison

| Feature | v1.1.0 | v1.1.1 |
|---------|--------|--------|
| **Lovelace Support** | ✓ | ✓ |
| **HACS Discovery** | ✗ | ✓ |
| **Manual Install** | ✓ | ✓ |
| **Home Assistant 2024.1.0+** | ✓ | ✓ |
| **Documentation** | Extensive | Extensive |
| **Code Quality** | A- | A- |

---

## 🔄 Migration from v1.1.0

### If You Have v1.1.0 Installed Manually:

**You don't need to change anything!** Manual installations work perfectly with v1.1.1.

### To Switch to HACS Installation:

1. **Remove manual installation:**
   - Delete `/config/www/water-tank-card/` folder

2. **Install via HACS:**
   - Follow "Installation via HACS" steps above

3. **Restart Home Assistant**

4. **Update dashboard YAML** if needed

---

## 🚀 Why HACS Matters

With HACS support, you get:

✓ **Auto-Discovery** - Card shows up in HACS automatically  
✓ **One-Click Install** - No manual file management  
✓ **Update Notifications** - Know when new versions are available  
✓ **Easy Updates** - Update button in HACS  
✓ **Community Integration** - Card visible in HACS Community  

---

## 📝 Complete File Changes

### manifest.json
- ✅ Added `lovelace.resources` array with HACS file paths
- ✅ Added `hacs` configuration section
- ✅ Version: 1.1.0 → 1.1.1

### package.json
- ✅ Version: 1.1.0 → 1.1.1

### water-tank-card.js
- ✓ No changes (works perfectly as-is)

---

## ✨ Both Installation Methods Work

### Via HACS (Recommended):
```
HACS Frontend → Custom Repositories → Install Water Tank Card
```

### Manual (Still Works):
```bash
git clone https://github.com/HybridRCG/water-tank-card.git
# Copy water-tank-card.js to /config/www/water-tank-card/
```

Both methods work equally well. Choose what suits you best!

---

## 🔗 GitHub Links

- **Repository:** https://github.com/HybridRCG/water-tank-card
- **Latest Release:** https://github.com/HybridRCG/water-tank-card/releases/tag/v1.1.1
- **All Releases:** https://github.com/HybridRCG/water-tank-card/releases

---

## 📋 Checklist for Users

- [ ] Update to v1.1.1 (via HACS or GitHub)
- [ ] Restart Home Assistant
- [ ] Verify card loads without errors
- [ ] Check that card appears in card picker
- [ ] Configure with your entity IDs
- [ ] Test real-time updates

---

## 🎉 Summary

**v1.1.1 is a compatibility fix that enables HACS discovery and installation.**

- ✅ Same great card functionality
- ✅ Now discoverable in HACS
- ✅ One-click installation through HACS
- ✅ Fully backward compatible
- ✅ Manual installation still works

**Upgrade recommended for all users, but not required if you prefer manual installation.**

---

## 📞 Support

- **Issues:** https://github.com/HybridRCG/water-tank-card/issues
- **Documentation:** Check README.md, QUICK_FIX.md, TROUBLESHOOTING.md

---

**Release v1.1.1 | 2026-04-26 | HACS Compatible ✅**
