/*
 * Robotcord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
*/

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { Modal, openModal, Text, TextInput, Button } from "@webpack/common";
import { RenderModalProps } from "@vencord/discord-types";
import { useState } from "@webpack/common";

interface UserOverride {
    userId: string;
    username?: string;
    globalName?: string;
    bio?: string;
    avatar?: string;
}

let userOverrides: Map<string, UserOverride> = new Map();

// Edit modal component
function EditUserModal(props: RenderModalProps & { userId: string; }) {
    const { userId, onClose } = props;
    const override = userOverrides.get(userId);

    const [username, setUsername] = useState(override?.username || "");
    const [displayName, setDisplayName] = useState(override?.globalName || "");
    const [bio, setBio] = useState(override?.bio || "");
    const [avatar, setAvatar] = useState(override?.avatar || "");

    const handleSave = () => {
        userOverrides.set(userId, {
            userId,
            username,
            globalName: displayName,
            bio,
            avatar
        });

        console.log("[FakeUserProfiles] ✓ Saved overrides for user:", userId);
        onClose();
    };

    return (
        <Modal {...props} size="small" title="Edit User Profile">
            <div style={{ padding: "16px" }}>
                <Text variant="text-md/bold" style={{ marginBottom: "8px" }}>USERNAME</Text>
                <TextInput
                    value={username}
                    onChange={setUsername}
                    placeholder="Enter username"
                    style={{ marginBottom: "16px" }}
                />

                <Text variant="text-md/bold" style={{ marginBottom: "8px" }}>DISPLAY NAME</Text>
                <TextInput
                    value={displayName}
                    onChange={setDisplayName}
                    placeholder="Enter display name"
                    style={{ marginBottom: "16px" }}
                />

                <Text variant="text-md/bold" style={{ marginBottom: "8px" }}>BIO</Text>
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Enter bio"
                    style={{
                        width: "100%",
                        padding: "10px",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "4px",
                        color: "var(--text-normal)",
                        fontSize: "14px",
                        boxSizing: "border-box",
                        fontFamily: "inherit",
                        resize: "vertical",
                        minHeight: "80px",
                        marginBottom: "16px"
                    }}
                />

                <Text variant="text-md/bold" style={{ marginBottom: "8px" }}>AVATAR URL</Text>
                <TextInput
                    value={avatar}
                    onChange={setAvatar}
                    placeholder="https://..."
                    style={{ marginBottom: "16px" }}
                />

                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <Button onClick={onClose} color={Button.Colors.SECONDARY} size={Button.Sizes.MEDIUM}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} color={Button.Colors.BRAND} size={Button.Sizes.MEDIUM}>
                        Save Changes
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

// Open edit modal
function showEditModal(userId: string) {
    openModal(props => <EditUserModal {...props} userId={userId} />);
}

// Patch profile menu
function patchUserProfileMenu() {
    try {
        setTimeout(() => {
            const separators = document.querySelectorAll(".separator_c1e9c4");
            if (separators.length >= 2) {
                const lastSeparator = separators[separators.length - 1];

                if (lastSeparator.nextElementSibling?.getAttribute("data-robotcord-edit") === "true") {
                    return;
                }

                const group = document.createElement("div");
                group.setAttribute("role", "group");
                group.setAttribute("data-robotcord-edit", "true");

                const item = document.createElement("div");
                item.className = "item_c1e9c4 labelContainer_c1e9c4 colorDefault_c1e9c4";
                item.setAttribute("role", "menuitem");
                item.setAttribute("tabindex", "-1");
                item.setAttribute("data-menu-item", "true");
                item.style.cursor = "pointer";

                const label = document.createElement("div");
                label.className = "label_c1e9c4";
                label.textContent = "Edit Profile";
                label.style.color = "#5865F2";

                item.appendChild(label);
                group.appendChild(item);
                lastSeparator.parentNode?.insertBefore(group, lastSeparator.nextSibling);

                const userIdEl = document.querySelector("[id*='user-profile-overflow-menu-devmode-copy-id']");
                const userIdMatch = userIdEl?.id?.match(/(\d+)$/);
                const userId = userIdMatch?.[1];

                if (userId) {
                    item.addEventListener("click", () => {
                        console.log("[FakeUserProfiles] Edit clicked for:", userId);
                        showEditModal(userId);
                    });
                }
            }
        }, 50);
    } catch (e) {
        console.error("[FakeUserProfiles] Error patching menu:", e);
    }
}

export default definePlugin({
    name: "Fake User Profiles",
    description: "Edit other users' profiles locally",
    authors: [Devs.Ven],
    required: true,

    start() {
        console.log("[FakeUserProfiles] ✓ Started");

        const observer = new MutationObserver(() => {
            const menu = document.querySelector("#user-profile-overflow-menu");
            if (menu) {
                patchUserProfileMenu();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log("[FakeUserProfiles] ✓ Started");
    },

    stop() {
        console.log("[FakeUserProfiles] Stopped");
    },

    // Export for patches
    getOverride(userId: string) {
        return userOverrides.get(userId);
    }
});
