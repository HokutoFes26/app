"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const WebAppEntry = dynamic(() => import("@/components/WebAppEntry"), {
  ssr: false,
});

export default function WebApp() {
  return <WebAppEntry />;
}
