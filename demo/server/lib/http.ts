import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function jsonOk<T>(res: Response, data: T, statusCode = 200) {
  return res.status(statusCode).json({ data });
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, "not_found", "请求的资源不存在"));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: "validation_error",
        message: "请求参数校验失败",
        details: error.flatten(),
      },
    });
  }

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  const message = error instanceof Error ? error.message : "服务器内部错误";
  return res.status(500).json({
    error: {
      code: "internal_server_error",
      message,
    },
  });
}
