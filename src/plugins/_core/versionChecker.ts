/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { showNotification } from "@api/Notifications";
import { Logger } from "@utils/Logger";
import definePlugin, { StartAt } from "@utils/types";
import { React } from "@webpack/common";

const VersionCheckLogger = /* #__PURE__*/ new Logger("VersionChecker", "white");

const VERSION_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes
const VERSION_SERVER_URL = "https://raw.githubusercontent.com/pikmis/robotcordbd/refs/heads/main/version.json";
const INSTALLER_URL = "https://robotcord.rf.gd/download/installer/Robotcord-Installer.zip";

let versionCheckInterval: NodeJS.Timeout | null = null;
let lastCheckedVersion: string | null = null;
let currentVersion: string = "1.67.1"; // This should be updated based on your package.json or a version file

/**
 * Compare two semantic versions
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
function compareVersions(v1: string, v2: string): number {
    const normalize = (v: string) => v.split("-")[0]; // Remove suffix like "-beta-test"

    const parts1 = normalize(v1).split(".").map(Number);
    const parts2 = normalize(v2).split(".").map(Number);

    // Pad with zeros to make them the same length
    const maxLength = Math.max(parts1.length, parts2.length);
    while (parts1.length < maxLength) parts1.push(0);
    while (parts2.length < maxLength) parts2.push(0);

    for (let i = 0; i < maxLength; i++) {
        if (parts1[i] !== parts2[i]) {
            return parts1[i] < parts2[i] ? -1 : 1;
        }
    }

    return 0;
}

/**
 * Fetch the latest version from the server
 */
async function fetchLatestVersion(): Promise<string | null> {
    try {
        // Use VencordNative IPC to fetch without CORS issues
        const result = await VencordNative.native.versionCheckerFetch(VERSION_SERVER_URL);

        if (!result.ok) {
            VersionCheckLogger.warn(`Failed to fetch version: HTTP ${result.status}`);
            return null;
        }

        // Parse JSON response
        try {
            const json = JSON.parse(result.body || "{}");
            return json.version?.trim() || null;
        } catch (parseError) {
            VersionCheckLogger.error("Failed to parse version JSON:", parseError);
            return null;
        }
    } catch (error) {
        VersionCheckLogger.error("Error fetching latest version:", error);
        return null;
    }
}

/**
 * Show update notification modal
 */
function showUpdateNotification(newVersion: string) {
    const handleDownload = () => {
        // Simply open the installer URL in browser
        VencordNative.native.openExternal(INSTALLER_URL);
    };

    const handleNoThanks = () => {
        lastCheckedVersion = newVersion;
    };

    // Create the notification UI using React.createElement
    const notificationUI = React.createElement(
        "div",
        {
            style: {
                display: "flex",
                flexDirection: "column" as const,
                gap: "8px",
                padding: "0"
            }
        },
        React.createElement(
            "p",
            {
                style: {
                    margin: "0",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "14px",
                    lineHeight: "1.4"
                }
            },
            "I suggest you download the installer and update the version."
        ),
        React.createElement(
            "div",
            {
                style: {
                    display: "flex",
                    gap: "8px",
                    paddingTop: "8px"
                }
            },
            React.createElement(
                "button",
                {
                    onClick: handleDownload,
                    style: {
                        padding: "8px 16px",
                        backgroundColor: "#5865F2",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500" as const,
                        transition: "background-color 0.2s"
                    },
                    onMouseOver: (e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.backgroundColor = "#4752C4";
                    },
                    onMouseOut: (e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.backgroundColor = "#5865F2";
                    }
                },
                "Download update"
            ),
            React.createElement(
                "button",
                {
                    onClick: handleNoThanks,
                    style: {
                        padding: "8px 16px",
                        backgroundColor: "transparent",
                        color: "rgba(255,255,255,0.7)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500" as const,
                        transition: "all 0.2s"
                    },
                    onMouseOver: (e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                    },
                    onMouseOut: (e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                    }
                },
                "No thanks"
            )
        )
    );

    showNotification({
        title: "Hello! A new version has been released.",
        body: "I suggest you download the installer and update the version.",
        color: "#5865F2", // Discord blue
        permanent: true,
        noPersist: false,
        dismissOnClick: false,
        richBody: notificationUI,
    });
}

/**
 * Check for updates once
 */
async function checkForUpdatesOnce(): Promise<void> {
    try {
        const latestVersion = await fetchLatestVersion();

        if (!latestVersion) {
            VersionCheckLogger.warn("Could not fetch latest version");
            return;
        }

        VersionCheckLogger.log(`Latest version: ${latestVersion}, Current version: ${currentVersion}`);

        // Skip if we already notified about this version
        if (lastCheckedVersion === latestVersion) {
            return;
        }

        // Check if new version is available
        if (compareVersions(currentVersion, latestVersion) < 0) {
            VersionCheckLogger.info(`Update available: ${latestVersion}`);
            showUpdateNotification(latestVersion);
        }
    } catch (error) {
        VersionCheckLogger.error("Error during version check:", error);
    }
}

/**
 * Start periodic version checking
 */
function startVersionChecker(): void {
    if (IS_WEB) {
        VersionCheckLogger.warn("Version checker is disabled on web");
        return;
    }

    VersionCheckLogger.info("Starting version checker");

    // Check immediately on startup
    checkForUpdatesOnce();

    // Then check periodically every 30 minutes
    versionCheckInterval = setInterval(checkForUpdatesOnce, VERSION_CHECK_INTERVAL);
}

/**
 * Stop periodic version checking
 */
function stopVersionChecker(): void {
    if (versionCheckInterval) {
        clearInterval(versionCheckInterval);
        versionCheckInterval = null;
        VersionCheckLogger.info("Version checker stopped");
    }
}

export default definePlugin({
    name: "Version Checker",
    description: "Automatically checks for new versions every 30 minutes",
    authors: [{ name: "Version Checker", id: 0n }],
    required: true,

    start() {
        // Set current version from package.json
        setCurrentVersion("1.67.1");
        // Start checking for updates
        startVersionChecker();
        VersionCheckLogger.info("Version Checker plugin started");
    },

    stop() {
        // Stop checking for updates
        stopVersionChecker();
        VersionCheckLogger.info("Version Checker plugin stopped");
    }
});

/**
 * Set the current version (call this with the actual version from package.json)
 */
function setCurrentVersion(version: string): void {
    currentVersion = version;
    VersionCheckLogger.info(`Current version set to: ${version}`);
}
