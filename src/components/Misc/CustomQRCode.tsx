import React from "react";
import { QRCode } from "antd";

interface CustomQRCodeProps {
  value: string;
  size?: number;
  icon?: string;
  iconW?: number;
  type?: "canvas" | "svg";
  className?: string;
  style?: React.CSSProperties;
}

const colors = {
  c1: "#2551a5",
  c2: "#a633cb",
  c3: "#cc2c74",
  c4: "#ffce3c",
};

export default function CustomQRCode({
  value,
  size = 250,
  icon = "/img/common/mainlogo.webp",
  iconW = 77,
  type = "svg",
  className,
  style,
}: CustomQRCodeProps) {
  const padding = 28;
  const lSize = 64;
  const lThickness = 6;
  const iconSize = { width: iconW, height: iconW * 0.684877 };

  return (
    <div
      className={className}
      style={{
        position: "relative",
        padding: `${padding}px`,
        background: "#fff",
        display: "inline-block",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "8px",
          left: "8px",
          width: `${lSize}px`,
          height: `${lSize}px`,
          borderLeft: `${lThickness}px solid ${colors.c1}`,
          borderTop: `${lThickness}px solid ${colors.c1}`,
          borderTopLeftRadius: "24px",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          width: `${lSize}px`,
          height: `${lSize}px`,
          borderRight: `${lThickness}px solid ${colors.c2}`,
          borderTop: `${lThickness}px solid ${colors.c2}`,
          borderTopRightRadius: "24px",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "8px",
          left: "8px",
          width: `${lSize}px`,
          height: `${lSize}px`,
          borderLeft: `${lThickness}px solid ${colors.c3}`,
          borderBottom: `${lThickness}px solid ${colors.c3}`,
          borderBottomLeftRadius: "24px",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "8px",
          right: "8px",
          width: `${lSize}px`,
          height: `${lSize}px`,
          borderRight: `${lThickness}px solid ${colors.c4}`,
          borderBottom: `${lThickness}px solid ${colors.c4}`,
          borderBottomRightRadius: "24px",
        }}
      />
      <QRCode value={value} size={size} bordered={false} errorLevel="H" type={type} icon={icon} iconSize={iconSize} />
    </div>
  );
}
