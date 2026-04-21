"use client";

import React, { useState, Suspense } from "react";
import { Drawer, Button } from "antd";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

const Other = React.lazy(() => import("@/components/Layout/other"));

export default function MenuDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="text"
        onClick={() => setOpen(true)}
        className="menubutton"
        style={{
          position: "fixed",
          zIndex: 1000,
          fontSize: "24px",
          color: "var(--main-color)",
        }}
      >
        <SettingsOutlinedIcon style={{ color: "var(--text-sub-color)", fontSize: "32px" }} />
      </Button>

      <Drawer
        title="Settings / Info"
        onClose={() => setOpen(false)}
        open={open}
        size="default"
        getContainer={() => document.querySelector(".webapp-root") || document.body}
        style={{ borderRadius: "24px 0 0 24px" }}
      >
        <div style={{ padding: "0" }}>
          {open && (
            <Suspense
              fallback={
                <div style={{ textAlign: "center", padding: "20px", color: "var(--text-sub-color)" }}>Loading...</div>
              }
            >
              <Other />
            </Suspense>
          )}
        </div>
      </Drawer>
    </>
  );
}
