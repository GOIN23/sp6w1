export type CommentInputModel = {
  content: string;
};

export type CommentatorInfo = {
  userId: string;
  userLogin: string;
};
export enum statusCommentLike {
  None = "None",
  Like = "Like",
  Dislike = "Dislike",
}

export type likesInfoT = {
  likesCount: number;
  dislikesCount: number;
  myStatus: statusCommentLike;
};

export type CommentViewModel = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: likesInfoT;
};

export type metaLikesInfoT = {
  userId: string;
  myStatus: statusCommentLike;
};
export type CommentViewModelDb = {
  _id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  IdPost: string;
  likesInfo: likesInfoT;
};

export type CommentLikeT = {
  _id: string;
  userID: string;
  commentId: string;
  status: statusCommentLike;
  createdAt: string;
};

export type PostLikeT = {
  _id: string;
  userID: string;
  postId: string;
  status: statusCommentLike;
  createdAt: string;
  login:string,
  
};



export type commenQu = {
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
};
