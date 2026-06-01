# Remote Badges Setup Guide

## Overview

The Robotcord visuals plugin now supports **remote badges** that are loaded from a GitHub JSON file. These badges are visible to **all Robotcord users** and can be assigned to any Discord user ID.

## How It Works

1. **Badges are stored in `badges.json`** in the root of the repository
2. **All Robotcord users automatically load** these badges every 1 minute
3. **Badges are visible in user profiles** to all Robotcord users
4. **No local configuration needed** - just edit the JSON file and commit to GitHub

## Setup Instructions

### Step 1: Edit `badges.json`

The file is located at the root of the repository: `c:\robotcord\badges.json`

Format:
```json
{
  "user_id": [
    {
      "tooltip": "Badge name/description",
      "badge": "https://url-to-badge-image.png"
    }
  ]
}
```

### Step 2: Add Your Badges

Example:
```json
{
  "123456789": [
    {
      "tooltip": "Robotcord Developer",
      "badge": "https://cdn.discordapp.com/badge-icons/5e74e9b61934fc1f67c65515d1f7e60d.png"
    }
  ],
  "987654321": [
    {
      "tooltip": "Robotcord Contributor",
      "badge": "https://cdn.discordapp.com/badge-icons/3f9748e53446a137a052f3454e2de41e.png"
    },
    {
      "tooltip": "Bug Hunter",
      "badge": "https://cdn.discordapp.com/badge-icons/2717692c7dca7289b35297368a940dd0.png"
    }
  ]
}
```

### Step 3: Commit and Push to GitHub

```bash
git add badges.json
git commit -m "Add remote badges for users"
git push origin main
```

### Step 4: Verify

- Robotcord users will automatically load the badges within 1 minute
- You can manually reload badges from the "Визуалы" settings tab
- Badges will appear in user profiles for all Robotcord users

## Badge Image Sources

You can use badge images from:

### Discord Official Badges
- Staff: `https://cdn.discordapp.com/badge-icons/5e74e9b61934fc1f67c65515d1f7e60d.png`
- Partner: `https://cdn.discordapp.com/badge-icons/3f9748e53446a137a052f3454e2de41e.png`
- Moderator: `https://cdn.discordapp.com/badge-icons/fee1624003e2fee35cb398e125dc479b.png`
- HypeSquad Events: `https://cdn.discordapp.com/badge-icons/bf01d1073931f921909045f3a39fd264.png`
- HypeSquad Bravery: `https://cdn.discordapp.com/badge-icons/8a88d63823d8a71cd5e390baa45efa02.png`
- HypeSquad Brilliance: `https://cdn.discordapp.com/badge-icons/011940fd013da3f7fb926e4a1cd2e618.png`
- HypeSquad Balance: `https://cdn.discordapp.com/badge-icons/3aa41de486fa12454c3761e8e223442e.png`
- Bug Hunter Level 1: `https://cdn.discordapp.com/badge-icons/2717692c7dca7289b35297368a940dd0.png`
- Bug Hunter Level 2: `https://cdn.discordapp.com/badge-icons/848f79194d4be5ff5f81505cbd0ce1e6.png`
- Early Supporter: `https://cdn.discordapp.com/badge-icons/7060786766c9c840eb3019e725d2b358.png`
- Verified Bot Developer: `https://cdn.discordapp.com/badge-icons/6df5892e0f35b051f8b61eace34f4967.png`
- Active Developer: `https://cdn.discordapp.com/badge-icons/6bdc42827a38498929a4920da12695d9.png`

### Custom Images
- Any publicly accessible image URL (PNG, JPG, etc.)
- Images hosted on your own server
- Images from other CDNs

## Features

### Automatic Reloading
- Badges are automatically reloaded every 1 minute
- No need to restart Discord or Robotcord

### Manual Reload
- Users can manually reload badges from the "Визуалы" settings tab
- Click "Перезагрузить значки" button

### Badge Display
- Badges appear in user profiles
- Multiple badges per user are supported
- Badges are displayed in the order they appear in the JSON

### Visibility
- Remote badges are visible to **all Robotcord users**
- Local badges (Discord badges, custom badges) are only visible to the user who added them

## Troubleshooting

### Badges not showing up?

1. **Check the JSON format** - Make sure it's valid JSON
2. **Check the URL** - Make sure the badge image URL is accessible
3. **Check the user ID** - Make sure you're using the correct Discord user ID
4. **Reload manually** - Click "Перезагрузить значки" in the settings
5. **Check the console** - Look for error messages in the browser console (Ctrl+Shift+I)
6. **Wait for sync** - Badges are synced every 1 minute, so wait a bit

### How to find a Discord user ID?

1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
2. Right-click on a user and select "Copy User ID"
3. Use that ID in the `badges.json` file

## Example: Adding Badges for Multiple Users

```json
{
  "123456789": [
    {
      "tooltip": "Robotcord Developer",
      "badge": "https://cdn.discordapp.com/badge-icons/5e74e9b61934fc1f67c65515d1f7e60d.png"
    }
  ],
  "987654321": [
    {
      "tooltip": "Robotcord Contributor",
      "badge": "https://cdn.discordapp.com/badge-icons/3f9748e53446a137a052f3454e2de41e.png"
    },
    {
      "tooltip": "Bug Hunter",
      "badge": "https://cdn.discordapp.com/badge-icons/2717692c7dca7289b35297368a940dd0.png"
    }
  ],
  "555555555": [
    {
      "tooltip": "Community Manager",
      "badge": "https://example.com/custom-badge.png"
    }
  ]
}
```

## Notes

- Each user can have multiple badges
- Badges are displayed in the order they appear in the array
- The `tooltip` field is shown when hovering over the badge
- The `badge` field must be a valid image URL
- Changes to `badges.json` are automatically picked up (with a 1-minute refresh interval)
- Badges are loaded from GitHub raw content: `https://raw.githubusercontent.com/pikmis/robotcord/main/badges.json`
