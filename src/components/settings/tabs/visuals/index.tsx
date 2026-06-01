/*
 * Robotcord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
*/

import { useSettings } from "@api/Settings";
import { Divider } from "@components/Divider";
import { SettingsTab, wrapTab } from "@components/settings/tabs/BaseTab";
import VisualsPlugin, { CustomBadge, DecorationOption } from "@plugins/_core/visuals";
import { Margins } from "@utils/margins";
import { Button, ColorPicker, Forms, React, TextInput, useEffect, useState } from "@webpack/common";

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

// ─── Badge toggle ─────────────────────────────────────────────────────────────

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
                <div style={{ color: "var(--text-normal)", fontSize: 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{badge.tooltip || "Без названия"}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{badge.url}</div>
            </div>
            <Button size={Button.Sizes.SMALL} color={Button.Colors.RED} onClick={onRemove}>Удалить</Button>
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
                    Загрузка рамок из магазина Discord...
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
                        Нет
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
            <Forms.FormTitle tag="h5" style={{ marginBottom: 4 }}>Своя рамка по URL</Forms.FormTitle>
            <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                    <TextInput
                        placeholder="https://cdn.discordapp.com/avatar-decoration-presets/..."
                        value={customUrl}
                        onChange={setCustomUrl}
                    />
                </div>
                <Button size={Button.Sizes.SMALL} color={Button.Colors.BRAND} onClick={() => { onChange(customUrl.trim()); setCustomUrl(""); }} disabled={!customUrl.trim()}>
                    Применить
                </Button>
                {current && (
                    <Button size={Button.Sizes.SMALL} color={Button.Colors.RED} onClick={() => onChange("")}>
                        Сбросить
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

    const [newBadgeUrl, setNewBadgeUrl] = useState("");
    const [newBadgeTooltip, setNewBadgeTooltip] = useState("");

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

    return (
        <SettingsTab>

            {/* ── Юзернейм ── */}
            <section>
                <Forms.FormTitle tag="h5">Замена юзернейма</Forms.FormTitle>
                <Forms.FormText className={Margins.bottom16} style={{ color: "var(--text-muted)" }}>
                    Отображается только тебе — никто другой не видит.
                </Forms.FormText>
                {realUsername && <>
                    <Forms.FormTitle tag="h5" style={{ marginBottom: 4 }}>Настоящий юзернейм</Forms.FormTitle>
                    <Forms.FormText className={Margins.bottom16} style={{ color: "var(--text-muted)", fontFamily: "var(--font-code)" }}>@{realUsername}</Forms.FormText>
                </>}
                <Forms.FormTitle tag="h5" style={{ marginBottom: 4 }}>Локальное отображение</Forms.FormTitle>
                <div className={Margins.bottom8}>
                    <TextInput placeholder={realUsername || "Введи кастомный юзернейм..."} value={customUsername} onChange={handleUsernameChange} />
                </div>
                <Forms.FormText className={Margins.bottom8} style={{ color: "var(--text-muted)" }}>
                    {customUsername ? <>Будет отображаться как <strong>@{customUsername}</strong></> : "Оставь пустым, чтобы использовать настоящий юзернейм."}
                </Forms.FormText>
            </section>

            <Divider className={Margins.top16} />

            {/* ── Ник (Display Name) ── */}
            <section className={Margins.top16}>
                <Forms.FormTitle tag="h5">Замена ника (Display Name)</Forms.FormTitle>
                <Forms.FormText className={Margins.bottom16} style={{ color: "var(--text-muted)" }}>
                    Отображается только тебе — никто другой не видит.
                </Forms.FormText>
                <Forms.FormTitle tag="h5" style={{ marginBottom: 4 }}>Локальное отображение</Forms.FormTitle>
                <div className={Margins.bottom8}>
                    <TextInput placeholder="Введи кастомный ник..." value={customDisplayName} onChange={handleDisplayNameChange} />
                </div>
                <Forms.FormText className={Margins.bottom8} style={{ color: "var(--text-muted)" }}>
                    {customDisplayName ? <>Будет отображаться как <strong>{customDisplayName}</strong></> : "Оставь пустым, чтобы использовать настоящий ник."}
                </Forms.FormText>
            </section>

            <Divider className={Margins.top16} />

            {/* ── Био ── */}
            <section className={Margins.top16}>
                <Forms.FormTitle tag="h5">Замена био</Forms.FormTitle>
                <Forms.FormText className={Margins.bottom16} style={{ color: "var(--text-muted)" }}>
                    Отображается только тебе — никто другой не видит.
                </Forms.FormText>
                <Forms.FormTitle tag="h5" style={{ marginBottom: 4 }}>Локальное отображение</Forms.FormTitle>
                <div className={Margins.bottom8}>
                    <TextInput placeholder="Введи кастомное био..." value={customBio} onChange={handleBioChange} />
                </div>
                <Forms.FormText className={Margins.bottom8} style={{ color: "var(--text-muted)" }}>
                    {customBio ? <>Будет отображаться как <strong>{customBio}</strong></> : "Оставь пустым, чтобы использовать настоящее био."}
                </Forms.FormText>
            </section>

            <Divider className={Margins.top16} />

            {/* ── Аватар ── */}
            <section className={Margins.top16}>
                <Forms.FormTitle tag="h5">Замена аватара</Forms.FormTitle>
                <Forms.FormText className={Margins.bottom16} style={{ color: "var(--text-muted)" }}>
                    Отображается только тебе — никто другой не видит.
                </Forms.FormText>
                <Forms.FormTitle tag="h5" style={{ marginBottom: 4 }}>URL аватара</Forms.FormTitle>
                <div className={Margins.bottom8}>
                    <TextInput placeholder="https://..." value={customAvatar} onChange={handleAvatarChange} />
                </div>
                {customAvatar && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <img src={customAvatar} alt="preview" style={{ width: 48, height: 48, borderRadius: "50%" }} onError={e => (e.currentTarget.style.opacity = "0.3")} />
                        <Forms.FormText style={{ color: "var(--text-muted)", fontSize: 12 }}>Предпросмотр</Forms.FormText>
                    </div>
                )}
                <Forms.FormText className={Margins.bottom8} style={{ color: "var(--text-muted)" }}>
                    {customAvatar ? <>Будет использоваться кастомный аватар</> : "Оставь пустым, чтобы использовать настоящий аватар."}
                </Forms.FormText>
            </section>

            <Divider className={Margins.top16} />

            {/* ── Косметика ── */}
            <section className={Margins.top16}>
                <Forms.FormTitle tag="h5">Косметика профиля</Forms.FormTitle>
                <Forms.FormText className={Margins.bottom16} style={{ color: "var(--text-muted)" }}>
                    Локальные изменения — видны только тебе.
                </Forms.FormText>

                {/* Fake Nitro */}
                <Row
                    icon="https://cdn.discordapp.com/badge-icons/2ba85e8026a8614b640c2837bcdfe21b.png"
                    title="Fake Nitro"
                    subtitle="Показывает Nitro на твоём профиле локально"
                    right={<Toggle enabled={fakeNitro} onToggle={() => { plug.fakeNitro = !fakeNitro; }} />}
                />

                {/* Profile colors */}
                <div style={{ padding: "10px 12px", marginBottom: 6, background: "var(--background-secondary)", borderRadius: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: colorsEnabled ? 12 : 0 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: "var(--text-normal)", fontSize: 14, fontWeight: 500 }}>Цвета профиля</div>
                            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Тема профиля как у Nitro</div>
                        </div>
                        <Toggle enabled={colorsEnabled} onToggle={() => { plug.profileColorsEnabled = !colorsEnabled; }} />
                    </div>
                    {colorsEnabled && (
                        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                            <div>
                                <Forms.FormText style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 6 }}>Основной</Forms.FormText>
                                <ColorPicker
                                    color={primaryColor}
                                    onChange={(c: number) => { plug.profilePrimaryColor = c; }}
                                />
                            </div>
                            <div>
                                <Forms.FormText style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 6 }}>Дополнительный</Forms.FormText>
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
                    <div style={{ color: "var(--text-normal)", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Рамка аватара</div>
                    <DecorationPicker current={avatarDecoration} onChange={v => { plug.avatarDecoration = v; }} />
                </div>
            </section>

            <Divider className={Margins.top16} />

            {/* ── Discord-бейджи ── */}
            <section className={Margins.top16}>
                <Forms.FormTitle tag="h5">Discord-значки</Forms.FormTitle>
                <Forms.FormText className={Margins.bottom16} style={{ color: "var(--text-muted)" }}>
                    Локально добавляет официальные Discord-значки. Видно только тебе.
                </Forms.FormText>
                {VisualsPlugin.DISCORD_BADGES.map(badge => (
                    <BadgeToggle key={badge.id} badge={badge} enabled={selectedBadges.includes(badge.id)} onToggle={() => handleBadgeToggle(badge.id)} />
                ))}
            </section>

            <Divider className={Margins.top16} />

            {/* ── Кастомные значки ── */}
            <section className={Margins.top16}>
                <Forms.FormTitle tag="h5">Кастомные значки</Forms.FormTitle>
                <Forms.FormText className={Margins.bottom16} style={{ color: "var(--text-muted)" }}>
                    Добавь свои значки по URL картинки.
                </Forms.FormText>
                {customBadges.map(badge => (
                    <CustomBadgeRow key={badge.id} badge={badge} onRemove={() => { plug.customBadges = customBadges.filter(b => b.id !== badge.id); VisualsPlugin.syncBadges(); }} />
                ))}
                <div style={{ padding: 12, background: "var(--background-secondary)", borderRadius: 8, display: "flex", flexDirection: "column", gap: 8, marginTop: customBadges.length > 0 ? 8 : 0 }}>
                    <Forms.FormTitle tag="h5" style={{ marginBottom: 0 }}>Добавить значок</Forms.FormTitle>
                    <TextInput placeholder="URL картинки (https://...)" value={newBadgeUrl} onChange={setNewBadgeUrl} />
                    <TextInput placeholder="Подпись при наведении (необязательно)" value={newBadgeTooltip} onChange={setNewBadgeTooltip} />
                    {newBadgeUrl.trim() && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <img src={newBadgeUrl.trim()} alt="preview" style={{ width: 28, height: 28, borderRadius: "50%" }} onError={e => (e.currentTarget.style.opacity = "0.3")} />
                            <Forms.FormText style={{ color: "var(--text-muted)", fontSize: 12 }}>Предпросмотр</Forms.FormText>
                        </div>
                    )}
                    <Button size={Button.Sizes.SMALL} color={Button.Colors.BRAND} onClick={addCustomBadge} disabled={!newBadgeUrl.trim()}>Добавить</Button>
                </div>
            </section>

        </SettingsTab>
    );
}

export default wrapTab(VisualsSettings, "Визуалы");
