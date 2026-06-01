/*
 * Robotcord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
*/

import { openNotificationLogModal } from "@api/Notifications/notificationLog";
import { useSettings } from "@api/Settings";
import { Divider } from "@components/Divider";
import { FormSwitch } from "@components/FormSwitch";
import { FolderIcon, GithubIcon, LogIcon, PaintbrushIcon, RestartIcon } from "@components/Icons";
import { QuickAction, QuickActionCard } from "@components/settings/QuickAction";
import { SpecialCard } from "@components/settings/SpecialCard";
import { SettingsTab, wrapTab } from "@components/settings/tabs/BaseTab";
import { openContributorModal } from "@components/settings/tabs/plugins/ContributorModal";
import { openPluginModal } from "@components/settings/tabs/plugins/PluginModal";
import SettingsPlugin from "@plugins/_core/settings";
import { gitRemote } from "@shared/vencordUserAgent";
import { IS_WINDOWS } from "@utils/constants";
import { Margins } from "@utils/margins";
import { isPluginDev } from "@utils/misc";
import { relaunch } from "@utils/native";
import { ConfirmModal, Forms, openModal, React, UserStore } from "@webpack/common";

import { MacOSVibrancySettings } from "./MacVibrancySettings";
import { NotificationSection } from "./NotificationSettings";
import { WindowsMaterialSettings } from "./WindowsMaterialSettings";

type KeysOfType<Object, Type> = {
    [K in keyof Object]: Object[K] extends Type ? K : never;
}[keyof Object];

function Switches() {
    const settings = useSettings(["useQuickCss", "enableReactDevtools", "frameless", "winNativeTitleBar", "transparent", "winCtrlQ", "disableMinSize"]);

    const Switches = [
        { key: "useQuickCss", title: "Включить пользовательский CSS" },
        !IS_WEB && { key: "enableReactDevtools", title: "Включить React DevTools", restartRequired: true },
        !IS_WEB && (!IS_DISCORD_DESKTOP || !IS_WINDOWS ? { key: "frameless", title: "Отключить рамку окна", restartRequired: true } : { key: "winNativeTitleBar", title: "Использовать нативную рамку Windows", restartRequired: true }),
        !IS_WEB && { key: "transparent", title: "Включить прозрачность", description: "Требует поддержки темы.", restartRequired: true },
        IS_DISCORD_DESKTOP && { key: "disableMinSize", title: "Отключить минимальный размер окна", restartRequired: true },
        !IS_WEB && IS_WINDOWS && { key: "winCtrlQ", title: "Ctrl+Q для выхода из Discord", restartRequired: true },
    ] satisfies Array<false | { key: KeysOfType<typeof settings, boolean>; title: string; description?: string; restartRequired?: boolean; }>;

    return Switches.map(setting => {
        if (!setting) return null;
        const { key, title, description, restartRequired } = setting;
        return (
            <FormSwitch
                key={key}
                title={title}
                description={description}
                value={settings[key]}
                onChange={v => {
                    settings[key] = v;
                    if (restartRequired) {
                        openModal(props => (
                            <ConfirmModal
                                {...props}
                                title="Требуется перезапуск"
                                subtitle="Для применения изменений необходим перезапуск."
                                confirmText="Перезапустить сейчас"
                                cancelText="Позже"
                                variant="primary"
                                onConfirm={relaunch}
                            />
                        ));
                    }
                }}
            />
        );
    });
}

function RobotcordSettings() {
    const user = UserStore?.getCurrentUser();

    return (
        <SettingsTab>
            {isPluginDev(user?.id) && (
                <SpecialCard
                    title="Вклад в проект"
                    subtitle="Спасибо за ваш код!"
                    description="Как участнику Robotcord, вам доступен особый значок."
                    backgroundColor="#EDCC87"
                    buttonTitle="Посмотреть вклад"
                    buttonOnClick={() => openContributorModal(user)}
                />
            )}

            <section>
                <Forms.FormTitle tag="h5">Быстрые действия</Forms.FormTitle>
                <QuickActionCard>
                    <QuickAction Icon={LogIcon} text="Журнал уведомлений" action={openNotificationLogModal} />
                    <QuickAction Icon={PaintbrushIcon} text="Редактировать QuickCSS" action={() => VencordNative.quickCss.openEditor()} />
                    {!IS_WEB && (
                        <>
                            <QuickAction Icon={RestartIcon} text="Перезапустить Discord" action={relaunch} />
                            <QuickAction Icon={FolderIcon} text="Открыть папку настроек" action={() => VencordNative.settings.openFolder()} />
                        </>
                    )}
                    <QuickAction Icon={GithubIcon} text="Исходный код" action={() => VencordNative.native.openExternal("https://github.com/" + gitRemote)} />
                </QuickActionCard>
            </section>

            <Divider />

            <section className={Margins.top16}>
                <Forms.FormTitle tag="h5">Настройки Robotcord</Forms.FormTitle>
                <Forms.FormText className={Margins.bottom20} style={{ color: "var(--text-muted)" }}>
                    Подсказка: Позицию этого раздела можно изменить в{" "}
                    <a onClick={() => openPluginModal(SettingsPlugin)}>
                        настройках плагина «Настройки»
                    </a>!
                </Forms.FormText>
                <Switches />
            </section>

            <MacOSVibrancySettings />
            <WindowsMaterialSettings />
            <NotificationSection />
        </SettingsTab>
    );
}

export default wrapTab(RobotcordSettings, "Настройки Robotcord");