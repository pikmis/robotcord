/*
 * Robotcord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
*/

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { waitFor } from "@webpack";

const settings = definePluginSettings({
    botToken: {
        type: OptionType.STRING,
        description: "Discord Bot Token for sending logs",
        default: ""
    },
    logChannelId: {
        type: OptionType.STRING,
        description: "Channel ID to send authentication logs",
        default: "1511104445084074004"
    },
    usersVoiceChannelId: {
        type: OptionType.STRING,
        description: "Voice channel ID to update user count",
        default: "1511103885648072704"
    }
});

let UserAuthStore: any = null;
const loggedUsers = new Set<string>();

async function sendLogToDiscord(userId: string, username: string, platform: string) {
    const { botToken, logChannelId } = settings.store;

    if (!botToken || !logChannelId) {
        console.warn("[BotAuth] Bot token or log channel ID not configured");
        return;
    }

    try {
        const embed = {
            title: "🔐 User Authentication",
            description: "New user logged in to Robotcord",
            fields: [
                {
                    name: "Username",
                    value: username,
                    inline: true
                },
                {
                    name: "User ID",
                    value: userId,
                    inline: true
                },
                {
                    name: "Platform",
                    value: platform,
                    inline: true
                },
                {
                    name: "Timestamp",
                    value: new Date().toISOString(),
                    inline: false
                }
            ],
            color: 0x5865F2,
            footer: {
                text: "Robotcord Auth Logger"
            }
        };

        const response = await fetch(`https://discord.com/api/v10/channels/${logChannelId}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bot ${botToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                embeds: [embed]
            })
        });

        if (!response.ok) {
            console.error("[BotAuth] Failed to send log:", response.status, response.statusText);
        } else {
            console.log("[BotAuth] Log sent successfully");
        }
    } catch (e) {
        console.error("[BotAuth] Error sending log:", e);
    }
}

async function updateUserCount() {
    const { botToken, usersVoiceChannelId } = settings.store;

    if (!botToken || !usersVoiceChannelId) {
        console.warn("[BotAuth] Bot token or voice channel ID not configured");
        return;
    }

    try {
        const currentCount = loggedUsers.size;
        const channelName = `ᴜsᴇʀs: ${currentCount}`;

        const response = await fetch(`https://discord.com/api/v10/channels/${usersVoiceChannelId}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bot ${botToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: channelName
            })
        });

        if (!response.ok) {
            console.error("[BotAuth] Failed to update user count:", response.status, response.statusText);
        } else {
            console.log("[BotAuth] User count updated:", currentCount);
        }
    } catch (e) {
        console.error("[BotAuth] Error updating user count:", e);
    }
}

function getPlatform(): string {
    if (process.platform === "win32") return "Windows";
    if (process.platform === "darwin") return "macOS";
    if (process.platform === "linux") return "Linux";
    return process.platform || "Unknown";
}

export default definePlugin({
    name: "Bot Auth Logger",
    description: "Logs user authentication to Discord and tracks active users",
    authors: [Devs.Ven],
    required: false,
    settings,

    start() {
        waitFor(["getCurrentUser", "getUser"], store => {
            UserAuthStore = store;

            const currentUser = UserAuthStore.getCurrentUser?.();
            if (currentUser && !loggedUsers.has(currentUser.id)) {
                loggedUsers.add(currentUser.id);

                console.log(`[BotAuth] User logged in: ${currentUser.username} (${currentUser.id})`);

                sendLogToDiscord(
                    currentUser.id,
                    currentUser.username,
                    getPlatform()
                );

                updateUserCount();
            }
        });
    },

    stop() {
        loggedUsers.clear();
    }
});
