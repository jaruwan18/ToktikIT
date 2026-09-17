/*
  Repair missing authentication database objects.

  This migration is intentionally non-destructive:
  - It does not drop tables.
  - It does not delete existing data.
  - It adds only missing authentication structures.
*/

-- Create Role enum only when it does not already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'Role'
    ) THEN
        CREATE TYPE "Role" AS ENUM (
            'REQUESTER',
            'IT_STAFF',
            'ADMIN'
        );
    END IF;
END
$$;

-- Create TicketMessageType enum only when it does not already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'TicketMessageType'
    ) THEN
        CREATE TYPE "TicketMessageType" AS ENUM (
            'COMMENT',
            'INTERNAL_NOTE'
        );
    END IF;
END
$$;

-- Add missing CurrentStatus values safely
ALTER TYPE "CurrentStatus"
ADD VALUE IF NOT EXISTS 'IN_PROGRESS';

ALTER TYPE "CurrentStatus"
ADD VALUE IF NOT EXISTS 'WAITING_FOR_REQUESTER';

ALTER TYPE "CurrentStatus"
ADD VALUE IF NOT EXISTS 'RESOLVED';

ALTER TYPE "CurrentStatus"
ADD VALUE IF NOT EXISTS 'CLOSED';

-- Add missing Requester.userId column
ALTER TABLE "Requester"
ADD COLUMN IF NOT EXISTS "userId" INTEGER;

-- Add missing Ticket.ownerId column
ALTER TABLE "Ticket"
ADD COLUMN IF NOT EXISTS "ownerId" INTEGER;

-- Create User table only when it does not already exist
CREATE TABLE IF NOT EXISTS "User" (
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

-- Create TicketMessage table only when it does not already exist
CREATE TABLE IF NOT EXISTS "TicketMessage" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "type" "TicketMessageType" NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketMessage_pkey" PRIMARY KEY ("id")
);

-- Create indexes only when they do not already exist
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key"
ON "User"("email");

CREATE INDEX IF NOT EXISTS "TicketMessage_ticketId_idx"
ON "TicketMessage"("ticketId");

CREATE INDEX IF NOT EXISTS "TicketMessage_authorId_idx"
ON "TicketMessage"("authorId");

CREATE UNIQUE INDEX IF NOT EXISTS "Requester_userId_key"
ON "Requester"("userId");

CREATE INDEX IF NOT EXISTS "Ticket_ownerId_idx"
ON "Ticket"("ownerId");

CREATE INDEX IF NOT EXISTS "Ticket_currentStatus_idx"
ON "Ticket"("currentStatus");

-- Add Requester.userId foreign key only when it does not already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'Requester_userId_fkey'
    ) THEN
        ALTER TABLE "Requester"
        ADD CONSTRAINT "Requester_userId_fkey"
        FOREIGN KEY ("userId")
        REFERENCES "User"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    END IF;
END
$$;

-- Add Ticket.ownerId foreign key only when it does not already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'Ticket_ownerId_fkey'
    ) THEN
        ALTER TABLE "Ticket"
        ADD CONSTRAINT "Ticket_ownerId_fkey"
        FOREIGN KEY ("ownerId")
        REFERENCES "User"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    END IF;
END
$$;

-- Add TicketMessage.ticketId foreign key only when it does not already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'TicketMessage_ticketId_fkey'
    ) THEN
        ALTER TABLE "TicketMessage"
        ADD CONSTRAINT "TicketMessage_ticketId_fkey"
        FOREIGN KEY ("ticketId")
        REFERENCES "Ticket"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;
END
$$;

-- Add TicketMessage.authorId foreign key only when it does not already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'TicketMessage_authorId_fkey'
    ) THEN
        ALTER TABLE "TicketMessage"
        ADD CONSTRAINT "TicketMessage_authorId_fkey"
        FOREIGN KEY ("authorId")
        REFERENCES "User"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;
END
$$;