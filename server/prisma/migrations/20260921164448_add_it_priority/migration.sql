-- CreateEnum
CREATE TYPE "ItPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CurrentStatus" ADD VALUE 'OPEN';
ALTER TYPE "CurrentStatus" ADD VALUE 'REOPENED';
ALTER TYPE "CurrentStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "itPriority" "ItPriority" NOT NULL DEFAULT 'MEDIUM';
