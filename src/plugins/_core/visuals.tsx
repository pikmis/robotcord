/*
 * Robotcord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
*/

import { addProfileBadge, BadgePosition, ProfileBadge, removeProfileBadge } from "@api/Badges";
import { Settings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { waitFor } from "@webpack";
import { useEffect, useState } from "@webpack/common";
import { React, i18n } from "@webpack/common";
import virtualMerge from "virtual-merge";

// ─── Localization ─────────────────────────────────────────────────────────────

const localizationStrings = {
    en: {
        customUsername: "Custom Username",
        customDisplayName: "Custom Display Name",
        customBio: "Custom Bio",
        customAvatar: "Custom Avatar URL",
        fakeNitro: "Fake Nitro",
        profileColors: "Profile Colors",
        primaryColor: "Primary Color",
        accentColor: "Accent Color",
        badges: "Badges",
        selectBadges: "Select Badges",
        customBadges: "Custom Badges",
        addBadge: "Add Badge",
        avatarDecoration: "Avatar Decoration",
        selectDecoration: "Select Decoration"
    },
    ru: {
        customUsername: "Кастомный юзернейм",
        customDisplayName: "Кастомное отображаемое имя",
        customBio: "Кастомная биография",
        customAvatar: "URL кастомного аватара",
        fakeNitro: "Поддельный Nitro",
        profileColors: "Цвета профиля",
        primaryColor: "Основной цвет",
        accentColor: "Цвет акцента",
        badges: "Значки",
        selectBadges: "Выберите значки",
        customBadges: "Кастомные значки",
        addBadge: "Добавить значок",
        avatarDecoration: "Украшение аватара",
        selectDecoration: "Выберите украшение"
    }
};

// Get current locale from Discord
function getCurrentLocale(): "en" | "ru" {
    try {
        const locale = i18n?.intl?.locale || "en-US";
        return locale.startsWith("ru") ? "ru" : "en";
    } catch {
        return "en";
    }
}

// Export for other components
export { getCurrentLocale };

// Get localized string
function t(key: keyof typeof localizationStrings.en): string {
    const locale = getCurrentLocale();
    return localizationStrings[locale]?.[key] || localizationStrings.en[key] || key;
}

// ─── Remote badges from GitHub ────────────────────────────────────────────────

const REMOTE_BADGES_URL = "https://raw.githubusercontent.com/pikmis/robotcordbd/main/badges.json";
const VERIFIED_CHANNELS_URL = "https://raw.githubusercontent.com/pikmis/robotcordbd/refs/heads/main/verified-channels.json";

type RemoteBadgeEntry = { tooltip: string; badge: string; };
type VerifiedChannelEntry = { tooltip: string; badge: string; };

let RemoteBadges: Record<string, RemoteBadgeEntry[]> = {};
let VerifiedChannels: Record<string, VerifiedChannelEntry> = {};

async function loadRemoteBadges(noCache = false) {
    try {
        const init: RequestInit = noCache ? { cache: "no-cache" } : {};
        console.log("[Визуалы] Fetching badges from:", REMOTE_BADGES_URL);
        const response = await fetch(REMOTE_BADGES_URL, init);
        console.log("[Визуалы] Response status:", response.status, response.statusText);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();
        console.log("[Визуалы] Raw response:", text.substring(0, 200));

        const data = JSON.parse(text);
        RemoteBadges = data || {};
        console.log("[Визуалы] Loaded remote badges:", RemoteBadges);
        // Re-sync badges after loading remote badges
        syncBadges();
    } catch (e) {
        console.error("[Визуалы] Failed to load remote badges:", e);
        RemoteBadges = {};
    }
}

async function loadVerifiedChannels(noCache = false) {
    try {
        const init: RequestInit = noCache ? { cache: "no-cache" } : {};
        console.log("[Визуалы] Fetching verified channels from:", VERIFIED_CHANNELS_URL);
        const response = await fetch(VERIFIED_CHANNELS_URL, init);
        console.log("[Визуалы] Verified channels response status:", response.status, response.statusText);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();
        const data = JSON.parse(text);
        VerifiedChannels = data || {};
        console.log("[Визуалы] Loaded verified channels:", VerifiedChannels);
    } catch (e) {
        console.error("[Визуалы] Failed to load verified channels:", e);
        VerifiedChannels = {};
    }
}

// ─── Discord badge definitions ────────────────────────────────────────────────

export interface BadgeOption {
    id: string;
    label: string;
    description: string;
    iconUrl: string;
}

export const DISCORD_BADGES: BadgeOption[] = [
    { id: "staff", label: "Discord Staff", description: "Discord Staff", iconUrl: "https://cdn.discordapp.com/badge-icons/5e74e9b61934fc1f67c65515d1f7e60d.png" },
    { id: "partner", label: "Partnered Server Owner", description: "Partnered Server Owner", iconUrl: "https://cdn.discordapp.com/badge-icons/3f9748e53446a137a052f3454e2de41e.png" },
    { id: "moderator", label: "Moderator Programs Alumni", description: "Moderator Programs Alumni", iconUrl: "https://cdn.discordapp.com/badge-icons/fee1624003e2fee35cb398e125dc479b.png" },
    { id: "hypesquad_events", label: "HypeSquad Events", description: "HypeSquad Events", iconUrl: "https://cdn.discordapp.com/badge-icons/bf01d1073931f921909045f3a39fd264.png" },
    { id: "hypesquad_bravery", label: "HypeSquad Bravery", description: "HypeSquad House Bravery", iconUrl: "https://cdn.discordapp.com/badge-icons/8a88d63823d8a71cd5e390baa45efa02.png" },
    { id: "hypesquad_brilliance", label: "HypeSquad Brilliance", description: "HypeSquad House Brilliance", iconUrl: "https://cdn.discordapp.com/badge-icons/011940fd013da3f7fb926e4a1cd2e618.png" },
    { id: "hypesquad_balance", label: "HypeSquad Balance", description: "HypeSquad House Balance", iconUrl: "https://cdn.discordapp.com/badge-icons/3aa41de486fa12454c3761e8e223442e.png" },
    { id: "bug_hunter_1", label: "Bug Hunter Level 1", description: "Discord Bug Hunter", iconUrl: "https://cdn.discordapp.com/badge-icons/2717692c7dca7289b35297368a940dd0.png" },
    { id: "bug_hunter_2", label: "Bug Hunter Level 2", description: "Discord Bug Hunter", iconUrl: "https://cdn.discordapp.com/badge-icons/848f79194d4be5ff5f81505cbd0ce1e6.png" },
    { id: "early_supporter", label: "Early Supporter", description: "Early Nitro Supporter", iconUrl: "https://cdn.discordapp.com/badge-icons/7060786766c9c840eb3019e725d2b358.png" },
    { id: "verified_dev", label: "Early Verified Bot Developer", description: "Early Verified Bot Developer", iconUrl: "https://cdn.discordapp.com/badge-icons/6df5892e0f35b051f8b61eace34f4967.png" },
    { id: "active_dev", label: "Active Developer", description: "Active Developer", iconUrl: "https://cdn.discordapp.com/badge-icons/6bdc42827a38498929a4920da12695d9.png" },
];

// ─── Avatar decorations ───────────────────────────────────────────────────────

export interface DecorationOption {
    id: string;
    label: string;
    asset: string;
    previewUrl: string;
}

// Known Discord avatar decoration SKU IDs
// Preview URL format: https://cdn.discordapp.com/media/v1/collectibles-shop/{sku_id}/static
const KNOWN_DECORATION_SKUS: Array<{ id: string; label: string; }> = [
    { id: "1144058522808614923", label: "Flames" },
    { id: "1144058522808614924", label: "Sakura" },
    { id: "1144058522808614925", label: "Stars" },
    { id: "1144058522808614926", label: "Leaves" },
    { id: "1144058522808614927", label: "Bubbles" },
    { id: "1144058522808614928", label: "Snowflakes" },
    { id: "1144058522808614929", label: "Hearts" },
    { id: "1144058522808614930", label: "Lightning" },
    { id: "1144058522808614931", label: "Vines" },
    { id: "1144058522808614932", label: "Crystals" },
    { id: "1144058522808614933", label: "Mushrooms" },
    { id: "1144058522808614934", label: "Flowers" },
    { id: "1144058522808614935", label: "Clouds" },
    { id: "1144058522808614936", label: "Neon" },
    { id: "1144058522808614937", label: "Glitch" },
    { id: "1144058522808614938", label: "Holographic" },
    { id: "1144058522808614939", label: "Retro" },
    { id: "1144058522808614940", label: "Cyber" },
    { id: "1144058522808614941", label: "Galaxy" },
    { id: "1144058522808614942", label: "Rainbow" },
    { id: "1506049399703474186", label: "Shadow World" },
    { id: "1499479368362360887", label: "Decoration 1" },
    { id: "1499479355875791029", label: "Decoration 2" },
    { id: "1499479412821725254", label: "Decoration 3" },
    { id: "1499479437857788155", label: "Decoration 4" },
];

export let availableDecorations: DecorationOption[] = KNOWN_DECORATION_SKUS.map(d => ({
    id: d.id,
    label: d.label,
    asset: `https://cdn.discordapp.com/media/v1/collectibles-shop/${d.id}/static`,
    previewUrl: `https://cdn.discordapp.com/media/v1/collectibles-shop/${d.id}/static`,
}));

export async function loadDecorations(): Promise<DecorationOption[]> {
    try {
        const token = (window as any).Vencord?.Webpack?.findByProps?.("getToken")?.getToken?.() ?? "";
        if (!token) return availableDecorations;

        // Try storefront endpoint — this is what Discord uses in the shop
        const res = await fetch("https://discord.com/api/v9/storefront/primary-promotions?locale=en-US&country_code=US", {
            headers: { Authorization: token }
        });

        if (!res.ok) return availableDecorations;
        const data = await res.json();

        const decorations: DecorationOption[] = [];
        const items: any[] = data?.items ?? data?.products ?? data ?? [];

        for (const item of items) {
            const skuId: string = String(item?.sku_id ?? item?.id ?? "");
            if (!skuId) continue;

            // Only avatar decorations have this media URL pattern
            const previewUrl = `https://cdn.discordapp.com/media/v1/collectibles-shop/${skuId}/static`;
            const label: string = item?.name ?? item?.label ?? skuId;

            decorations.push({ id: skuId, label, asset: previewUrl, previewUrl });
        }

        if (decorations.length > 0) {
            availableDecorations = decorations;
        }

        return availableDecorations;
    } catch {
        return availableDecorations;
    }
}

// ─── Username, Display Name, Bio, Avatar ──────────────────────────────────────

let UserStore: any;
let _originalUsername: string | null = null;
let _originalDisplayName: string | null = null;
let _originalBio: string | null = null;
let _originalAvatar: string | null = null;

function getCustomUsername(): string | null {
    const custom: string = Settings.plugins["Визуалы"]?.customUsername ?? "";
    return custom.trim() || null;
}

function getCustomDisplayName(): string | null {
    const custom: string = Settings.plugins["Визуалы"]?.customDisplayName ?? "";
    return custom.trim() || null;
}

function getCustomBio(): string | null {
    const custom: string = Settings.plugins["Визуалы"]?.customBio ?? "";
    return custom.trim() || null;
}

function getCustomAvatar(): string | null {
    const custom: string = Settings.plugins["Визуалы"]?.customAvatar ?? "";
    return custom.trim() || null;
}

export function applyUsername() {
    if (!UserStore) return;
    const user = UserStore.getCurrentUser?.();
    if (!user) return;
    if (_originalUsername === null) _originalUsername = user.username;
    user.username = getCustomUsername() ?? _originalUsername;
}

export function applyDisplayName() {
    if (!UserStore) return;
    const user = UserStore.getCurrentUser?.();
    if (!user) return;
    if (_originalDisplayName === null) _originalDisplayName = user.globalName ?? "";
    user.globalName = getCustomDisplayName() ?? _originalDisplayName;
}

export function applyBio() {
    if (!UserStore) return;
    const user = UserStore.getCurrentUser?.();
    if (!user) return;
    if (_originalBio === null) _originalBio = user.bio ?? "";
    user.bio = getCustomBio() ?? _originalBio;
}

export function applyAvatar() {
    if (!UserStore) return;
    const user = UserStore.getCurrentUser?.();
    if (!user) return;
    if (_originalAvatar === null) _originalAvatar = user.avatar ?? "";
    const customAvatar = getCustomAvatar();
    if (customAvatar) {
        user.avatar = customAvatar;
    } else {
        user.avatar = _originalAvatar;
    }
}

export function applyAllCosmetics() {
    applyUsername();
    applyDisplayName();
    applyBio();
    applyAvatar();
}

function revertUsername() {
    if (!UserStore || _originalUsername === null) return;
    const user = UserStore.getCurrentUser?.();
    if (user) user.username = _originalUsername;
    _originalUsername = null;
}

function revertDisplayName() {
    if (!UserStore || _originalDisplayName === null) return;
    const user = UserStore.getCurrentUser?.();
    if (user) user.globalName = _originalDisplayName;
    _originalDisplayName = null;
}

function revertBio() {
    if (!UserStore || _originalBio === null) return;
    const user = UserStore.getCurrentUser?.();
    if (user) user.bio = _originalBio;
    _originalBio = null;
}

function revertAvatar() {
    if (!UserStore || _originalAvatar === null) return;
    const user = UserStore.getCurrentUser?.();
    if (user) user.avatar = _originalAvatar;
    _originalAvatar = null;
}

function revertAllCosmetics() {
    revertUsername();
    revertDisplayName();
    revertBio();
    revertAvatar();
}

// ─── Badges ───────────────────────────────────────────────────────────────────

export interface CustomBadge {
    id: string;
    url: string;
    tooltip: string;
}

const activeBadges = new Map<string, ProfileBadge>();

export function syncBadges() {
    const currentUser = UserStore?.getCurrentUser?.();
    const userId: string | undefined = currentUser?.id;

    // Remove all old badges
    for (const badge of activeBadges.values()) removeProfileBadge(badge);
    activeBadges.clear();

    if (!userId) return;

    const selectedIds: string[] = Settings.plugins["Визуалы"]?.selectedBadges ?? [];
    const customBadges: CustomBadge[] = Settings.plugins["Визуалы"]?.customBadges ?? [];

    // Local Discord badges
    for (const def of DISCORD_BADGES) {
        if (!selectedIds.includes(def.id)) continue;
        const badge: ProfileBadge = {
            id: `visuals_discord_${def.id}`,
            description: def.description,
            iconSrc: def.iconUrl,
            position: BadgePosition.START,
            shouldShow: ({ userId: uid }) => uid === userId,
        };
        addProfileBadge(badge);
        activeBadges.set(badge.id, badge);
    }

    // Local custom image badges
    for (const entry of customBadges) {
        if (!entry.url?.trim()) continue;
        const badge: ProfileBadge = {
            id: `visuals_custom_${entry.id}`,
            description: entry.tooltip || "Кастомный значок",
            iconSrc: entry.url,
            position: BadgePosition.END,
            shouldShow: ({ userId: uid }) => uid === userId,
            props: { style: { borderRadius: "50%" } },
        };
        addProfileBadge(badge);
        activeBadges.set(badge.id, badge);
    }

    // Remote badges from GitHub JSON — visible to ALL Robotcord users
    // These badges are shown to everyone, not just the current user
    console.log("[Визуалы] Syncing remote badges. RemoteBadges:", RemoteBadges);
    for (const [badgeUserId, entries] of Object.entries(RemoteBadges)) {
        console.log(`[Визуалы] Processing badges for user ${badgeUserId}:`, entries);
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            if (!entry.badge?.trim()) continue;
            const badge: ProfileBadge = {
                id: `visuals_remote_${badgeUserId}_${i}`,
                description: entry.tooltip || "Robotcord Badge",
                iconSrc: entry.badge,
                position: BadgePosition.START,
                shouldShow: ({ userId: uid }) => uid === badgeUserId,
                props: { style: { borderRadius: "50%" } },
            };
            console.log(`[Визуалы] Adding badge for user ${badgeUserId}:`, badge);
            addProfileBadge(badge);
            activeBadges.set(badge.id, badge);
        }
    }
}

