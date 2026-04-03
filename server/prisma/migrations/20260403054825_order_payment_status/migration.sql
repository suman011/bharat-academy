-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'paid';

-- AlterTable
ALTER TABLE "UserNotificationState" ALTER COLUMN "announcementsSeenAt" SET DEFAULT NOW();
