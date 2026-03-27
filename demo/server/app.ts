import express from "express";
import { errorHandler, jsonOk, notFoundHandler } from "./lib/http";
import { createSupabaseClient } from "./lib/supabase";
import { createSupabaseFeedRepository } from "./modules/feed/repository";
import { createFeedRouter } from "./modules/feed/routes";
import { createFeedService, type FeedService } from "./modules/feed/service";
import { createWishesRouter } from "./modules/wishes/routes";
import { createSupabaseWishesRepository } from "./modules/wishes/repository";
import { createWishesService, type WishesService } from "./modules/wishes/service";

export interface AppDependencies {
  wishesService: WishesService;
  feedService: FeedService;
}

function createDefaultDependencies(): AppDependencies {
  const supabase = createSupabaseClient();

  return {
    wishesService: createWishesService(createSupabaseWishesRepository(supabase)),
    feedService: createFeedService(createSupabaseFeedRepository(supabase)),
  };
}

export function createApp(overrides?: Partial<AppDependencies>) {
  const app = express();
  const baseDependencies = overrides?.wishesService && overrides?.feedService ? undefined : createDefaultDependencies();
  const dependencies = {
    wishesService: overrides?.wishesService ?? baseDependencies?.wishesService,
    feedService: overrides?.feedService ?? baseDependencies?.feedService,
  };

  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    jsonOk(res, { status: "ok" });
  });

  app.use("/api/wishes", createWishesRouter(dependencies.wishesService!));
  app.use("/api/feed", createFeedRouter(dependencies.feedService!));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
