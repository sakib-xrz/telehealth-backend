-- AlterTable
ALTER TABLE "admins" ALTER COLUMN "profilePhoto" SET DEFAULT 'https://res.cloudinary.com/dwcb6qft9/image/upload/v1729165467/user/default/default_user.png';

-- AlterTable
ALTER TABLE "doctors" ALTER COLUMN "profilePhoto" SET DEFAULT 'https://res.cloudinary.com/dwcb6qft9/image/upload/v1729165467/user/default/default_user.png';

-- AlterTable
ALTER TABLE "patients" ALTER COLUMN "profilePhoto" SET DEFAULT 'https://res.cloudinary.com/dwcb6qft9/image/upload/v1729165467/user/default/default_user.png';

-- AlterTable
ALTER TABLE "specialties" ALTER COLUMN "icon" SET DEFAULT 'https://res.cloudinary.com/dwcb6qft9/image/upload/v1729165892/empty/no-image_ixbgot.jpg';
