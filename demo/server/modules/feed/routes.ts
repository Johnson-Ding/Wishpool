import { Router } from "express";
import { z } from "zod";
import { jsonOk } from "../../lib/http";
import {
  bottleIdParamSchema,
  deviceIdSchema,
  optionalTrimmedString,
} from "../shared/schemas";
import type { FeedService } from "./service";

const listFeedQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).optional(),
});

const createCommentSchema = z.object({
  deviceId: deviceIdSchema.optional(),
  authorName: optionalTrimmedString,
  content: z.string().trim().min(1).max(500),
});

export function createFeedRouter(service: FeedService) {
  const router = Router();

  router.get("/", async (req, res, next) => {
    try {
      const query = listFeedQuerySchema.parse(req.query);
      const items = await service.listFeed(query.limit);
      jsonOk(res, items);
    } catch (error) {
      next(error);
    }
  });

  router.post("/:id/like", async (req, res, next) => {
    try {
      const id = bottleIdParamSchema.parse(req.params.id);
      const item = await service.likeFeedItem(id);
      jsonOk(res, item);
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id/comments", async (req, res, next) => {
    try {
      const id = bottleIdParamSchema.parse(req.params.id);
      const comments = await service.listComments(id);
      jsonOk(res, comments);
    } catch (error) {
      next(error);
    }
  });

  router.post("/:id/comments", async (req, res, next) => {
    try {
      const id = bottleIdParamSchema.parse(req.params.id);
      const payload = createCommentSchema.parse(req.body);
      const comment = await service.createComment(id, payload);
      jsonOk(res, comment, 201);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
