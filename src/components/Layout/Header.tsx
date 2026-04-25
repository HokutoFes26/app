import "@/styles/global-app.css";
import { useEffect, useState } from "react";

export default function Header() {
  return (
    <div className="header">
      <h1 className="title">Events</h1>
      <div className="date">
        <p className="day">2026/5/23</p>
        <p className="time">10:14</p>
      </div>
    </div>
  );
}
