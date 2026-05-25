"use client";

import React from "react";
import { Segmented } from "antd";
import { CardBase, CardInside } from "@/components/Layout/CardComp";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRouter } from "next/navigation";
import { useVoteData } from "@/features/vote/hooks/useVoteData";
import { VoteList } from "@/features/vote/components/VoteList";
import styles from "./page.module.css";
import { AnimatePresence, motion } from "framer-motion";
import ClosedView from "@/app/_components/ClosedView";

export default function VotePage() {
  const router = useRouter();
  const [showClosedOverlay, setShowClosedOverlay] = React.useState(true);
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
    votedItems,
  } = useVoteData();

  const votedEId = votedItems["e"];
  const votedSId = votedItems["s"];
  const votedEName = targets.find((t) => t.id === votedEId)?.name;
  const votedSName = targets.find((t) => t.id === votedSId)?.name;

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {showClosedOverlay && (
          <motion.div
            key="closed-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 20000, position: "fixed", inset: 0 }}
          >
            <ClosedView onClose={() => setShowClosedOverlay(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => router.back()} className={styles.backBtn} aria-label="戻る">
        <ArrowBackIosNewIcon className={styles.backIcon} />
      </button>

      <div className={styles.contentWrapper}>
        <CardBase title="投票フォーム" disableTapAnimation={true}>
          <CardInside>
            <div className={styles.headerContainer}>
              <p className={styles.headerText}>
                展示や模擬店に 1 票ずつ投票しよう！
                <br />
                <span className={styles.warningText}>
                  それぞれのカテゴリで投票し直すことが可能です (最新の1票が有効になります)
                </span>
              </p>

              {!timeStatus.canVote && (
                <div className={styles.timeStatusContainer}>{timeStatus.message}</div>
              )}

              <p className={styles.votedStatusText}>
                <div style={{display: "flex", alignItems: "center"}}>
                {!votedEId ? <ErrorIcon className={styles.ErrorIcon}/> : <CheckCircleIcon className={styles.CheckIcon} />}展示: {!votedEId ? "投票していません！" : `${votedEName || "不明な項目"}`}
                </div>
                <div style={{display: "flex", alignItems: "center"}}>
                {!votedSId ? <ErrorIcon className={styles.ErrorIcon} /> : <CheckCircleIcon className={styles.CheckIcon} />}模擬店: {!votedSId ? "投票していません！" : `${votedSName || "不明な項目"}`}
                </div>
              </p>
              <Segmented
                block
                size="large"
                value={category}
                onChange={(val) => setCategory(val as string)}
                options={[
                  { label: "展示", value: "e" },
                  { label: "模擬店", value: "s" },
                ]}
                className={styles.segmented}
              />
            </div>

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
