import React from "react";

export interface LayoutOptions {
  isMobile: boolean;
  columns: number;
  isStallAdmin: boolean;
}

export const calculateLayout = (cards: Record<string, React.ReactNode>, options: LayoutOptions) => {
  const { isMobile, columns, isStallAdmin } = options;

  if (isMobile) {
    return [
      [cards.Header, cards.Spot, cards.HotNews, cards.Events, cards.News, cards.Vote],
      !isStallAdmin ? [cards.BoothFav, cards.Booth] : [],
      [cards.Bus, cards.QA, cards.Lost],
      [cards.Other],
    ].filter((col) => col.length > 0);
  }

  if (columns === 4) {
    return [
      [cards.Spot, cards.BoothFav, cards.Booth1],
      [cards.Booth2],
      [cards.Events, cards.Bus, cards.Vote],
      [cards.News, cards.QA, cards.Lost],
    ];
  }

  if (columns === 3) {
    return [
      [cards.Spot, cards.BoothFav, cards.Booth],
      [cards.Events, cards.Bus, cards.Vote],
      [cards.News, cards.QA, cards.Lost],
    ];
  }

  return [
    [cards.Spot, cards.HotNews, cards.BoothFav, cards.Booth, cards.News],
    [cards.Vote, cards.Events, cards.Bus, cards.QA, cards.Lost],
  ];
};
