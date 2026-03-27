import { z } from "zod";

export const trimmedString = z.string().trim();
export const nonEmptyString = trimmedString.min(1);
export const optionalTrimmedString = z.string().trim().optional().transform((value) => value || undefined);
export const deviceIdSchema = nonEmptyString.max(128);
export const uuidParamSchema = z.string().uuid();
export const bottleIdParamSchema = z.coerce.number().int().positive();
