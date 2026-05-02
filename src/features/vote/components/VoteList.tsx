import React from "react";
import { Button, Tag, Space, Spin } from "antd";
import { VoteTarget } from "@/features/vote/utils/voteUtils";
import styles from "./VoteList.module.css";

interface VoteListProps {
  targets: VoteTarget[];
  currentVotedId?: string;
  votingId: string | null;
  canVote: boolean;
  onVote: (target: VoteTarget) => void;
  loading: boolean;
}

export const VoteList: React.FC<VoteListProps> = ({
  targets,
  currentVotedId,
  votingId,
  canVote,
  onVote,
  loading,
}) => {
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    );
  }

  if (targets.length === 0) {
    return <p className={styles.emptyText}>対象のデータが見つかりませんでした</p>;
  }

  return (
    <div className={styles.listContainer}>
      {targets.map((item) => {
        const isCurrentVoted = currentVotedId === item.id;
        return (
          <div
            key={item.id}
            className={styles.itemCard}
            style={{
              opacity: isCurrentVoted ? 0.8 : 1,
            }}
          >
            <Space>
              <span
                className={`${styles.itemName} ${isCurrentVoted ? styles.itemNameVoted : ""}`}
              >
                {item.name}
              </span>
              {isCurrentVoted && <Tag color="default">投票済み</Tag>}
            </Space>
            <Button
              type={isCurrentVoted ? "default" : "primary"}
              loading={votingId === item.id}
              disabled={isCurrentVoted || !canVote}
              onClick={() => onVote(item)}
              className={styles.voteBtn}
            >
              {isCurrentVoted ? "投票済み" : "投票"}
            </Button>
          </div>
        );
      })}
    </div>
  );
};
