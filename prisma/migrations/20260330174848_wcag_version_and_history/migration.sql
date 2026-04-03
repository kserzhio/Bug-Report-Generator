-- AlterTable
ALTER TABLE "AiEnhancementCache" ADD COLUMN     "wcagVersion" TEXT NOT NULL DEFAULT '2.2';

-- AlterTable
ALTER TABLE "BugTemplate" ADD COLUMN     "wcagVersion" TEXT NOT NULL DEFAULT '2.2';

-- AlterTable
ALTER TABLE "GeneratedBug" ADD COLUMN     "wcagVersion" TEXT NOT NULL DEFAULT '2.2';

-- AlterTable
ALTER TABLE "ReusableBug" ADD COLUMN     "wcagVersion" TEXT NOT NULL DEFAULT '2.2';
