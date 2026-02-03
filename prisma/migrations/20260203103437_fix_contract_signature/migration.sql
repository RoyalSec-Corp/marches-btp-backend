/*
  Warnings:

  - You are about to drop the column `signer_id` on the `contract_signatures` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "contract_signatures" DROP CONSTRAINT "contract_signatures_entreprise_fkey";

-- DropForeignKey
ALTER TABLE "contract_signatures" DROP CONSTRAINT "contract_signatures_freelance_fkey";

-- DropIndex
DROP INDEX "contract_signatures_signer_id_idx";

-- AlterTable
ALTER TABLE "contract_signatures" DROP COLUMN "signer_id",
ADD COLUMN     "entreprise_id" INTEGER,
ADD COLUMN     "freelance_id" INTEGER;

-- CreateIndex
CREATE INDEX "contract_signatures_freelance_id_idx" ON "contract_signatures"("freelance_id");

-- CreateIndex
CREATE INDEX "contract_signatures_entreprise_id_idx" ON "contract_signatures"("entreprise_id");

-- AddForeignKey
ALTER TABLE "contract_signatures" ADD CONSTRAINT "contract_signatures_freelance_id_fkey" FOREIGN KEY ("freelance_id") REFERENCES "freelances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_signatures" ADD CONSTRAINT "contract_signatures_entreprise_id_fkey" FOREIGN KEY ("entreprise_id") REFERENCES "entreprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
