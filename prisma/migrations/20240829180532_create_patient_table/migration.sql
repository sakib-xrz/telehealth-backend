-- AlterTable
ALTER TABLE "doctors" ALTER COLUMN "address" SET DEFAULT '',
ALTER COLUMN "currentWorkingPlace" SET DEFAULT '',
ALTER COLUMN "designation" SET DEFAULT '';

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profilePhoto" TEXT DEFAULT 'https://res.cloudinary.com/dwcb6qft9/image/upload/v1724704575/user/default/default_user_zl3dmh.jpg',
    "contactNumber" TEXT NOT NULL,
    "address" TEXT DEFAULT '',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patients_email_key" ON "patients"("email");

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;
