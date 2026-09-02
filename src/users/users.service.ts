

import { Injectable } from '@nestjs/common';
import { prisma } from '../lib/prisma.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';


interface PaginationParams {
    page: number;
    limit: number;
}


@Injectable()
export class UsersService {

    async createUser(data: CreateUserDto) {
        return await prisma.user.create({
            data
        });
    }

    // async getUsers() {
    //     return await prisma.user.findMany({
    //         select: {
    //             id: true,
    //             name: true,

    //         },
    //     });
    // }

    async updateUser(id: number, data: UpdateUserDto) {
        return await prisma.user.update({
            where: { id },
            data,
        });
    }

    async deleteUser(id: number) { return await prisma.user.delete({ where: { id }, }); }

    async getUsers({ page = 1, limit = 10 }: PaginationParams) {
        // ১. skip হিসাব করা
        const skip = (page - 1) * limit;
        // ২. প্যারালালে ডাটা এবং মোট সংখ্যা আনা (Fast Performance)
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                skip: skip,
                take: limit,
                orderBy: {
                    id: 'desc', // নতুন ডাটা আগে দেখানোর জন্য
                },
            }),
            prisma.user.count(), // মোট কতটি ইউজার আছে
        ]);
        // ৩. মোট কয়টি পেজ হবে তা হিসাব করা
        const totalPages = Math.ceil(total / limit);
        // ৪. স্ট্যান্ডার্ড রেসপন্স রিটার্ন
        return {
            meta: {
                page,
                limit,
                total,
                totalPages,
            },
            data: users,
        };
    }

}