// ─── Profile cosmetics hook ───────────────────────────────────────────────────

export function cosmeticsHook(profile: any) {
    if (!profile) return profile;

    const currentUser = UserStore?.getCurrentUser?.();
    if (!currentUser || profile.userId !== currentUser.id) return profile;

    const plug = Settings.plugins["Визуалы"];
    const fakeNitro: boolean = plug?.fakeNitro ?? false;
    const primaryColor: number | null = plug?.profilePrimaryColor ?? null;
    const accentColor: number | null = plug?.profileAccentColor ?? null;
    const customDisplayName: string = plug?.customDisplayName ?? "";
    const customBio: string = plug?.customBio ?? "";

    const overrides: Record<string, any> = {};

    if (fakeNitro) {
        overrides.premiumType = 2;
    }

    if (primaryColor !== null && accentColor !== null) {
        overrides.premiumType = overrides.premiumType ?? 2;
        overrides.themeColors = [primaryColor, accentColor];
    }

    if (customDisplayName.trim()) {
        overrides.globalName = customDisplayName.trim();
    }

    if (customBio.trim()) {
        overrides.bio = customBio.trim();
    }

    if (Object.keys(overrides).length === 0) return profile;
    return virtualMerge(profile, overrides);
}

// ─── Plugin ───────────────────────────────────────────────────────────────────

