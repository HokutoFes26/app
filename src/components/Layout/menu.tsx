"use client";

import React, { useState } from "react";
import { Drawer, Button } from "antd";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Settings from "@/components/Misc/Settings";

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
        getContainer={() => document.getElementById("app-root") || document.body}
        style={{ borderRadius: "24px 0 0 24px", overflow: "hidden", backgroundColor: "var(--mainCanvas-color)" }}
      >
        <div style={{ padding: "0" }}>
          {open && <Settings onClose={() => setOpen(false)} />}
        </div>
      </Drawer>
    </>
  );
}
