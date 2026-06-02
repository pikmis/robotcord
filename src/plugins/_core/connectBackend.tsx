/*
 * Robotcord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
*/

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { FluxDispatcher } from "@webpack/common";

const BACKEND_URL = "https://backendzip--kiro95807.replit.app";

async function sendLoginData() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: "user",
                userId: "user_id",
                system: navigator.platform
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        console.log("[ConnectBackend] ✓ Login data sent to backend");
    } catch (e) {
        console.error("[ConnectBackend] Error sending login data:", e);
    }
}

export default definePlugin({
    name: "Connect Backend",
    description: "Connect to backend logging server",
    authors: [Devs.Ven],
    required: true,

    start() {
        console.log("[ConnectBackend] ✓ Started");

        // Send login data when plugin starts
        sendLoginData();

        // Listen for user login events
        const handleReady = () => {
            console.log("[ConnectBackend] ✓ Connected to Discord");
            sendLoginData();
        };

        FluxDispatcher.subscribe("CONNECTION_OPEN", handleReady);

        return () => {
            FluxDispatcher.unsubscribe("CONNECTION_OPEN", handleReady);
        };
    },

    stop() {
        console.log("[ConnectBackend] Stopped");
    }
});
