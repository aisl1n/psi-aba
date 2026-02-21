-- Migration: Add user_id column and create index
-- This migration adds user authentication support

-- Add user_id column to patients table
ALTER TABLE "patients" ADD COLUMN "user_id" varchar(255) NOT NULL;

-- Create index for performance on user_id lookups
CREATE INDEX "idx_patients_user_id" ON "patients" ("user_id");
