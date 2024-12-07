export type CommentsProps = {
  did: string;
  threadId: string;
};
export type Reply = {
  post: {
    uri: string;
    likeCount?: number;
    repostCount?: number;
    replyCount?: number;
  };
};
export type Thread = {
  replies: Reply[];
  post: {
    likeCount?: number;
    repostCount?: number;
    replyCount?: number;
  };
};
