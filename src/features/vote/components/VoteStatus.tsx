"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { CardBase, CardInside, SubList } from "@/components/Layout/CardComp";
import Link from "next/link";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useData } from "@/contexts/DataContext";
import { useAppTime } from "@/contexts/TimeContext";
import styles from "./VoteStatus.module.css";

export default function VoteStatus() {
  const { t } = useTranslation();
  const { api: { fetchedData } } = useData();
  const { currentTime } = useAppTime();

  if (!fetchedData || Object.keys(fetchedData.config).length === 0) return null;

  const startVal = fetchedData.config["vote_start_at"];
  const endVal = fetchedData.config["vote_end_at"];
  const nowSeconds = currentTime.unix();

  const isStarted = !startVal || nowSeconds >= startVal;
  const isEnded = endVal && nowSeconds > endVal;
  const canVote = isStarted && !isEnded;

  if (!canVote) return null;

  return (
    <CardBase title={t("CardTitles.VOTE")}>
      <CardInside className={styles.cardClickable}>
        <Link href="/vote" className={styles.linkWrapper}>
          <SubList>
            <div className={styles.container}>
              <div className={styles.iconWrapper}>
                <HowToVoteIcon className={styles.voteIcon} />
              </div>
              <div className={styles.contentWrapper}>
                <h4 className={styles.titleText}>{t("Vote.Title")}</h4>
                <p className={styles.descText}>{t("Vote.Description")}</p>
              </div>
              <ArrowForwardIosIcon className={styles.arrowIcon} />
            </div>
          </SubList>
        </Link>
      </CardInside>
    </CardBase>
  );
}
