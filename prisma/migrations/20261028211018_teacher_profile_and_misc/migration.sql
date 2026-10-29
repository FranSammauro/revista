-- AlterTable
ALTER TABLE "teacher_identities" ADD COLUMN     "avatarRemovedAt" TIMESTAMP(3),
ADD COLUMN     "avatarRemovedBy" TEXT,
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "instagramHandle" TEXT,
ADD COLUMN     "lastSeenAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lastSeenAt" TIMESTAMP(3);
