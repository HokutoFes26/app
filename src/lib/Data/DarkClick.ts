export default function DarkClick(isDark: boolean) {
    if (typeof document === "undefined") return;
    const root =
        (document.getElementById("app-root") as HTMLElement) || (document.querySelector(":root") as HTMLElement);
    if (!root) return;

    if (isDark) {
        root.style.setProperty("--bg-color", "#20201f");
        root.style.setProperty("--bg-sub-color", "#39383c");
        root.style.setProperty("--mainCanvas-color", "#080809");
        root.style.setProperty("--header-text", "#ededed");
        root.style.setProperty("--card-color", "#1d1d1d");
        root.style.setProperty("--card-divider-color", "#494949");
        root.style.setProperty("--text-color", "#fff");
        root.style.setProperty("--text-sub-color", "rgba(255, 255, 255, 0.65)");
        root.style.setProperty("--clock-color", "#97969c");
        root.style.setProperty("--border-color", "#3a3a3b");
        root.style.setProperty("--shadow-out", "rgba(0, 0, 0, 0.5) 0 0 18px");
        root.style.setProperty("--shadow-in", "inset #070708 0 0 18px");
        root.style.setProperty("--input-color", "rgba(0, 0, 0, 0.6)");
        root.style.setProperty("--disable-day-color", "rgba(255, 255, 255, 0.25)");
        root.style.setProperty("--glass-bg", "linear-gradient(135deg, rgba(30, 30, 30, 0.5), rgba(10, 10, 10, 0.3))");
        root.style.setProperty("--glass-border", "rgba(255, 255, 255, 0.2)");
        root.style.setProperty("--glass-shadow-1", "rgba(255, 255, 255, 0.2)");
        root.style.setProperty("--bottom-nav", "rgba(60, 60, 64, 0.6)");
        root.style.setProperty("--bottom-nav-shadow", "rgba(240, 240, 240, 0) 0 0 0");
        root.style.setProperty("--bottom-nav-indicator-bg", "#fff");
        root.style.setProperty("--bottom-nav-indicator-shadow", "#888");
        root.style.setProperty(
            "--header-grad",
            "linear-gradient( to bottom,rgba(66, 178, 26, 0.35) 0%,rgba(66, 178, 26, 0.2) 25%,rgba(0, 0, 0, 0) 42%",
        );
        root.style.setProperty("--pop-accent-main", "#AEFF00");
        root.style.setProperty("--pop-accent-sub", "#FF37D0");
        root.style.setProperty("--scheme", "dark");
    } else {
        root.style.setProperty("--bg-color", "#fff");
        root.style.setProperty("--bg-sub-color", "#ddd");
        root.style.setProperty("--mainCanvas-color", "#f1f0f5");
        root.style.setProperty("--header-text", "#1f1f1f");
        root.style.setProperty("--card-color", "#fff");
        root.style.setProperty("--card-divider-color", "#ededed");
        root.style.setProperty("--text-color", "#000");
        root.style.setProperty("--text-sub-color", "rgba(0, 0, 0, 0.65)");
        root.style.setProperty("--clock-color", "#556");
        root.style.setProperty("--border-color", "#ccc");
        root.style.setProperty("--shadow-out", "rgba(0, 0, 0, 0.2) 0 0 1.8vh");
        root.style.setProperty("--shadow-in", "inset #ddd 0 0 0.7vh 0.2vh");
        root.style.setProperty("--input-color", "rgba(255, 255, 255, 0.6)");
        root.style.setProperty("--disable-day-color", "rgba(0, 0, 0, 0.25)");
        root.style.setProperty(
            "--glass-bg",
            "linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1))",
        );
        root.style.setProperty("--glass-border", "rgba(255, 255, 255, 0.6)");
        root.style.setProperty("--glass-shadow-1", "rgba(0, 0, 0, 0.2)");
        root.style.setProperty("--bottom-nav", "rgba(250, 250, 254, 0.6");
        root.style.setProperty("--bottom-nav-shadow", "rgba(0, 0, 0, 0.4) 0 0 20px");
        root.style.setProperty("--bottom-nav-indicator-bg", "#444");
        root.style.setProperty("--bottom-nav-indicator-shadow", "#000");
        root.style.setProperty(
            "--header-grad",
            "linear-gradient( to bottom,rgba(0, 109, 243, 0.35) 0%,rgba(0, 109, 243, 0.2) 25%,rgba(0, 0, 0, 0) 42%",
        );
        root.style.setProperty("--pop-accent-main", "#09DD9A");
        root.style.setProperty("--pop-accent-sub", "#D95BF3");
        root.style.setProperty("--scheme", "light");
    }
}
