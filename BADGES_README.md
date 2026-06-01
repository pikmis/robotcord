# Remote Badges Configuration

The `badges.json` file in the root of the repository allows you to assign custom badges to Discord users that will be visible to all Robotcord users.

## Format

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

## Fields

- **user_id** (string): The Discord user ID of the person who should receive the badge
- **tooltip** (string): The text that appears when hovering over the badge
- **badge** (string): URL to the badge image (PNG, JPG, etc.)

## Example

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

## How to Use

1. Edit `badges.json` in the root of the repository
2. Add entries for users you want to give badges to
3. Commit and push your changes
4. Robotcord users will automatically load the badges (they reload every 5 minutes)
5. You can also manually reload badges from the "Визуалы" settings tab

## Badge Image Sources

You can use badge images from:
- Discord's official badge icons: `https://cdn.discordapp.com/badge-icons/{icon_id}.png`
- Any publicly accessible image URL
- Custom images hosted on your own server

## Notes

- Each user can have multiple badges
- Badges are displayed in the order they appear in the array
- The badges are visible to all Robotcord users
- Changes to `badges.json` are automatically picked up (with a 5-minute refresh interval)
