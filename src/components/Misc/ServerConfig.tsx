"use client";

import React, { useState, useEffect } from "react";
import { CardBase, CardInside } from "@/components/Layout/CardComp";
import { Slider, App, Button } from "antd";
import { useData } from "@/contexts/DataContext";
import { supabase } from "@/lib/Server/mockSupabase";

export default function ServerConfig() {
  const { message } = App.useApp();
  const {
    change: { serverConfig },
    api: { fetchData },
  } = useData();

  const [isUpdating, setIsUpdating] = useState(false);
  const [localInterval, setLocalInterval] = useState(serverConfig.interval / 1000);
  const [localFreq, setLocalFreq] = useState(serverConfig.freq);

  useEffect(() => {
    setLocalInterval(serverConfig.interval / 1000);
    setLocalFreq(serverConfig.freq);
  }, [serverConfig]);

  const handleApply = async () => {
    setIsUpdating(true);
    try {
      const results = await Promise.all([
        supabase
          .from("app_settings")
          .update({ value_int: localInterval * 1000 })
          .eq("key", "fetch_interval_ms"),
        supabase.from("app_settings").update({ value_int: localFreq }).eq("key", "full_refresh_freq"),
      ]);

      const errors = results.filter((r) => r.error);
      if (errors.length > 0) throw errors[0].error;

      message.success("Traffic settings applied");
      await fetchData();
    } catch (e) {
      console.error(e);
      message.error("Failed to update settings");
    } finally {
      setIsUpdating(false);
    }
  };

  const hasChanges = localInterval !== serverConfig.interval / 1000 || localFreq !== serverConfig.freq;

  return (
    <CardBase title="Server Manager">
      <CardInside className="no-vertical-padding">
        <div style={{ background: "none", borderRadius: "8px", padding: "15px 0" }}>
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "11px", marginBottom: "5px" }}>
              <b>Booth Interval:</b>{" "}
              <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--main-color)" }}>{localInterval}s</span>
            </p>
            <Slider min={5} max={60} step={5} value={localInterval} onChange={setLocalInterval} disabled={isUpdating} />
          </div>

          <div style={{ marginBottom: "25px" }}>
            <p style={{ fontSize: "11px", marginBottom: "5px" }}>
              <b>Full Refresh:</b> Every{" "}
              <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--main-color)" }}>
                {localFreq} cycles
              </span>
              <span style={{ color: "#999", marginLeft: "10px" }}>(= Approx. {localInterval * localFreq}s)</span>
            </p>
            <Slider min={2} max={24} step={1} value={localFreq} onChange={setLocalFreq} disabled={isUpdating} />
          </div>

          <Button
            type="primary"
            block
            onClick={handleApply}
            loading={isUpdating}
            disabled={!hasChanges}
            style={{
              height: "45px",
              borderRadius: "12px",
              fontWeight: "bold",
              background: hasChanges ? "var(--main-color)" : "#ccc",
              borderColor: hasChanges ? "var(--main-color)" : "#ccc",
            }}
          >
            Apply
          </Button>
        </div>
      </CardInside>
    </CardBase>
  );
}
