-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedByEmail" TEXT,
ADD COLUMN     "paymentReference" TEXT;
