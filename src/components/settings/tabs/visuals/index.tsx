/*
 * Robotcord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
*/

import { useSettings } from "@api/Settings";
import { Divider } from "@components/Divider";
import { SettingsTab, wrapTab } from "@components/settings/tabs/BaseTab";
import VisualsPlugin, { CustomBadge, DecorationOption, FakeRole } from "@plugins/_core/visuals";
import { Margins } from "@utils/margins";
import { Button, ColorPicker, Forms, React, TextInput, useEffect, useState, i18n } from "@webpack/common";

// ─── Localization ─────────────────────────────────────────────────────────────

const localizationStrings = {
    en: {
        usernameReplacement: "Username Replacement",
        onlyYouCanSee: "Only you can see this — no one else can.",
        realUsername: "Real Username",
        localDisplay: "Local Display",
        enterCustomUsername: "Enter custom username...",
        willDisplayAs: "Will display as",
        leaveEmptyForReal: "Leave empty to use your real username.",
        displayNameReplacement: "Display Name Replacement",
        enterCustomDisplayName: "Enter custom display name...",
        bioReplacement: "Bio Replacement",
        enterCustomBio: "Enter custom bio...",
        avatarReplacement: "Avatar Replacement",
        avatarUrl: "Avatar URL",
        preview: "Preview",
        willUseCustomAvatar: "Will use custom avatar",
        leaveEmptyForRealAvatar: "Leave empty to use your real avatar.",
        profileCosmetics: "Profile Cosmetics",
        localChangesOnlyYou: "Local changes — only you can see them.",
        fakeNitro: "Fake Nitro",
        showsNitroOnProfile: "Shows Nitro on your profile locally",
        profileColors: "Profile Colors",
        profileThemeNitro: "Profile theme like Nitro",
        primary: "Primary",
        secondary: "Secondary",
        avatarFrame: "Avatar Frame",
        loadingFrames: "Loading frames from Discord store...",
        none: "None",
        customFrameUrl: "Custom frame by URL",
        apply: "Apply",
        reset: "Reset",
        discordBadges: "Discord Badges",
        locallyAddsOfficialBadges: "Locally adds official Discord badges. Only you can see them.",
        customBadges: "Custom Badges",
        addYourOwnBadges: "Add your own badges by image URL.",
        addBadge: "Add Badge",
        imageUrl: "Image URL (https://...)",
        tooltipOnHover: "Tooltip on hover (optional)",
        delete: "Delete",
        fakeRoles: "Fake Roles",
        fakeRolesDesc: "Create and display fake roles on all servers. Only you can see them.",
        roleName: "Role Name",
        roleColor: "Role Color",
        enterRoleName: "Enter role name...",
        addRole: "Add Role",
        createdRoles: "Created Roles",
        noRoles: "No roles created yet"
    },
    ru: {
        usernameReplacement: "Замена юзернейма",
        onlyYouCanSee: "Отображается только тебе — никто другой не видит.",
        realUsername: "Настоящий юзернейм",
        localDisplay: "Локальное отображение",
        enterCustomUsername: "Введи кастомный юзернейм...",
        willDisplayAs: "Будет отображаться как",
        leaveEmptyForReal: "Оставь пустым, чтобы использовать настоящий юзернейм.",
        displayNameReplacement: "Замена ника (Display Name)",
        enterCustomDisplayName: "Введи кастомный ник...",
        bioReplacement: "Замена био",
        enterCustomBio: "Введи кастомное био...",
        avatarReplacement: "Замена аватара",
        avatarUrl: "URL аватара",
        preview: "Предпросмотр",
        willUseCustomAvatar: "Будет использоваться кастомный аватар",
        leaveEmptyForRealAvatar: "Оставь пустым, чтобы использовать настоящий аватар.",
        profileCosmetics: "Косметика профиля",
        localChangesOnlyYou: "Локальные изменения — видны только тебе.",
        fakeNitro: "Fake Nitro",
        showsNitroOnProfile: "Показывает Nitro на твоём профиле локально",
        profileColors: "Цвета профиля",
        profileThemeNitro: "Тема профиля как у Nitro",
        primary: "Основной",
        secondary: "Дополнительный",
        avatarFrame: "Рамка аватара",
        loadingFrames: "Загрузка рамок из магазина Discord...",
        none: "Нет",
        customFrameUrl: "Своя рамка по URL",
        apply: "Применить",
        reset: "Сбросить",
        discordBadges: "Discord-значки",
        locallyAddsOfficialBadges: "Локально добавляет официальные Discord-значки. Видно только тебе.",
        customBadges: "Кастомные значки",
        addYourOwnBadges: "Добавь свои значки по URL картинки.",
        addBadge: "Добавить значок",
        imageUrl: "URL картинки (https://...)",
        tooltipOnHover: "Подпись при наведении (необязательно)",
        delete: "Удалить",
        fakeRoles: "Fake Roles (Фейк-роли)",
        fakeRolesDesc: "Создай и отображай фейк-роли на всех серверах. Видно только тебе.",
        roleName: "Имя роли",
        roleColor: "Цвет роли",
        enterRoleName: "Введи имя роли...",
        addRole: "Добавить роль",
        createdRoles: "Созданные роли",
        noRoles: "Роли ещё не созданы"
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

// Get localized string
function t(key: keyof typeof localizationStrings.en): string {
    const locale = getCurrentLocale();
    return localizationStrings[locale]?.[key] || localizationStrings.en[key] || key;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void; }) {
    return (
        <div
            onClick={onToggle}
            style={{
                width: 36, height: 20, borderRadius: 10, flexShrink: 0, cursor: "pointer",
                background: enabled ? "var(--brand-500)" : "var(--background-tertiary)",
                position: "relative", transition: "background 0.2s",
            }}
        >
            <div style={{
                position: "absolute", top: 2, left: enabled ? 18 : 2,
                width: 16, height: 16, borderRadius: "50%",
                background: "white", transition: "left 0.2s",
            }} />
        </div>
    );
}

function Row({ icon, title, subtitle, right }: { icon?: string; title: string; subtitle?: string; right: React.ReactNode; }) {
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", marginBottom: 6,
            background: "var(--background-secondary)", borderRadius: 8,
        }}>
            {icon && <img src={icon} alt="" style={{ width: 22, height: 22, flexShrink: 0 }} />}
            <div style={{ flex: 1 }}>
                <div style={{ color: "var(--text-normal)", fontSize: 14, fontWeight: 500 }}>{title}</div>
                {subtitle && <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{subtitle}</div>}
            </div>
            {right}
        </div>
    );
}

