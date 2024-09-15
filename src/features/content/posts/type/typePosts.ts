export enum statusCommentLike {
  None = "None",
  Like = "Like",
  Dislike = "Dislike",
}
export type PostViewModelTdb = {
  _id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
};


export type newestLikes = {
  addedAt: string,
  userId: string,
  login: string
}

export type extendedLikesInfo = {
  likesCount: number,
  dislikesCount: number,
  myStatus: statusCommentLike,
  newestLikes: newestLikes[]
}



export type PostViewModelLiKeArray = {
  id: string,
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: extendedLikesInfo
}


export type PostViewModelLiKeArrayDB = {
  _id: string
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: extendedLikesInfo
}

export type PostViewModelT = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: extendedLikesInfo

};

export type PostInputModelT = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type dbPT = {
  dbPosts: PostViewModelT[];
};

export type PaginatorPosts = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: PostViewModelT[];
};
