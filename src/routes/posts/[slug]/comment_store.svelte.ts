export let comment_data: {
  updated: boolean;
  likes: number;
  reposts: number;
  replies: number;
} = $state({
  updated: false,
  likes: 0,
  reposts: 0,
  replies: 0
});
