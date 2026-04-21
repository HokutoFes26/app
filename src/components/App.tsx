import "./App.css";
import AspectDetector from "@/components/scripts/Misc/AspectDetector";
import { DataProvider } from "@/components/contexts/DataProvider";
import { useAppTime } from "@/components/contexts/TimeContext";
import dayjs from "dayjs";
import React, { useEffect, Suspense } from "react";

const PC = React.lazy(() => import("@/components/PC"));
const Phone = React.lazy(() => import("@/components/Phone"));

const DEBUG_MOCK_TIME_STR: string | null = "2026-05-23T14:10:00";
// const DEBUG_MOCK_TIME_STR = null;

function App() {
  const aspectRatio = AspectDetector();
  const { currentTime, setCurrentTime } = useAppTime();

  useEffect(() => {
    if (DEBUG_MOCK_TIME_STR) {
      setCurrentTime(dayjs(DEBUG_MOCK_TIME_STR));
    }
  }, [setCurrentTime]);

  return (
    <DataProvider>
      <Suspense
        fallback={
          <div
            style={{
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "14px", color: "var(--text-sub-color)" }}>Loading App...</span>
          </div>
        }
      >
        {aspectRatio ? <Phone/> : <PC/>}
      </Suspense>
    </DataProvider>
  );
}

export default App;
