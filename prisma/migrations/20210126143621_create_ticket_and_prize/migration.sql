-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "image" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ci" INTEGER,
    "name" TEXT NOT NULL,
    "phone" INTEGER NOT NULL,
    "numOfTickets" INTEGER NOT NULL,
    "ticketId" TEXT NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT true,
    "projectId" INTEGER NOT NULL,
    "prizeId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prize" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_prizeId_unique" ON "Ticket"("prizeId");

-- AddForeignKey
ALTER TABLE "Ticket" ADD FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD FOREIGN KEY ("prizeId") REFERENCES "Prize"("id") ON DELETE CASCADE ON UPDATE CASCADE;
