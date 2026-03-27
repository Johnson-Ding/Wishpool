import { Router } from "express";
import { z } from "zod";
import { jsonOk } from "../../lib/http";
import { deviceIdSchema, optionalTrimmedString, uuidParamSchema } from "../shared/schemas";
import type { WishesService } from "./service";

const createWishSchema = z.object({
  deviceId: deviceIdSchema,
  intent: z.string().trim().min(1),
  title: optionalTrimmedString,
  city: optionalTrimmedString,
  budget: optionalTrimmedString,
  timeWindow: optionalTrimmedString,
  rawInput: optionalTrimmedString,
});

const clarifyWishSchema = z
  .object({
    title: optionalTrimmedString,
    intent: optionalTrimmedString,
    city: optionalTrimmedString,
    budget: optionalTrimmedString,
    timeWindow: optionalTrimmedString,
    rawInput: optionalTrimmedString,
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: "至少提供一个要更新的字段",
  });

export function createWishesRouter(service: WishesService) {
  const router = Router();

  router.post("/", async (req, res, next) => {
    try {
      const payload = createWishSchema.parse(req.body);
      const wish = await service.createWish(payload);
      jsonOk(res, wish, 201);
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const id = uuidParamSchema.parse(req.params.id);
      const wish = await service.getWish(id);
      jsonOk(res, wish);
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:id/clarify", async (req, res, next) => {
    try {
      const id = uuidParamSchema.parse(req.params.id);
      const payload = clarifyWishSchema.parse(req.body);
      const wish = await service.clarifyWish(id, payload);
      jsonOk(res, wish);
    } catch (error) {
      next(error);
    }
  });

  router.post("/:id/plan/confirm", async (req, res, next) => {
    try {
      const id = uuidParamSchema.parse(req.params.id);
      const wish = await service.confirmWishPlan(id);
      jsonOk(res, wish);
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id/rounds", async (req, res, next) => {
    try {
      const id = uuidParamSchema.parse(req.params.id);
      const rounds = await service.listRounds(id);
      jsonOk(res, rounds);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