// ─── Badge toggle ─────────────────────────────────────────────────────────

function BadgeToggle({ badge, enabled, onToggle }: {
    badge: typeof VisualsPlugin.DISCORD_BADGES[number];
    enabled: boolean;
    onToggle: () => void;
}) {
    return (
        <Row
            icon={badge.iconUrl}
            title={badge.label}
            subtitle={badge.description}
            right={<Toggle enabled={enabled} onToggle={onToggle} />}
        />
    );
}

// ─── Custom badge row ─────────────────────────────────────────────────────────

function CustomBadgeRow({ badge, onRemove }: { badge: CustomBadge; onRemove: () => void; }) {
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
            padding: "8px 12px", background: "var(--background-secondary)", borderRadius: 8,
        }}>
            <img src={badge.url} alt="" style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0 }} onError={e => (e.currentTarget.style.opacity = "0.3")} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "var(--text-normal)", fontSize: 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{badge.tooltip || t("addBadge")}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{badge.url}</div>
            </div>
            <Button size={Button.Sizes.SMALL} color={Button.Colors.RED} onClick={onRemove}>{t("delete")}</Button>
        </div>
    );
}

// ─── Fake role row ────────────────────────────────────────────────────────────

interface FakeRole {
    id: string;
    name: string;
    color: string;
}

function FakeRoleRow({ role, onRemove }: { role: FakeRole; onRemove: () => void; }) {
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
            padding: "8px 12px", background: "var(--background-secondary)", borderRadius: 8,
        }}>
            <span style={{
                width: 16, height: 16, borderRadius: "50%",
                background: role.color, flexShrink: 0
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "var(--text-normal)", fontSize: 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{role.name}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-code)" }}>{role.color}</div>
            </div>
            <Button size={Button.Sizes.SMALL} color={Button.Colors.RED} onClick={onRemove}>{t("delete")}</Button>
        </div>
    );
}

// ─── Decoration picker ────────────────────────────────────────────────────────

