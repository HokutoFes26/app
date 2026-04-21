import { createContext, useContext, useState, useMemo, useEffect, ReactNode, Dispatch, SetStateAction } from "react";
import { ConfigProvider, theme } from "antd";
import enUS from "antd/lib/locale/en_US";
import jaJP from "antd/lib/locale/ja_JP";
import { useTranslation } from "react-i18next";
import { getCookie, setCookie } from "@/lib/Server/Cookie";
import DarkClick from "@/lib/Data/DarkClick";

type ThemeContextType = {
  primaryColor: string;
  isDarkMode: boolean;
  setIsDarkMode: Dispatch<SetStateAction<boolean>>;
  localeLang: typeof jaJP | typeof enUS;
  setLocaleLang: Dispatch<SetStateAction<typeof jaJP | typeof enUS>>;
  isPerformanceMode: boolean;
  setIsPerformanceMode: Dispatch<SetStateAction<boolean>>;
  isDebugMode: boolean;
  setIsDebugMode: Dispatch<SetStateAction<boolean>>;
};

type ThemeProviderProps = {
  children: ReactNode;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { i18n } = useTranslation();
  const primaryColor = "#1f1f1f";
  const { defaultAlgorithm, darkAlgorithm } = theme;

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") return getCookie("dark") === "true";
    return false;
  });

  const [isDebugMode, setIsDebugMode] = useState(() => {
    if (typeof window !== "undefined") return getCookie("debug") === "true";
    return false;
  });

  const [isPerformanceMode, setIsPerformanceMode] = useState(true);
  const [localeLang, setLocaleLang] = useState(i18n.languages[0] == "ja" ? jaJP : enUS);

  useEffect(() => {
    const root =
      (document.querySelector(".webapp-root") as HTMLElement) || (document.querySelector(":root") as HTMLElement);

    DarkClick(isDarkMode);
    setCookie("dark", isDarkMode.toString(), 7);

    if (root) {
      root.style.setProperty("--main-color", isDarkMode ? "#f0f0f0" : primaryColor);
    }
  }, [isDarkMode]);

  useEffect(() => {
    setCookie("debug", isDebugMode.toString(), 7);
  }, [isDebugMode]);

  const themeValue = useMemo(() => {
    const currentPrimary = isDarkMode ? "#f0f0f0" : "#1f1f1f";
    return {
      primaryColor: currentPrimary,
      isDarkMode,
      setIsDarkMode,
      localeLang,
      setLocaleLang,
      isPerformanceMode,
      setIsPerformanceMode,
      isDebugMode,
      setIsDebugMode,
    };
  }, [isDarkMode, localeLang, isPerformanceMode, isDebugMode]);

  return (
    <ThemeContext.Provider value={themeValue}>
      <ConfigProvider
        locale={localeLang}
        theme={{
          algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
          token: {
            colorPrimary: themeValue.primaryColor,
            colorInfo: themeValue.primaryColor,
          },
          components: {
            Select: {
              optionSelectedColor: isDarkMode ? "#000000" : "#ffffff",
              optionSelectedBg: isDarkMode ? "#f0f0f0" : "#1f1f1f",
            },
            Radio: {
              buttonSolidCheckedColor: isDarkMode ? "#000000" : "#ffffff",
            },
            Button: {
              primaryColor: isDarkMode ? "#000" : "#fff",
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
