const prisma = require('../src/shared/prisma');
const { UserRole } = require('@prisma/client');
const bcrypt = require('bcrypt');

const seedSuperAdmin = async () => {
    try {
        const isExistSuperAdmin = await prisma.user.findFirst({
            where: {
                role: UserRole.SUPER_ADMIN
            }
        });

        if (isExistSuperAdmin) {
            console.log('Super admin already exists!');
            return;
        }

        const hashedPassword = await bcrypt.hash('superadmin', 12);

        const superAdminData = await prisma.user.create({
            data: {
                email: 'super@admin.com',
                password: hashedPassword,
                role: UserRole.SUPER_ADMIN,
                admin: {
                    create: {
                        name: 'Super Admin',
                        contactNumber: '01540581443'
                    }
                }
            }
        });

        console.log('Super Admin Created Successfully!', {
            email: 'super@admin.com',
            password: 'superadmin'
        });
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
};

seedSuperAdmin();
