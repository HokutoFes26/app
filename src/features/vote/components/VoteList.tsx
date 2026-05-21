import React from "react";
import { Button, Tag, Space, Spin } from "antd";
import { VoteTarget } from "@/features/vote/utils/voteUtils";
import { CardBase, CardInside, Divider } from "@/components/Layout/CardComp";
import styles from "./VoteList.module.css";

interface VoteListProps {
  targets: VoteTarget[];
  currentVotedId?: string;
  votingId: string | null;
  canVote: boolean;
  onVote: (target: VoteTarget) => void;
  loading: boolean;
}

export const VoteList: React.FC<VoteListProps> = ({ targets, currentVotedId, votingId, canVote, onVote, loading }) => {
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
      {targets.map((item, index) => {
        const isCurrentVoted = currentVotedId === item.id;
        return (
          <React.Fragment key={item.id}>
            {index !== 0 && <Divider margin="4px 0" height="1px" />}
            <div
              className={styles.itemCard}
              style={{
                opacity: isCurrentVoted ? 0.8 : 1,
              }}
            >
              <div className={styles.itemInfo}>
                <Space>
                  <span className={`${styles.itemName} ${isCurrentVoted ? styles.itemNameVoted : ""}`}>
                    {item.name}
                  </span>
                  {isCurrentVoted && <Tag color="default">投票済み</Tag>}
                </Space>
                {item.team && <div className={styles.itemTeam}>{item.team}</div>}
              </div>
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
          </React.Fragment>
        );
      })}
    </div>
  );
};
