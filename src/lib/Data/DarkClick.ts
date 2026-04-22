export default function DarkClick(isDark: boolean) {
   if (typeof document === "undefined") return;
   const root = document.getElementById("app-root") as HTMLElement || document.querySelector(":root") as HTMLElement;
   if (!root) return;
   
   if (isDark) {
      root.style.setProperty("--bg-color", "#18181a");
      root.style.setProperty("--bg-sub-color", "#39383c");
      root.style.setProperty("--mainCanvas-color", "#000");
      root.style.setProperty("--text-color", "#fff");
      root.style.setProperty("--text-sub-color", "rgba(255, 255, 255, 0.65)");
      root.style.setProperty("--clock-color", "#97969c");
      root.style.setProperty("--border-color", "#3a3a3b");
      root.style.setProperty("--shadow-out", "rgba(240, 240, 240, 0.3) 0 0 1.2vh");
      root.style.setProperty("--shadow-in", "inset #070708 0 0 1vh 0.2vh");
      root.style.setProperty("--input-color", "rgba(0, 0, 0, 0.6)");
      root.style.setProperty("--disable-day-color", "rgba(255, 255, 255, 0.25)");
      root.style.setProperty("--glass-bg", "linear-gradient(135deg, rgba(30, 30, 30, 0.5), rgba(10, 10, 10, 0.3))");
      root.style.setProperty("--glass-border", "rgba(255, 255, 255, 0.2)");
      root.style.setProperty("--glass-shadow-1", "rgba(255, 255, 255, 0.2)");
      root.style.setProperty("--bottom-nav", "rgba(60, 60, 64, 0.6)");
      root.style.setProperty("--bottom-nav-shadow", "rgba(240, 240, 240, 0) 0 0 0");
      root.style.setProperty("--bottom-nav-indicator-bg", "#fff");
      root.style.setProperty("--bottom-nav-indicator-shadow", "#888");
      root.style.setProperty("--scheme", "dark");
   } else {
      root.style.setProperty("--bg-color", "#fff");
      root.style.setProperty("--bg-sub-color", "#ddd");
      root.style.setProperty("--mainCanvas-color", "#f4f7fc");
      root.style.setProperty("--text-color", "#000");
      root.style.setProperty("--text-sub-color", "rgba(0, 0, 0, 0.65)");
      root.style.setProperty("--clock-color", "#556");
      root.style.setProperty("--border-color", "#ccc");
      root.style.setProperty("--shadow-out", "rgba(0, 0, 0, 0.2) 0 0 1.8vh");
      root.style.setProperty("--shadow-in", "inset #ddd 0 0 0.7vh 0.2vh");
      root.style.setProperty("--input-color", "rgba(255, 255, 255, 0.6)");
      root.style.setProperty("--disable-day-color", "rgba(0, 0, 0, 0.25)");
      root.style.setProperty("--glass-bg", "linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1))");
      root.style.setProperty("--glass-border", "rgba(255, 255, 255, 0.6)");
      root.style.setProperty("--glass-shadow-1", "rgba(0, 0, 0, 0.2)");
      root.style.setProperty("--bottom-nav", "rgba(250, 250, 254, 0.6");
      root.style.setProperty("--bottom-nav-shadow", "rgba(0, 0, 0, 0.4) 0 0 20px");
      root.style.setProperty("--bottom-nav-indicator-bg", "#444");
      root.style.setProperty("--bottom-nav-indicator-shadow", "#000");
      root.style.setProperty("--scheme", "light");
   }
}
