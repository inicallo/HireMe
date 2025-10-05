// cron/sendBilling.ts
import cron from "node-cron";
import nodemailer, { SendMailOptions } from "nodemailer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Update this based on your email provider
  auth: {
    user: process.env.EMAIL_USER as string, // Your email address
    pass: process.env.EMAIL_PASS as string, // Your email password
  },
});

// REMOVED: The unnecessary formatDecimalToNumber function

// Schedule a cron job to run daily at 12:00 AM
cron.schedule("0 0 * * *", async () => {
  try {
    // Get users whose subscription ends tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const subscriptionsEndingSoon = await prisma.subscription.findMany({
      where: {
        end_date: {
          gte: today, // Check for dates greater than or equal to today
          lt: tomorrow, // and less than tomorrow to be safe
        },
        status: "active",
      },
      include: {
        user: true,
        subscriptionType: true, // Include this to get the amount
      },
    });

    // Send billing emails to these users
    for (const subscription of subscriptionsEndingSoon) {
      if (!subscription.user) {
        console.warn(`Subscription ${subscription.subscription_id} has no associated user.`);
        continue;
      }

      // ✅ CORRECTED: Use the amount directly and provide a fallback of 0 if it's null
      const amount = subscription.amount || subscription.subscriptionType.price || 0;

      const emailOptions: SendMailOptions = {
        from: process.env.EMAIL_USER,
        to: subscription.user.email,
        subject: "Subscription Renewal Reminder",
        text: `Dear ${subscription.user.first_name},

Your subscription is ending on ${subscription.end_date?.toISOString().split("T")[0]}.
Please make sure to renew your subscription to avoid interruption of services.

Amount due: Rp ${new Intl.NumberFormat("id-ID").format(amount as number)}

Thank you,
HireMe`,
      };

      await transporter.sendMail(emailOptions);
    }
  } catch (error) {
    console.error("Error sending billing emails:", error);
  }
});