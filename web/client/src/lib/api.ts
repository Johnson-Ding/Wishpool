import { createWishpoolApi } from "../../../../shared/wishpool-access/api";
import { supabase } from "./supabase";

const wishpoolApi = createWishpoolApi(supabase);

export const {
  fetchFeed,
  likeFeedItem,
  fetchComments,
  postComment,
  createWish,
  clarifyWish,
  confirmWishPlan,
  listMyWishes,
  deleteWish,
} = wishpoolApi;

export type { FeedComment, FeedItem, WishTask } from "../../../../shared/wishpool-access/api";
export {
  toFeedComment,
  toFeedItem,
  toWishTask,
  toWishTasks,
} from "../../../../shared/wishpool-access/api";
