import { React, useState, useEffect } from "@webpack/common";
import { getCurrentLocale } from "@plugins/_core/visuals";

interface CustomRole {
    id: string;
    name: string;
    color: string;
}

// Storage helper - use in-memory storage if sessionStorage is not available
const storage = (() => {
    let rolesCache: CustomRole[] = [];
    try {
        if (typeof window !== "undefined" && window.sessionStorage) {
            return {
                get: () => {
                    try {
                        const stored = window.sessionStorage.getItem("robotcord_custom_roles");
                        return stored ? JSON.parse(stored) : [];
                    } catch {
                        return [];
                    }
                },
                set: (roles: CustomRole[]) => {
                    try {
                        window.sessionStorage.setItem("robotcord_custom_roles", JSON.stringify(roles));
                    } catch {
                        rolesCache = roles;
                    }
                }
            };
        }
    } catch {
        // Fall through to in-memory storage
    }

    return {
        get: () => rolesCache,
        set: (roles: CustomRole[]) => { rolesCache = roles; }
    };
})();

export function CustomRoleSettings() {
    const [roleName, setRoleName] = useState("");
    const [roleColor, setRoleColor] = useState("#0099ff");
    const [roles, setRoles] = useState<CustomRole[]>([]);

    const locale = getCurrentLocale();

    // Load roles on mount
    useEffect(() => {
        const loadedRoles = storage.get();
        setRoles(loadedRoles);
    }, []);

    // Save roles to storage
    const saveRoles = (newRoles: CustomRole[]) => {
        storage.set(newRoles);
    };

    const handleCreateRole = () => {
        if (!roleName.trim()) {
            alert(locale === "ru" ? "Пожалуйста, введите название роли" : "Please enter a role name");
            return;
        }

        const newRole: CustomRole = {
            id: Date.now().toString(),
            name: roleName,
            color: roleColor
        };

        // Add to list
        const updatedRoles = [...roles, newRole];
        setRoles(updatedRoles);
        saveRoles(updatedRoles);

        // Notify plugin
        const event = new CustomEvent("robotcord-create-custom-role", {
            detail: newRole
        });
        window.dispatchEvent(event);

        console.log("[CustomRoleSettings] Created custom role:", newRole);
        alert(`${locale === "ru" ? "Роль добавлена на все серверы!" : "Role added to all servers!"}`);

        setRoleName("");
        setRoleColor("#0099ff");
    };

    const handleDeleteRole = (roleId: string) => {
        const updatedRoles = roles.filter(r => r.id !== roleId);
        setRoles(updatedRoles);
        saveRoles(updatedRoles);

        // Notify plugin to remove role
        const event = new CustomEvent("robotcord-delete-custom-role", {
            detail: { id: roleId }
        });
        window.dispatchEvent(event);

        console.log("[CustomRoleSettings] Deleted custom role:", roleId);
        alert(`${locale === "ru" ? "Роль удалена!" : "Role deleted!"}`);
    };

    return (
        <div style={{ padding: "16px", marginBottom: "16px", backgroundColor: "var(--bg-secondary)", borderRadius: "8px" }}>
            <h3 style={{ marginBottom: "12px", fontSize: "16px", fontWeight: "600" }}>
                {locale === "ru" ? "Кастомные роли" : "Custom Roles"}
            </h3>

            {/* Create new role form */}
            <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: "var(--bg-primary)", borderRadius: "6px" }}>
                <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                        {locale === "ru" ? "Название роли" : "Role Name"}
                    </label>
                    <input
                        type="text"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        placeholder={locale === "ru" ? "Введите название" : "Enter role name"}
                        style={{
                            width: "100%",
                            padding: "8px 12px",
                            backgroundColor: "var(--bg-secondary)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "4px",
                            color: "var(--text-default)",
                            fontSize: "14px",
                            boxSizing: "border-box"
                        }}
                    />
                </div>

                <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                        {locale === "ru" ? "Цвет роли" : "Role Color"}
                    </label>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                            type="color"
                            value={roleColor}
                            onChange={(e) => setRoleColor(e.target.value)}
                            style={{
                                width: "50px",
                                height: "40px",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        />
                        <input
                            type="text"
                            value={roleColor}
                            onChange={(e) => setRoleColor(e.target.value)}
                            style={{
                                flex: 1,
                                padding: "8px 12px",
                                backgroundColor: "var(--bg-secondary)",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: "4px",
                                color: "var(--text-default)",
                                fontSize: "14px",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>
                </div>

                <button
                    onClick={handleCreateRole}
                    style={{
                        width: "100%",
                        padding: "10px 16px",
                        backgroundColor: "#5865F2",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4752C4")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#5865F2")}
                >
                    {locale === "ru" ? "Создать роль" : "Create Role"}
                </button>
            </div>

            {/* List of created roles */}
            {roles.length > 0 && (
                <div>
                    <h4 style={{ marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "var(--text-normal)" }}>
                        {locale === "ru" ? `Созданные роли (${roles.length})` : `Created Roles (${roles.length})`}
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {roles.map((role) => (
                            <div
                                key={role.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "10px 12px",
                                    backgroundColor: "var(--bg-tertiary)",
                                    borderRadius: "6px"
                                }}
                            >
                                <span
                                    style={{
                                        display: "inline-block",
                                        width: "16px",
                                        height: "16px",
                                        borderRadius: "50%",
                                        backgroundColor: role.color,
                                        flexShrink: 0
                                    }}
                                />
                                <span style={{ flex: 1, fontSize: "14px", color: "var(--text-default)", fontWeight: "500" }}>
                                    {role.name}
                                </span>
                                <button
                                    onClick={() => handleDeleteRole(role.id)}
                                    style={{
                                        padding: "4px 8px",
                                        backgroundColor: "#ED4245",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        transition: "background-color 0.2s"
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#DA373C")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ED4245")}
                                >
                                    {locale === "ru" ? "Удалить" : "Delete"}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {roles.length === 0 && (
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                    {locale === "ru"
                        ? "Нет созданных ролей. Создайте первую!"
                        : "No custom roles created yet. Create one!"}
                </p>
            )}
        </div>
    );
}
