# Remote Badges - Quick Start

## TL;DR

1. Edit `badges.json` in the root folder
2. Add user IDs and badge URLs
3. Commit and push
4. Done! Badges appear for all Robotcord users

## Example

```json
{
  "YOUR_USER_ID": [
    {
      "tooltip": "Your Badge Name",
      "badge": "https://cdn.discordapp.com/badge-icons/5e74e9b61934fc1f67c65515d1f7e60d.png"
    }
  ]
}
```

## Get Your User ID

1. Enable Developer Mode in Discord (Settings → Advanced → Developer Mode)
2. Right-click your name → Copy User ID

## Badge URLs

Use Discord's official badge icons or any image URL:

```
Staff: https://cdn.discordapp.com/badge-icons/5e74e9b61934fc1f67c65515d1f7e60d.png
Partner: https://cdn.discordapp.com/badge-icons/3f9748e53446a137a052f3454e2de41e.png
Moderator: https://cdn.discordapp.com/badge-icons/fee1624003e2fee35cb398e125dc479b.png
HypeSquad Events: https://cdn.discordapp.com/badge-icons/bf01d1073931f921909045f3a39fd264.png
HypeSquad Bravery: https://cdn.discordapp.com/badge-icons/8a88d63823d8a71cd5e390baa45efa02.png
HypeSquad Brilliance: https://cdn.discordapp.com/badge-icons/011940fd013da3f7fb926e4a1cd2e618.png
HypeSquad Balance: https://cdn.discordapp.com/badge-icons/3aa41de486fa12454c3761e8e223442e.png
Bug Hunter 1: https://cdn.discordapp.com/badge-icons/2717692c7dca7289b35297368a940dd0.png
Bug Hunter 2: https://cdn.discordapp.com/badge-icons/848f79194d4be5ff5f81505cbd0ce1e6.png
Early Supporter: https://cdn.discordapp.com/badge-icons/7060786766c9c840eb3019e725d2b358.png
Verified Dev: https://cdn.discordapp.com/badge-icons/6df5892e0f35b051f8b61eace34f4967.png
Active Dev: https://cdn.discordapp.com/badge-icons/6bdc42827a38498929a4920da12695d9.png
```

## Multiple Badges

```json
{
  "123456789": [
    {
      "tooltip": "Badge 1",
      "badge": "https://..."
    },
    {
      "tooltip": "Badge 2",
      "badge": "https://..."
    }
  ]
}
```

## View Badges

- Open Robotcord settings → Визуалы → Удалённые значки (из GitHub)
- Click "Перезагрузить значки" to manually reload

## Auto-Reload

Badges automatically reload every 5 minutes. No restart needed!

---

For more details, see `REMOTE_BADGES_SETUP.md`
