"use client";

import "@/styles/global-app.css";
import { useAppTime } from "@/contexts/TimeContext";

export default function Header() {
  const { currentTime } = useAppTime();

  return (
    <div className="header">
      <h1 className="title">Today</h1>
      <div className="date">
        <p className="day">{currentTime.format("YYYY/M/D")}</p>
        <p className="time">{currentTime.format("H:mm")}</p>
      </div>
    </div>
  );
}
