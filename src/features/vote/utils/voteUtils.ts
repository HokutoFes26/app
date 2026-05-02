export interface VoteTarget {
  id: string;
  category: string;
  name: string;
}

export interface TimeStatus {
  canVote: boolean;
  message: string;
}

export const checkVoteTime = (startVal?: number | null, endVal?: number | null): TimeStatus => {
  const nowSeconds = Math.floor(Date.now() / 1000);

  if (startVal !== undefined && startVal !== null && startVal !== 0 && nowSeconds < startVal) {
    return {
      canVote: false,
      message: `投票は ${new Date(startVal * 1000).toLocaleString("ja-JP")} に開始されます`,
    };
  } else if (endVal !== undefined && endVal !== null && nowSeconds > endVal) {
    return { canVote: false, message: "投票期間は終了しました" };
  }
  
  return { canVote: true, message: "" };
};
