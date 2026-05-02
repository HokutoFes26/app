"use client";

import React from "react";
import { Segmented } from "antd";
import { CardBase, CardInside } from "@/components/Layout/CardComp";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useRouter } from "next/navigation";
import { useVoteData } from "@/features/vote/hooks/useVoteData";
import { VoteList } from "@/features/vote/components/VoteList";
import styles from "./page.module.css";

export default function VotePage() {
  const router = useRouter();
  const {
    targets,
    category,
    setCategory,
    loading,
    votingId,
    timeStatus,
    handleVote,
    filteredTargets,
    currentVotedId,
  } = useVoteData();

  const currentVotedName = targets.find((t) => t.id === currentVotedId)?.name;

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backBtn}>
        <ArrowBackIosNewIcon className={styles.backIcon} />
      </button>

      <div className={styles.contentWrapper}>
        <CardBase title="投票フォーム" disableTapAnimation={true}>
          <CardInside>
            <div className={styles.headerContainer}>
              <p className={styles.headerText}>
                模擬店や展示に投票しよう！
                <br />
                <span className={styles.warningText}>
                  投票し直すことが可能です (最新の1票が有効になります)
                </span>
              </p>

              {!timeStatus.canVote && (
                <div className={styles.timeStatusContainer}>{timeStatus.message}</div>
              )}

              <Segmented
                block
                size="large"
                value={category}
                onChange={(val) => setCategory(val as string)}
                options={[
                  { label: "模擬店", value: "s" },
                  { label: "展示", value: "e" },
                  { label: "その他", value: "o" },
                ]}
                className={styles.segmented}
              />
            </div>
            <p className={styles.votedStatusText}>
              {!currentVotedId ? "まだ投票していません！" : `${currentVotedName || "不明な項目"}に投票しました！`}
            </p>

            <VoteList
              targets={filteredTargets}
              currentVotedId={currentVotedId}
              votingId={votingId}
              canVote={timeStatus.canVote}
              onVote={handleVote}
              loading={loading}
            />
          </CardInside>
        </CardBase>
      </div>
    </div>
  );
}
