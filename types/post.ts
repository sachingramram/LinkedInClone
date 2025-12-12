// types/post.ts
export interface Reply {
  _id: string;
  authorId: string;
  authorName?: string | null;
  content: string;
  createdAt?: string;
}

export interface Comment {
  _id: string;
  authorId: string;
  authorName?: string | null;
  content: string;
  createdAt?: string;
  replies?: Reply[];
}

export interface Post {
  _id?: string;
  authorId: string;
  authorName?: string | null;
  authorImage?: string | null;
  content: string;
  imageUrl?: string | null;
  createdAt?: string;
  likes?: string[];
  comments?: Comment[];
}
