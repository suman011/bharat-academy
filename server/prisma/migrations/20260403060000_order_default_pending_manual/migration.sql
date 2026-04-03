-- New orders must not implicitly be "paid" if a code path omits paymentStatus.
ALTER TABLE "Order" ALTER COLUMN "paymentStatus" SET DEFAULT 'pending_manual';
