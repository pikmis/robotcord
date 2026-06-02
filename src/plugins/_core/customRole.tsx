/*
 * Robotcord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
*/

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

interface CustomRole {
    id: string;
    name: string;
    color: string;
}

let customRoles: CustomRole[] = [];

function injectCustomRoles() {
    try {
        // Listen for role creation events
        window.addEventListener("robotcord-create-custom-role", (e: any) => {
            const role = e.detail;
            customRoles.push(role);
            console.log("[CustomRole] ✓ Custom role created:", role.name);
            injectRolesToAllProfiles();
        });

        // Listen for role deletion events
        window.addEventListener("robotcord-delete-custom-role", (e: any) => {
            const roleId = e.detail.id;
            customRoles = customRoles.filter(r => r.id !== roleId);
            console.log("[CustomRole] ✓ Custom role deleted");
            injectRolesToAllProfiles();
        });

        // Initial injection
        injectRolesToAllProfiles();
    } catch (e) {
        console.error("[CustomRole] Error setting up listeners:", e);
    }
}

function injectRolesToAllProfiles() {
    try {
        const containers = document.querySelectorAll("[class*='roleListContainer']");
        containers.forEach(container => {
            injectRolesToContainer(container as HTMLElement);
        });
    } catch (e) {
        console.error("[CustomRole] Error injecting roles:", e);
    }
}

function injectRolesToContainer(container: HTMLElement) {
    try {
        // Remove existing custom roles section
        const existing = container.querySelector("[data-robotcord-custom-roles]");
        if (existing) {
            existing.remove();
        }

        if (customRoles.length === 0) return;

        // Create custom roles section
        const section = document.createElement("div");
        section.setAttribute("data-robotcord-custom-roles", "true");
        section.style.marginTop = "12px";
        section.style.paddingTop = "12px";
        section.style.borderTop = "1px solid var(--border-subtle)";

        // Title
        const title = document.createElement("div");
        title.style.fontSize = "12px";
        title.style.fontWeight = "700";
        title.style.color = "var(--text-muted)";
        title.style.textTransform = "uppercase";
        title.style.marginBottom = "8px";
        title.textContent = "Custom Roles";
        section.appendChild(title);

        // Roles
        customRoles.forEach(role => {
            const roleEl = document.createElement("div");
            roleEl.style.display = "flex";
            roleEl.style.alignItems = "center";
            roleEl.style.gap = "8px";
            roleEl.style.padding = "8px";
            roleEl.style.marginBottom = "4px";
            roleEl.style.backgroundColor = "var(--bg-secondary)";
            roleEl.style.borderRadius = "4px";

            const colorDot = document.createElement("span");
            colorDot.style.display = "inline-block";
            colorDot.style.width = "12px";
            colorDot.style.height = "12px";
            colorDot.style.borderRadius = "50%";
            colorDot.style.backgroundColor = role.color;

            const nameSpan = document.createElement("span");
            nameSpan.style.fontSize = "13px";
            nameSpan.style.color = "var(--text-normal)";
            nameSpan.textContent = role.name;

            roleEl.appendChild(colorDot);
            roleEl.appendChild(nameSpan);
            section.appendChild(roleEl);
        });

        container.appendChild(section);
    } catch (e) {
        console.error("[CustomRole] Error injecting to container:", e);
    }
}

export default definePlugin({
    name: "Custom Role",
    description: "Add custom roles to user profiles",
    authors: [Devs.Ven],
    required: true,

    start() {
        console.log("[CustomRole] ✓ Started");

        // Set up mutation observer to detect new profile containers
        const observer = new MutationObserver(() => {
            injectRolesToAllProfiles();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        injectCustomRoles();
        console.log("[CustomRole] ✓ Started");
    },

    stop() {
        console.log("[CustomRole] Stopped");
    }
});
