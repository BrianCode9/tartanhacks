/*
  Warnings:

  - You are about to drop the `planned_events` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "planned_events" DROP CONSTRAINT "planned_events_user_id_fkey";

-- DropTable
DROP TABLE "planned_events";
