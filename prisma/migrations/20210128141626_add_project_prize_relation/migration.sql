/*
  Warnings:

  - You are about to drop the column `numOfTickets` on the `Ticket` table. All the data in the column will be lost.
  - The migration will add a unique constraint covering the columns `[slug]` on the table `Project`. If there are existing duplicate values, the migration will fail.
  - Added the required column `projectId` to the `Prize` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `ticketId` on the `Ticket` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Prize" ADD COLUMN     "projectId" INTEGER NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "slug" TEXT NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "numOfTickets",
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "ticketId",
ADD COLUMN     "ticketId" INTEGER NOT NULL,
ALTER COLUMN "prizeId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Project.slug_unique" ON "Project"("slug");

-- AddForeignKey
ALTER TABLE "Prize" ADD FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterIndex
ALTER INDEX "Ticket_prizeId_unique" RENAME TO "Ticket.prizeId_unique";
