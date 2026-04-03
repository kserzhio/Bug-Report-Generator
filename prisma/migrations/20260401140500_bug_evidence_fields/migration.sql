-- AlterTable
ALTER TABLE "GeneratedBug"
ADD COLUMN "reproductionSteps" TEXT,
ADD COLUMN "browserInfo" TEXT,
ADD COLUMN "operatingSystem" TEXT,
ADD COLUMN "deviceInfo" TEXT,
ADD COLUMN "assistiveTechnology" TEXT,
ADD COLUMN "videoUrl" TEXT,
ADD COLUMN "screenshotUrls" TEXT;

-- AlterTable
ALTER TABLE "ReusableBug"
ADD COLUMN "reproductionSteps" TEXT,
ADD COLUMN "browserInfo" TEXT,
ADD COLUMN "operatingSystem" TEXT,
ADD COLUMN "deviceInfo" TEXT,
ADD COLUMN "assistiveTechnology" TEXT,
ADD COLUMN "videoUrl" TEXT,
ADD COLUMN "screenshotUrls" TEXT;