export default definePlugin({
    name: "Визуалы",
    description: "Визуальные настройки: замена юзернейма, значки, косметика профиля",
    authors: [Devs.Ven],
    required: true,

    patches: [
        // Патч UserProfileStore — добавляем фейк-нитро и цвета профиля
        {
            find: "getUserProfile(",
            replacement: {
                match: /(?<=getUserProfile\(\i\){return )(.+?)(?=})/,
                replace: "$self.cosmeticsHook($1)"
            },
        },
        // Патч для применения кастомного аватара
        {
            find: "getAvatarURL:",
            replacement: {
                match: /return\s+(\i)\.avatar\?/,
                replace: "const customAvatar=$self.getCustomAvatarURL();if(customAvatar)return customAvatar;return $1.avatar?"
            }
        },
        // Патч MediaResolver — подменяем URL рамки аватара
        {
            find: "getAvatarDecorationURL:",
            replacement: {
                match: /(?<=function \i\(\i\){)(?=let{avatarDecoration)/,
                replace: "const vcVisualsDecor=$self.getDecorationURL(arguments[0]);if(vcVisualsDecor)return vcVisualsDecor;"
            }
        },
        // Патч хука аватара — патчим место выбора decoration напрямую
        // void 0!==v?v:b — v=override, b=userValue. Добавляем наш хук как fallback
        {
            find: "isAvatarDecorationAnimating:",
            replacement: {
                match: /(let\{user:(\i),guildId:\i,size:\i,avatarDecorationOverride:(\i).+?avatarDecoration:void 0!==\3\?\3:)(\i)/,
                replace: "$1($self.getLocalDecoration($2)??$4)"
            }
        },
        // Попап профиля (мини и полный) — патчим через уникальный класс
        {
            find: "#{intl::USER_PROFILE_MEMBER_SINCE}",
            replacement: {
                match: /(?<=avatarDecoration:)(\i(?:\.\w+)*)(?=,)/,
                replace: "$self.useAvatarDecoration({id:arguments[0]?.user?.id})??$1"
            }
        },
        // Панель аккаунта внизу слева
        {
            find: ".DISPLAY_NAME_STYLES_COACHMARK)",
            replacement: {
                match: /(?<=\i\)\({avatarDecoration:)\i(?=,)(?<=currentUser:(\i).+?)/,
                replace: "$self.useAvatarDecoration($1)??$&"
            }
        },
        ...[
            "#{intl::GUILD_COMMUNICATION_DISABLED_ICON_TOOLTIP_BODY}",
            "#{intl::COLLECTIBLES_NAMEPLATE_PREVIEW_A11Y}",
            "#{intl::COLLECTIBLES_PROFILE_PREVIEW_A11Y}",
            "#{intl::USER_PROFILE_PRONOUNS}",
        ].map(find => ({
            find,
            replacement: {
                match: /(?<=userValue:)((\i(?:\.author)?)\?\.avatarDecoration)/,
                replace: "$self.useAvatarDecoration($2)??$1"
            }
        })),
    ],

    start() {
        waitFor(["getCurrentUser", "getUser"], store => {
            UserStore = store;
            applyAllCosmetics();
            // Load remote badges first, then sync all badges
            loadRemoteBadges().then(() => syncBadges());
            loadVerifiedChannels().then(() => {
                console.log("[Визуалы] Verified channels loaded, updating badges");
                this.updateChannelVerificationBadges();
            });
            loadDecorations();
        });

        // Reload remote badges every 1 minute to catch updates
        const reloadInterval = setInterval(() => {
            loadRemoteBadges(true); // noCache=true to force fresh fetch
            loadVerifiedChannels(true).then(() => {
                this.updateChannelVerificationBadges();
            });
        }, 1 * 60 * 1000);

        // Monitor channel header for verified channels
        const observer = new MutationObserver(() => {
            this.updateChannelVerificationBadges();
        });

        // Start observing after a delay to ensure DOM is ready
        setTimeout(() => {
            const headerContainer = document.querySelector('[class*="headerContainer"]');
            if (headerContainer) {
                console.log("[Визуалы] Starting to observe header container");
                observer.observe(headerContainer, {
                    childList: true,
                    subtree: true,
                    characterData: false
                });
            }
            // Also try to update badges immediately
            this.updateChannelVerificationBadges();
        }, 1000);

        // Listen for URL changes to update badges when switching channels
        const originalPushState = window.history.pushState;
        const originalReplaceState = window.history.replaceState;
        const self = this;

        window.history.pushState = function (...args) {
            originalPushState.apply(window.history, args);
            setTimeout(() => self.updateChannelVerificationBadges(), 100);
            return undefined;
        };

        window.history.replaceState = function (...args) {
            originalReplaceState.apply(window.history, args);
            setTimeout(() => self.updateChannelVerificationBadges(), 100);
            return undefined;
        };

        // Store interval and observer for cleanup
        (this as any)._reloadInterval = reloadInterval;
        (this as any)._observer = observer;
        (this as any)._originalPushState = originalPushState;
        (this as any)._originalReplaceState = originalReplaceState;
    },

    stop() {
        revertAllCosmetics();
        for (const badge of activeBadges.values()) removeProfileBadge(badge);
        activeBadges.clear();

        // Clear reload interval
        if ((this as any)._reloadInterval) {
            clearInterval((this as any)._reloadInterval);
        }

        // Stop observing
        if ((this as any)._observer) {
            (this as any)._observer.disconnect();
        }
    },

    cosmeticsHook,
    applyUsername,
    applyDisplayName,
    applyBio,
    applyAvatar,
    applyAllCosmetics,
    syncBadges,
    loadDecorations,
    loadRemoteBadges,
    getRealUsername: () => _originalUsername,
    DISCORD_BADGES,
    get availableDecorations() { return availableDecorations; },
    get remoteBadges() { return RemoteBadges; },
    getCurrentLocale,

    // Real React hook — mirrors how decor's useUserDecorAvatarDecoration works
    useAvatarDecoration(user: any) {
        const currentUser = UserStore?.getCurrentUser?.();
        const userId: string | undefined = user?.id ?? user?.userId;

        const getAsset = () => {
            if (!currentUser || !userId || userId !== currentUser.id) return null;
            const asset: string = Settings.plugins["Визуалы"]?.avatarDecoration ?? "";
            if (!asset) return null;
            return asset.endsWith("/static") ? asset.replace("/static", "/animated") : asset;
        };

        const [asset, setAsset] = useState<string | null>(getAsset);

        useEffect(() => {
            setAsset(getAsset());
        }, [userId, currentUser?.id]);

        if (!asset) return undefined;
        return { asset, skuId: "visuals_local" };
    },

    // Non-hook version for use in patches that don't support hooks
    getLocalDecoration(user?: any) {
        const currentUser = UserStore?.getCurrentUser?.();
        if (!currentUser) return undefined;
        // Only apply to current user
        if (user && user.id !== currentUser.id) return undefined;
        const asset: string = Settings.plugins["Визуалы"]?.avatarDecoration ?? "";
        if (!asset) return undefined;
        const animated = asset.endsWith("/static") ? asset.replace("/static", "/animated") : asset;
        return { asset: animated, skuId: "visuals_local" };
    },

    // Called by the getAvatarDecorationURL patch
    getDecorationURL({ avatarDecoration }: { avatarDecoration: any; canAnimate?: boolean; }) {
        if (avatarDecoration?.skuId !== "visuals_local") return undefined;
        return avatarDecoration?.asset ?? undefined;
    },

    // Get custom avatar URL for current user
    getCustomAvatarURL() {
        const currentUser = UserStore?.getCurrentUser?.();
        if (!currentUser) return undefined;
        const customAvatar: string = Settings.plugins["Визуалы"]?.customAvatar ?? "";
        if (!customAvatar.trim()) return undefined;
        // Return the custom avatar URL directly
        return customAvatar.trim();
    },

    // Alternative version that returns full avatar object
    getCustomAvatarObject() {
        const customAvatar = this.getCustomAvatarURL();
        if (!customAvatar) return undefined;
        return {
            url: customAvatar,
            size: 1024,
            canAnimate: true
        };
    },

    // Check if channel is verified by Robotcord
    isChannelVerified(channelId: string): boolean {
        return channelId in VerifiedChannels;
    },

    // Render verification badge for channel
    renderChannelVerificationBadge(channel: any) {
        if (!channel || !this.isChannelVerified(channel.id)) return null;
        return null; // Handled by updateChannelVerificationBadges
    },

    // Update channel verification badges in DOM
    updateChannelVerificationBadges() {
        const urlMatch = window.location.pathname.match(/\/channels\/\d+\/(\d+)/);
        const currentChannelId = urlMatch ? urlMatch[1] : null;

        console.log(`[Визуалы] updateChannelVerificationBadges called. URL: ${window.location.pathname}, Channel ID: ${currentChannelId}`);

        if (!currentChannelId) {
            console.log(`[Визуалы] No channel ID found in URL`);
            return;
        }

        if (!this.isChannelVerified(currentChannelId)) {
            console.log(`[Визуалы] Channel ${currentChannelId} is not in verified list`);
            return;
        }

        const info = this.getVerifiedChannelInfo(currentChannelId);
        console.log(`[Визуалы] Channel ${currentChannelId} is verified:`, info);

        // Look for channel header with channel name
        const headerElements = document.querySelectorAll('[class*="headerContent"]');
        console.log(`[Визуалы] Found ${headerElements.length} header elements`);

        let updated = 0;

        headerElements.forEach(header => {
            // Skip if already has verification badge
            if (header.querySelector('[data-robotcord-verified]')) {
                console.log(`[Визуалы] Header already has badge, skipping`);
                return;
            }

            // Find the channel name element within header
            const nameElement = header.querySelector('h1, h2, [class*="name"]');
            if (!nameElement) {
                console.log(`[Визуалы] No name element found in header`);
                return;
            }

            console.log(`[Визуалы] Found name element, adding badge`);

            // Create verification badge
            const badge = document.createElement('div');
            badge.setAttribute('data-robotcord-verified', 'true');
            badge.style.display = 'inline-flex';
            badge.style.alignItems = 'center';
            badge.style.marginLeft = '8px';
            badge.style.cursor = 'pointer';
            badge.style.position = 'relative';

            if (info?.badge) {
                // Use image from badge URL
                const img = document.createElement('img');
                img.src = info.badge;
                img.style.width = '32px';
                img.style.height = '32px';
                img.style.borderRadius = '50%';
                img.style.cursor = 'pointer';
                badge.appendChild(img);
            } else {
                // Fallback to SVG if no badge URL
                badge.innerHTML = `
                    <svg width="32" height="32" viewBox="0 0 16 16" style="fill: var(--green-360); cursor: pointer;">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 11-1.06-1.06l7.25-7.25a.75.75 0 011.06 0Z"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M4.22 9.78a.75.75 0 010-1.06l4-4a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0Z"/>
                    </svg>
                `;
            }

            // Add Discord-style tooltip on hover
            badge.addEventListener('mouseenter', () => {
                const tooltip = document.createElement('div');
                tooltip.setAttribute('data-robotcord-tooltip', 'true');
                tooltip.style.position = 'fixed';
                tooltip.style.padding = '12px 16px';
                tooltip.style.backgroundColor = '#2c2f33';
                tooltip.style.color = '#ffffff';
                tooltip.style.borderRadius = '8px';
                tooltip.style.fontSize = '14px';
                tooltip.style.fontWeight = '600';
                tooltip.style.zIndex = '999999';
                tooltip.style.pointerEvents = 'auto';
                tooltip.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.24)';
                tooltip.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                tooltip.style.minWidth = 'auto';
                tooltip.style.whiteSpace = 'nowrap';

                // Position tooltip below the badge
                const badgeRect = badge.getBoundingClientRect();
                tooltip.style.left = (badgeRect.left + badgeRect.width / 2) + 'px';
                tooltip.style.top = (badgeRect.bottom + 12) + 'px';
                tooltip.style.transform = 'translateX(-50%)';

                // Title only
                const title = document.createElement('div');
                title.textContent = info?.tooltip || 'Verified by Robotcord';
                title.style.fontWeight = '600';
                title.style.fontSize = '14px';
                title.style.color = '#ffffff';
                tooltip.appendChild(title);

                document.body.appendChild(tooltip);

                // Add arrow/pointer
                const arrow = document.createElement('div');
                arrow.style.position = 'absolute';
                arrow.style.top = '-8px';
                arrow.style.left = '50%';
                arrow.style.transform = 'translateX(-50%)';
                arrow.style.width = '0';
                arrow.style.height = '0';
                arrow.style.borderLeft = '8px solid transparent';
                arrow.style.borderRight = '8px solid transparent';
                arrow.style.borderBottom = '8px solid #2c2f33';
                tooltip.appendChild(arrow);

                document.body.appendChild(tooltip);
            });

            badge.addEventListener('mouseleave', () => {
                const tooltip = document.querySelector('[data-robotcord-tooltip]');
                if (tooltip) tooltip.remove();
            });

            // Insert badge after the name element
            nameElement.parentElement?.insertBefore(badge, nameElement.nextSibling);
            updated++;
        });

        if (updated > 0) {
            console.log(`[Визуалы] Updated ${updated} channel verification badges`);
        }
    },

    // Extract channel ID from DOM element
    extractChannelIdFromElement(element: Element): string | null {
        // Try to find channel ID in data attributes or parent elements
        let current = element;
        let depth = 0;

        while (current && current !== document.body && depth < 10) {
            // Check for channel ID in href
            const href = current.getAttribute('href');
            if (href) {
                const match = href.match(/\/channels\/\d+\/(\d+)/);
                if (match) return match[1];
            }

            // Check for data attributes
            const dataChannelId = current.getAttribute('data-channel-id');
            if (dataChannelId) return dataChannelId;

            // Check for aria-label with channel ID pattern
            const ariaLabel = current.getAttribute('aria-label');
            if (ariaLabel) {
                // Try to extract ID from aria-label if it contains numbers
                const match = ariaLabel.match(/(\d{15,})/);
                if (match) return match[1];
            }

            current = current.parentElement as Element;
            depth++;
        }
        return null;
    },

    // Get verified channel info
    getVerifiedChannelInfo(channelId: string) {
        return VerifiedChannels[channelId];
    },

    // Get all verified channels
    get verifiedChannels() {
        return VerifiedChannels;
    },
});