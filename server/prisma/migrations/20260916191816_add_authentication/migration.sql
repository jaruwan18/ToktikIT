/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Requester` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('REQUESTER', 'IT_STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "TicketMessageType" AS ENUM ('COMMENT', 'INTERNAL_NOTE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CurrentStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "CurrentStatus" ADD VALUE 'WAITING_FOR_REQUESTER';
ALTER TYPE "CurrentStatus" ADD VALUE 'RESOLVED';
ALTER TYPE "CurrentStatus" ADD VALUE 'CLOSED';

-- AlterTable
ALTER TABLE "Requester" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "ownerId" INTEGER;

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketMessage" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "type" "TicketMessageType" NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "TicketMessage_ticketId_idx" ON "TicketMessage"("ticketId");

-- CreateIndex
CREATE INDEX "TicketMessage_authorId_idx" ON "TicketMessage"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Requester_userId_key" ON "Requester"("userId");

-- CreateIndex
CREATE INDEX "Ticket_ownerId_idx" ON "Ticket"("ownerId");

-- CreateIndex
CREATE INDEX "Ticket_currentStatus_idx" ON "Ticket"("currentStatus");

-- AddForeignKey
ALTER TABLE "Requester" ADD CONSTRAINT "Requester_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
