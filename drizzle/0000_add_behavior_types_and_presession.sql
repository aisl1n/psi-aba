-- Create enum type for behavior types
CREATE TYPE "public"."behavior_type" AS ENUM('adaptive', 'maladaptive');

-- Add behavior_type column to behaviors table
ALTER TABLE "behaviors" ADD COLUMN "behavior_type" "behavior_type" DEFAULT 'maladaptive' NOT NULL;

-- Add pre-session fields to sessions table
ALTER TABLE "sessions" ADD COLUMN "sleep_hours" integer;
ALTER TABLE "sessions" ADD COLUMN "has_eaten" boolean;
ALTER TABLE "sessions" ADD COLUMN "has_taken_medication" boolean;
ALTER TABLE "sessions" ADD COLUMN "companion" varchar(50);
ALTER TABLE "sessions" ADD COLUMN "companion_other" varchar(255);
