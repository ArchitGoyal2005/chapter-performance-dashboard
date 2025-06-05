import { NextFunction, Request, Response } from "express";
import { redisClient } from "..";

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get client IP address
    const clientIP = req.ip;

    if (!clientIP) {
      res.status(400).json({ error: "Unable to identify client IP" });
      return;
    }

    const key = `rate_limit:${clientIP}`;
    const windowSizeInSeconds = 60; // 1 minute
    const maxRequests = 30;

    // Get current request count for this IP
    const currentRequests = await redisClient.get(key);

    if (currentRequests === null) {
      // First request from this IP in current window
      await redisClient.setex(key, windowSizeInSeconds, 1);

      // Add headers for rate limit info
      res.set({
        "X-RateLimit-Limit": maxRequests,
        "X-RateLimit-Remaining": maxRequests - 1,
        "X-RateLimit-Reset": new Date(
          Date.now() + windowSizeInSeconds * 1000
        ).toISOString(),
      });

      return next();
    }

    const requestCount = parseInt(currentRequests);

    if (requestCount >= maxRequests) {
      // Rate limit exceeded
      const ttl = await redisClient.ttl(key);

      res.set({
        "X-RateLimit-Limit": maxRequests,
        "X-RateLimit-Remaining": 0,
        "X-RateLimit-Reset": new Date(Date.now() + ttl * 1000).toISOString(),
        "Retry-After": ttl,
      });

      res.status(429).json({
        error: "Too Many Requests",
        message: `Rate limit exceeded. Please try again after some time!`,
        retryAfter: ttl,
      });
      return;
    }

    // Increment request count
    await redisClient.incr(key);

    // Add headers for rate limit info
    res.set({
      "X-RateLimit-Limit": maxRequests,
      "X-RateLimit-Remaining": maxRequests - requestCount - 1,
      "X-RateLimit-Reset": new Date(
        Date.now() + (await redisClient.ttl(key)) * 1000
      ).toISOString(),
    });

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    next();
  }
};
