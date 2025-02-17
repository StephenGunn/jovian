export let comment_data: {
  updated: boolean;
  likes: number;
  reposts: number;
  replies: number;
  like_avatars: string[];
} = $state({
  updated: false,
  likes: 0,
  reposts: 0,
  replies: 0,
  like_avatars: []
});
