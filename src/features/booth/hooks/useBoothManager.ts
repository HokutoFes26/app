import React, { useState, useEffect, useRef } from "react";
import { App } from "antd";
import { StatusLevel } from "@/features/booth/types";
import { updateStallStatus } from "@/features/booth/api";
import { useRole } from "@/contexts/RoleContext";
import { useData } from "@/contexts/DataContext";

export const useBoothManager = () => {
  const { message } = App.useApp();
  const { assignedStall } = useRole();
  const {
    api: { fetchedData, fetchData },
  } = useData();
  const [crowd, setCrowd] = useState<StatusLevel>(0);
  const [stock, setStock] = useState<StatusLevel>(0);
  const [isDirty, setIsDirtyInternal] = useState(false);
  const isDirtyRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const lastStallRef = useRef<string | null>(null);

  const checkDirty = (currentCrowd: StatusLevel, currentStock: StatusLevel) => {
    if (fetchedData?.stalls && assignedStall) {
      const myStall = fetchedData.stalls.find((s) => s.stallName === assignedStall);
      if (myStall) {
        const dirty = currentCrowd !== myStall.crowdLevel || currentStock !== myStall.stockLevel;
        setIsDirtyInternal(dirty);
        isDirtyRef.current = dirty;
        return dirty;
      }
    }
    return false;
  };

  useEffect(() => {
    if (fetchedData?.stalls && assignedStall) {
      const myStall = fetchedData.stalls.find((s) => s.stallName === assignedStall);
      if (myStall) {
        if (assignedStall !== lastStallRef.current) {
          setCrowd(myStall.crowdLevel);
          setStock(myStall.stockLevel);
          setIsDirtyInternal(false);
          isDirtyRef.current = false;
          lastStallRef.current = assignedStall;
          return;
        }

        if (!isDirtyRef.current) {
          setCrowd(myStall.crowdLevel);
          setStock(myStall.stockLevel);
        } else {
          if (crowd === myStall.crowdLevel && stock === myStall.stockLevel) {
            setIsDirtyInternal(false);
            isDirtyRef.current = false;
          }
        }
      }
    }
  }, [fetchedData, assignedStall, crowd, stock]);

  const handleUpdate = async () => {
    if (!assignedStall) return;
    setLoading(true);
    try {
      await updateStallStatus(assignedStall, { crowdLevel: crowd, stockLevel: stock });
      setIsDirtyInternal(false);
      isDirtyRef.current = false;
      await fetchData();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (e) {
      message.error("更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const myStall = fetchedData?.stalls?.find((s) => s.stallName === assignedStall);
  const crowdOptions = ["空き", "やや混雑", "混雑"];
  const stockOptions = ["在庫あり", "少なめ", "売り切れ"];
  const statusColors = ["#52c41a", "#faad14", "#ff4d4f"];

  return {
    assignedStall,
    crowd,
    setCrowd,
    stock,
    setStock,
    isDirty,
    loading,
    showSuccess,
    myStall,
    crowdOptions,
    stockOptions,
    statusColors,
    handleUpdate,
    checkDirty,
  };
};
