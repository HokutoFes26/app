"use client";

import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import CallMadeRoundedIcon from '@mui/icons-material/CallMadeRounded';
import { Button } from "antd";
import { motion } from "framer-motion";

interface ClosedViewProps {
  onClose?: () => void;
}

export default function ClosedView({ onClose }: ClosedViewProps) {
  return (
    <div
      style={{
        height: "100dvh",
        width: "100vw",
        display: "flex",
        inset: "0",
        position: "fixed",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
        textAlign: "center",
        zIndex: 20000,
        background:
          "radial-gradient(at 0% 0%, #99ebff, transparent), radial-gradient(at 100% 0%, #dcffd7, transparent), radial-gradient(at 0% 100%, #e7ff70, transparent), radial-gradient(at 100% 100%, #ff91dc, transparent)",
        backgroundColor: "#fff",
      }}
    >
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "rgba(0,0,0,0.1)",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            color: "#000",
          }}
        >
          <CloseIcon />
        </button>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p style={{ fontSize: "4em", margin: "0" }}>👋</p>
        <h2 style={{ color: "#000000", wordBreak: "auto-phrase", marginTop: "20px" }}>
          第18回 北斗祭は終了いたしました
        </h2>
        <p
          style={{
            marginTop: "16px",
            color: "#1c1c1c",
            wordBreak: "auto-phrase",
            lineHeight: "1.6",
            maxWidth: "500px",
          }}
        >
          第18回 北斗祭は多くの皆様にご来場いただき、大盛況の内に閉幕いたしました。
          <br />
          ご来場いただいた皆様、誠にありがとうございました。
        </p>

        {onClose && (
          <div
            style={{
              marginTop: "40px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Button
              type="primary"
              size="large"
              onClick={onClose}
              style={{
                borderRadius: "999px",
                height: "50px",
                padding: "0 40px",
                fontSize: "16px",
                backgroundColor: "#000",
                borderColor: "#000",
                width: "min(250px, 70vw)",
              }}
            >
              アプリの内容を見る
            </Button>
            <Button
              size="large"
              href="https://hokutofes26.github.io/#lost"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                borderRadius: "999px",
                height: "50px",
                padding: "0 40px",
                fontSize: "16px",
                width: "min(250px, 70vw)",
              }}
            >
              落とし物を確認する
              <CallMadeRoundedIcon style={{fontSize: "0.9em"}} />
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
