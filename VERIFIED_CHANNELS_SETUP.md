# Verified Channels Setup Guide

## Overview

The Robotcord visuals plugin now supports **verified channels** that are marked with a verification badge. These badges are visible to **all Robotcord users** and indicate that a channel has been verified by the Robotcord team.

## How It Works

1. **Verified channels are stored in `verified-channels.json`** in the root of the repository
2. **All Robotcord users automatically load** these verified channels every 1 minute
3. **Verification badges appear in channel headers** for all Robotcord users
4. **No local configuration needed** - just edit the JSON file and commit to GitHub

## Setup Instructions

### Step 1: Edit `verified-channels.json`

The file is located at the root of the repository: `c:\robotcord\verified-channels.json`

Format:
```json
{
  "channel_id": {
    "tooltip": "Verification description",
    "badge": "verified"
  }
}
```

### Step 2: Add Verified Channels

Example:
```json
{
  "1493612905294205030": {
    "tooltip": "Verified by Robotcord",
    "badge": "verified"
  },
  "1492633319903330354": {
    "tooltip": "Official Robotcord Channel",
    "badge": "verified"
  },
  "1234567890123456789": {
    "tooltip": "Community Partner",
    "badge": "verified"
  }
}
```

### Step 3: Commit and Push to GitHub

```bash
git add verified-channels.json
git commit -m "Add verified channels"
git push origin main
```

### Step 4: Verify

- Robotcord users will automatically load the verified channels within 1 minute
- Verification badges will appear in channel headers for all Robotcord users
- The tooltip will show when hovering over the verification badge

## Badge Types

Currently supported badge types:
- `"verified"` - Standard Robotcord verification badge

## Features

### Automatic Reloading
- Verified channels are automatically reloaded every 1 minute
- No need to restart Discord or Robotcord

### Badge Display
- Verification badges appear in channel headers
- Badges are displayed next to the channel name
- Multiple verified channels are supported

### Visibility
- Verified channel badges are visible to **all Robotcord users**
- Only channels listed in `verified-channels.json` show the badge

## Troubleshooting

### Badges not showing up?

1. **Check the JSON format** - Make sure it's valid JSON
2. **Check the channel ID** - Make sure you're using the correct Discord channel ID
3. **Check the console** - Look for error messages in the browser console (Ctrl+Shift+I)
4. **Wait for sync** - Verified channels are synced every 1 minute, so wait a bit

### How to find a Discord channel ID?

1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
2. Right-click on a channel and select "Copy Channel ID"
3. Use that ID in the `verified-channels.json` file

## Example: Adding Multiple Verified Channels

```json
{
  "1493612905294205030": {
    "tooltip": "Verified by Robotcord",
    "badge": "verified"
  },
  "1492633319903330354": {
    "tooltip": "Official Robotcord Channel",
    "badge": "verified"
  },
  "1234567890123456789": {
    "tooltip": "Community Partner",
    "badge": "verified"
  },
  "9876543210987654321": {
    "tooltip": "Trusted Community",
    "badge": "verified"
  }
}
```

## Notes

- Each channel can have one verification badge
- The `tooltip` field is shown when hovering over the badge
- The `badge` field should be set to `"verified"` for now
- Changes to `verified-channels.json` are automatically picked up (with a 1-minute refresh interval)
- Verified channels are loaded from GitHub raw content: `https://raw.githubusercontent.com/pikmis/robotcord/main/verified-channels.json`

## API for Plugin Developers

If you want to check if a channel is verified in your plugin:

```typescript
import { Plugins } from "@webpack/common";

const visualsPlugin = Plugins.plugins["Визуалы"];

// Check if a channel is verified
if (visualsPlugin.isChannelVerified(channelId)) {
    console.log("Channel is verified!");
}

// Get verified channel info
const info = visualsPlugin.getVerifiedChannelInfo(channelId);
console.log(info.tooltip); // "Verified by Robotcord"

// Get all verified channels
const allVerified = visualsPlugin.verifiedChannels;
console.log(allVerified);
```
