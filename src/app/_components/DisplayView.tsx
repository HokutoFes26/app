"use client";

import React, { Suspense, useMemo } from "react";
import "@/styles/global-app.css";
import { useUserView } from "@/features/main/hooks/useUserView";
import { useTranslation } from "react-i18next";
import { useData } from "@/contexts/DataContext";

import EventStatus from "@/features/event/components/EventStatus";
import BoothStatus from "@/features/booth/components/BoothStatus";
import ExhibitionStatus from "@/features/event/components/ExhibitionStatus";
import NewsStatus from "@/features/news/components/NewsStatus";
import PCCanvasColumn from "@/components/Layout/PCCanvasColumn";
import Homepage from "@/components/Layout/Homepage";
import styles from "./UserView.module.css";

const BusStatus = React.lazy(() => import("@/features/bus/components/BusStatus"));
const LostStatus = React.lazy(() => import("@/features/lost/components/LostStatus"));
const AppShare = React.lazy(() => import("@/components/Layout/AppShare"));

const FallbackLoader = ({ text = "Loading..." }) => <div className={styles.fallbackLoader}>{text}</div>;

export default function DisplayView() {
  const { t } = useTranslation();
  const {
    api: { fetchedData },
  } = useData();
  const { columns, hasHotNews, hotTime } = useUserView();

  const cards = useMemo(
    () => ({
      HotNews: hasHotNews ? <NewsStatus key="hotnews" onlyHot={true} hotTime={hotTime} /> : null,
      Events: <EventStatus key="events" />,
      Exhibition: <ExhibitionStatus key="exhibition" />,
      Booth1: <BoothStatus key="booth1" split="first" />,
      Booth2: <BoothStatus key="booth2" split="second" />,
      News: <NewsStatus key="news" />,
      Bus: (
        <Suspense key="bus" fallback={<FallbackLoader text="Loading Bus..." />}>
          <BusStatus />
        </Suspense>
      ),
      Lost: (
        <Suspense key="lost" fallback={<FallbackLoader text="Loading Lost..." />}>
          <LostStatus />
        </Suspense>
      ),
      Homepage: <Homepage key="homepage" />,
    }),
    [hasHotNews, hotTime],
  );

  const displayLayout = useMemo(() => {
    return [[cards.Booth1], [cards.Booth2], [cards.Events, cards.News], [cards.Bus, cards.Lost]];
  }, [cards]);

  return (
    <div className="mainCanvas">
      <div className="PCCanvas">
        {displayLayout.map((column, i) => (
          <PCCanvasColumn key={i} width="25%">
            {column}
          </PCCanvasColumn>
        ))}
        <Suspense fallback={null}>
          <AppShare forceRoot={true} />
        </Suspense>
      </div>
    </div>
  );
}
