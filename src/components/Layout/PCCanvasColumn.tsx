"use client";

import React from "react";

interface PCCanvasColumnProps {
  children: React.ReactNode;
  width?: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function PCCanvasColumn({ 
  children, 
  width, 
  style, 
  className = "" 
}: PCCanvasColumnProps) {
  return (
    <div 
      className={`main ${className}`} 
      style={{ 
        width: width || "100%", 
        ...style 
      }}
    >
      <div className="mainCards">
        {children}
      </div>
    </div>
  );
}
