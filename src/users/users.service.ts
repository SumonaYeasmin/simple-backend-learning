

import { Injectable } from '@nestjs/common';
import { prisma } from '../lib/prisma.js';


@Injectable()
export class UsersService {

    async createUser(data: { name: string; email: string }) {
        return await prisma.user.create({
            data
        });
    }

    async getUsers() {
        return await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                
            },
        });
    }

    async updateUser(id: number, data: { name: string; email: string }) {
        return await prisma.user.update({
            where: { id },
            data,
        });
    }

    async deleteUser(id: number) { return await prisma.user.delete({ where: { id }, }); }


}