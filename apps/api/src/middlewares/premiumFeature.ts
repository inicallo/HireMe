import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma"; // ✅ USE the shared prisma client

export const checkActiveSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found in request." });
    }

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        user_id: userId,
        status: "active",
      },
    });

    if (!activeSubscription) {
      return res.status(403).json({
        message: "Access denied: No active subscription found.",
        detail: "Your subscription is either inactive, expired, or not found.",
      });
    }

    next();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("Error checking active subscription:", message);
    res.status(500).json({ message: "Internal server error", detail: message });
  }
};

export const checkFeatureLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        user_id: userId,
        status: "active",
      },
      include: {
        subscriptionType: true,
      },
    });

    if (!subscription) {
      return res.status(403).json({
        message: "Access denied. You need an active subscription to use this feature.",
      });
    }

    const { type } = subscription.subscriptionType;

    if (type === "STANDARD") {
      const featureUsage = await prisma.featureUsage.count({
        where: {
          user_id: userId,
          feature_name: "Skill Assessment",
        },
      });

      if (featureUsage >= 2) {
        return res.status(403).json({
          message: "Feature limit reached. Upgrade to Professional plan for unlimited access.",
        });
      }

      await prisma.featureUsage.create({
        data: {
          user_id: userId,
          feature_name: "Skill Assessment",
        },
      });
    }

    next();
  } catch (error) {
    console.error("Error checking feature limit:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};