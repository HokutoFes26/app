import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/Server/api";
import { useRole } from "@/contexts/RoleContext";

export const useAdminAuth = () => {
  const { setRole, isAdmin, isStallAdmin, isAuthenticating } = useRole();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (isStallAdmin) {
      router.replace("/booth");
    }
  }, [isStallAdmin, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("パスワードを入力してください");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.auth.loginAsAdmin(password);
      localStorage.setItem("admin_auth", "true");
      setRole("admin");
    } catch (err: any) {
      console.error("[Admin Login] Failed:", err.message);
      setError("管理者パスワードが正しくないか、ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return {
    password,
    setPassword,
    loading,
    error,
    handleLogin,
    isAdmin,
    isStallAdmin,
    isAuthenticating,
  };
};