function DecorationPicker({ current, onChange }: { current: string; onChange: (asset: string) => void; }) {
    const [decorations, setDecorations] = useState<DecorationOption[]>(VisualsPlugin.availableDecorations);
    const [loading, setLoading] = useState(decorations.length === 0);
    const [customUrl, setCustomUrl] = useState("");

    useEffect(() => {
        if (decorations.length > 0) return;
        setLoading(true);
        VisualsPlugin.loadDecorations().then(d => {
            setDecorations(d);
            setLoading(false);
        });
    }, []);

    return (
        <div>
            {loading && (
                <Forms.FormText style={{ color: "var(--text-muted)", marginBottom: 8 }}>
                    {t("loadingFrames")}
                </Forms.FormText>
            )}

            {/* Grid of decorations */}
            {decorations.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                    {/* None option */}
                    <div
                        onClick={() => onChange("")}
                        style={{
                            width: 64, height: 64, borderRadius: 8, cursor: "pointer",
                            border: `2px solid ${!current ? "var(--brand-500)" : "var(--background-tertiary)"}`,
                            background: "var(--background-secondary)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "var(--text-muted)", fontSize: 11, textAlign: "center",
                        }}
                    >
                        {t("none")}
                    </div>
                    {decorations.map(dec => (
                        <div
                            key={dec.id}
                            onClick={() => onChange(dec.asset)}
                            title={dec.label}
                            style={{
                                width: 64, height: 64, borderRadius: 8, cursor: "pointer",
                                border: `2px solid ${current === dec.asset ? "var(--brand-500)" : "var(--background-tertiary)"}`,
                                background: "var(--background-secondary)",
                                overflow: "hidden", position: "relative",
                            }}
                        >
                            <img
                                src={dec.previewUrl}
                                alt={dec.label}
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                onError={e => (e.currentTarget.style.opacity = "0.2")}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Custom URL fallback */}
            <Forms.FormTitle tag="h5" style={{ marginBottom: 4 }}>{t("customFrameUrl")}</Forms.FormTitle>
            <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                    <TextInput
                        placeholder="https://cdn.discordapp.com/avatar-decoration-presets/..."
                        value={customUrl}
                        onChange={setCustomUrl}
                    />
                </div>
                <Button size={Button.Sizes.SMALL} color={Button.Colors.BRAND} onClick={() => { onChange(customUrl.trim()); setCustomUrl(""); }} disabled={!customUrl.trim()}>
                    {t("apply")}
                </Button>
                {current && (
                    <Button size={Button.Sizes.SMALL} color={Button.Colors.RED} onClick={() => onChange("")}>
                        {t("reset")}
                    </Button>
                )}
            </div>
        </div>
    );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

function VisualsSettings() {
    const settings = useSettings(["plugins.Визуалы.*"]);
    const plug = settings.plugins["Визуалы"];

    const realUsername: string = VisualsPlugin.getRealUsername() ?? "";
    const customUsername: string = plug.customUsername ?? "";
    const customDisplayName: string = plug.customDisplayName ?? "";
    const customBio: string = plug.customBio ?? "";
    const customAvatar: string = plug.customAvatar ?? "";
    const selectedBadges: string[] = plug.selectedBadges ?? [];
    const customBadges: CustomBadge[] = plug.customBadges ?? [];
    const fakeNitro: boolean = plug.fakeNitro ?? false;
    const avatarDecoration: string = plug.avatarDecoration ?? "";
    const primaryColor: number = plug.profilePrimaryColor ?? 0x000000;
    const accentColor: number = plug.profileAccentColor ?? 0x000000;
    const colorsEnabled: boolean = plug.profileColorsEnabled ?? false;
    const fakeRoles: FakeRole[] = plug.fakeRoles ?? [];

    const [newBadgeUrl, setNewBadgeUrl] = useState("");
    const [newBadgeTooltip, setNewBadgeTooltip] = useState("");
    const [newRoleName, setNewRoleName] = useState("");
    const [newRoleColor, setNewRoleColor] = useState("#6C5B7B");

    useEffect(() => {
        VisualsPlugin.injectFakeRoles(fakeRoles);
    }, [fakeRoles]);

    function handleUsernameChange(value: string) {
        plug.customUsername = value;
        VisualsPlugin.applyUsername();
    }

    function handleDisplayNameChange(value: string) {
        plug.customDisplayName = value;
        VisualsPlugin.applyDisplayName();
    }

    function handleBioChange(value: string) {
        plug.customBio = value;
        VisualsPlugin.applyBio();
    }

    function handleAvatarChange(value: string) {
        plug.customAvatar = value;
        VisualsPlugin.applyAvatar();
    }

    function handleBadgeToggle(id: string) {
        plug.selectedBadges = selectedBadges.includes(id)
            ? selectedBadges.filter(b => b !== id)
            : [...selectedBadges, id];
        VisualsPlugin.syncBadges();
    }

    function addCustomBadge() {
        const url = newBadgeUrl.trim();
        if (!url) return;
        plug.customBadges = [...customBadges, { id: Date.now().toString(), url, tooltip: newBadgeTooltip.trim() || "Кастомный значок" }];
        setNewBadgeUrl("");
        setNewBadgeTooltip("");
        VisualsPlugin.syncBadges();
    }

    function addFakeRole() {
        const name = newRoleName.trim();
        if (!name) return;
        const newRole: FakeRole = {
            id: Date.now().toString(),
            name,
            color: newRoleColor
        };
        plug.fakeRoles = [...fakeRoles, newRole];
        setNewRoleName("");
        setNewRoleColor("#6C5B7B");
    }

    return (
        <SettingsTab>

            {/* ── Юзернейм ── */}
            <section>
                <Forms.FormTitle tag="h5">{t("usernameReplacement")}</Forms.FormTitle>
                <Forms.FormText className={Margins.bottom16} style={{ color: "var(--text-muted)" }}>
                    {t("onlyYouCanSee")}
                </Forms.FormText>
                {realUsername && <>
                    <Forms.FormTitle tag="h5" style={{ marginBottom: 4 }}>{t("realUsername")}</Forms.FormTitle>
                    <Forms.FormText className={Margins.bottom16} style={{ color: "var(--text-muted)", fontFamily: "var(--font-code)" }}>@{realUsername}</Forms.FormText>
                </>}
                <Forms.FormTitle tag="h5" style={{ marginBottom: 4 }}>{t("localDisplay")}</Forms.FormTitle>
                <div className={Margins.bottom8}>
                    <TextInput placeholder={realUsername || t("enterCustomUsername")} value={customUsername} onChange={handleUsernameChange} />
                </div>
                <Forms.FormText className={Margins.bottom8} style={{ color: "var(--text-muted)" }}>
                    {customUsername ? <>{t("willDisplayAs")} <strong>@{customUsername}</strong></> : t("leaveEmptyForReal")}
                </Forms.FormText>
            </section>

            <Divider className={Margins.top16} />

            {/* ── Ник (Display Name) ── */}
            <section className={Margins.top16}>
                <Forms.FormTitle tag="h5">{t("displayNameReplacement")}</Forms.FormTitle>
                <Forms.FormText className={Margins.bottom16} style={{ color: "var(--text-muted)" }}>
                    {t("onlyYouCanSee")}
                </Forms.FormText>
                <Forms.FormTitle tag="h5" style={{ marginBottom: 4 }}>{t("localDisplay")}</Forms.FormTitle>
                <div className={Margins.bottom8}>
                    <TextInput placeholder={t("enterCustomDisplayName")} value={customDisplayName} onChange={handleDisplayNameChange} />
                </div>
                <Forms.FormText className={Margins.bottom8} style={{ color: "var(--text-muted)" }}>
                    {customDisplayName ? <>{t("willDisplayAs")} <strong>{customDisplayName}</strong></> : t("leaveEmptyForReal")}
                </Forms.FormText>
            </section>

            <Divider className={Margins.top16} />

            {/* ── Био ── */}
            <section className={Margins.top16}>
                <Forms.FormTitle tag="h5">{t("bioReplacement")}</Forms.FormTitle>
                <Forms.FormText className={Margins.bottom16} style={{ color: "var(--text-muted)" }}>
                    {t("onlyYouCanSee")}
                </Forms.FormText>
                <Forms.FormTitle tag="h5" style={{ marginBottom: 4 }}>{t("localDisplay")}</Forms.FormTitle>
                <div className={Margins.bottom8}>
                    <TextInput placeholder={t("enterCustomBio")} value={customBio} onChange={handleBioChange} />
                </div>
                <Forms.FormText className={Margins.bottom8} style={{ color: "var(--text-muted)" }}>
                    {customBio ? <>Будет отображаться как <strong>{customBio}</strong></> : t("leaveEmptyForReal")}
                </Forms.FormText>
            </section>

            <Divider className={Margins.top16} />

            {/* ── Аватар ── */}
            <section className={Margins.top16}>
                <Forms.FormTitle tag="h5">{t("avatarReplacement")}</Forms.FormTitle>
                <Forms.FormText className={Margins.bottom16} style={{ color: "var(--text-muted)" }}>
                    {t("onlyYouCanSee")}
                </Forms.FormText>
                <Forms.FormTitle tag="h5" style={{ marginBottom: 4 }}>{t("avatarUrl")}</Forms.FormTitle>
                <div className={Margins.bottom8}>
                    <TextInput placeholder="https://..." value={customAvatar} onChange={handleAvatarChange} />
                </div>
                {customAvatar && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <img src={customAvatar} alt="preview" style={{ width: 48, height: 48, borderRadius: "50%" }} onError={e => (e.currentTarget.style.opacity = "0.3")} />
                        <Forms.FormText style={{ color: "var(--text-muted)", fontSize: 12 }}>{t("preview")}</Forms.FormText>
                    </div>
                )}
                <Forms.FormText className={Margins.bottom8} style={{ color: "var(--text-muted)" }}>
                    {customAvatar ? t("willUseCustomAvatar") : t("leaveEmptyForRealAvatar")}
                </Forms.FormText>
            </section>

            <Divider className={Margins.top16} />

            {/* ── Косметика ── */}
            <section className={Margins.top16}>
                <Forms.FormTitle tag="h5">{t("profileCosmetics")}</Forms.FormTitle>
                <Forms.FormText className={Margins.bottom16} style={{ color: "var(--text-muted)" }}>
                    {t("localChangesOnlyYou")}
                </Forms.FormText>

                {/* Fake Nitro */}
                <Row
                    icon="https://cdn.discordapp.com/badge-icons/2ba85e8026a8614b640c2837bcdfe21b.png"
                    title={t("fakeNitro")}
                    subtitle={t("showsNitroOnProfile")}
                    right={<Toggle enabled={fakeNitro} onToggle={() => { plug.fakeNitro = !fakeNitro; }} />}
                />

                {/* Profile colors */}
                <div style={{ padding: "10px 12px", marginBottom: 6, background: "var(--background-secondary)", borderRadius: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: colorsEnabled ? 12 : 0 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: "var(--text-normal)", fontSize: 14, fontWeight: 500 }}>{t("profileColors")}</div>
                            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{t("profileThemeNitro")}</div>
                        </div>
                        <Toggle enabled={colorsEnabled} onToggle={() => { plug.profileColorsEnabled = !colorsEnabled; }} />
                    </div>
                    {colorsEnabled && (
                        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                            <div>
                                <Forms.FormText style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 6 }}>{t("primary")}</Forms.FormText>
                                <ColorPicker
                                    color={primaryColor}
                                    onChange={(c: number) => { plug.profilePrimaryColor = c; }}
                                />
                            </div>
                            <div>
                                <Forms.FormText style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 6 }}>{t("secondary")}</Forms.FormText>
                                <ColorPicker
                                    color={accentColor}
                                    onChange={(c: number) => { plug.profileAccentColor = c; }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Avatar decoration */}
                <div style={{ padding: "10px 12px", marginBottom: 6, background: "var(--background-secondary)", borderRadius: 8 }}>
                    <div style={{ color: "var(--text-normal)", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{t("avatarFrame")}</div>
                    <DecorationPicker current={avatarDecoration} onChange={v => { plug.avatarDecoration = v; }} />
                </div>
            </section>

            <Divider className={Margins.top16} />

            {/* ── Discord-бейджи ── */}
            <section className={Margins.top16}>
                <Forms.FormTitle tag="h5">{t("discordBadges")}</Forms.FormTitle>
                <Forms.FormText className={Margins.bottom16} style={{ color: "var(--text-muted)" }}>
                    {t("locallyAddsOfficialBadges")}
                </Forms.FormText>
                {VisualsPlugin.DISCORD_BADGES.map(badge => (
                    <BadgeToggle key={badge.id} badge={badge} enabled={selectedBadges.includes(badge.id)} onToggle={() => handleBadgeToggle(badge.id)} />
                ))}
            </section>

            <Divider className={Margins.top16} />

            {/* ── Кастомные значки ── */}
            <section className={Margins.top16}>
                <Forms.FormTitle tag="h5">{t("customBadges")}</Forms.FormTitle>
                <Forms.FormText className={Margins.bottom16} style={{ color: "var(--text-muted)" }}>
                    {t("addYourOwnBadges")}
                </Forms.FormText>
                {customBadges.map(badge => (
                    <CustomBadgeRow key={badge.id} badge={badge} onRemove={() => { plug.customBadges = customBadges.filter(b => b.id !== badge.id); VisualsPlugin.syncBadges(); }} />
                ))}
                <div style={{ padding: 12, background: "var(--background-secondary)", borderRadius: 8, display: "flex", flexDirection: "column", gap: 8, marginTop: customBadges.length > 0 ? 8 : 0 }}>
                    <Forms.FormTitle tag="h5" style={{ marginBottom: 0 }}>{t("addBadge")}</Forms.FormTitle>
                    <TextInput placeholder={t("imageUrl")} value={newBadgeUrl} onChange={setNewBadgeUrl} />
                    <TextInput placeholder={t("tooltipOnHover")} value={newBadgeTooltip} onChange={setNewBadgeTooltip} />
                    {newBadgeUrl.trim() && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <img src={newBadgeUrl.trim()} alt="preview" style={{ width: 28, height: 28, borderRadius: "50%" }} onError={e => (e.currentTarget.style.opacity = "0.3")} />
                            <Forms.FormText style={{ color: "var(--text-muted)", fontSize: 12 }}>{t("preview")}</Forms.FormText>
                        </div>
                    )}
                    <Button size={Button.Sizes.SMALL} color={Button.Colors.BRAND} onClick={addCustomBadge} disabled={!newBadgeUrl.trim()}>{t("addBadge")}</Button>
                </div>
            </section>

            <Divider className={Margins.top16} />

            {/* ── Фейк-роли ── */}
            <section className={Margins.top16}>
                <Forms.FormTitle tag="h5">{t("fakeRoles")}</Forms.FormTitle>
                <Forms.FormText className={Margins.bottom16} style={{ color: "var(--text-muted)" }}>
                    {t("fakeRolesDesc")}
                </Forms.FormText>

                {/* Список созданных ролей */}
                {fakeRoles.length > 0 && (
                    <>
                        <Forms.FormTitle tag="h5" style={{ marginBottom: 8, marginTop: 12 }}>{t("createdRoles")}</Forms.FormTitle>
                        {fakeRoles.map(role => (
                            <FakeRoleRow key={role.id} role={role} onRemove={() => { plug.fakeRoles = fakeRoles.filter(r => r.id !== role.id); }} />
                        ))}
                        <Divider className={Margins.top12} />
                    </>
                )}

                {/* Форма для добавления новой роли */}
                <div style={{ padding: 12, background: "var(--background-secondary)", borderRadius: 8, display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                    <Forms.FormTitle tag="h5" style={{ marginBottom: 0 }}>{t("addRole")}</Forms.FormTitle>

                    {/* Имя роли */}
                    <div>
                        <Forms.FormText style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 4 }}>{t("roleName")}</Forms.FormText>
                        <TextInput placeholder={t("enterRoleName")} value={newRoleName} onChange={setNewRoleName} />
                    </div>

                    {/* Цвет роли */}
                    <div>
                        <Forms.FormText style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 4 }}>{t("roleColor")}</Forms.FormText>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1 }}>
                                <TextInput placeholder="#6C5B7B" value={newRoleColor} onChange={setNewRoleColor} />
                            </div>
                            <div style={{
                                width: 40, height: 40, borderRadius: 6, border: "2px solid var(--background-tertiary)",
                                background: newRoleColor, cursor: "pointer", flexShrink: 0
                            }} onClick={() => { }} title={newRoleColor} />
                        </div>
                    </div>

                    {/* Preview */}
                    {newRoleName && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, background: "var(--background-tertiary)", borderRadius: 4 }}>
                            <span style={{
                                width: 16, height: 16, borderRadius: "50%",
                                background: newRoleColor
                            }} />
                            <div style={{ color: "var(--text-normal)", fontSize: 14 }}>{newRoleName}</div>
                        </div>
                    )}

                    <Button size={Button.Sizes.SMALL} color={Button.Colors.BRAND} onClick={addFakeRole} disabled={!newRoleName.trim()}>{t("addRole")}</Button>
                </div>
            </section>

            <Divider className={Margins.top16} />

        </SettingsTab>
    );
}

export default wrapTab(VisualsSettings, "Визуалы");
