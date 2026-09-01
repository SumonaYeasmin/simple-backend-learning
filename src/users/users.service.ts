

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


    async getUser() {
    const page = 2;
    const limit = 10;
    const search = 'sum';

    const users = await prisma.user.findMany({
      // 🔍 Search + Filter
      where: {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],

       
      },

      // 🔃 Sort
      orderBy: {
        name: 'asc',
      },

      // 📄 Pagination
      skip: (page - 1) * limit,
      take: limit,
    });

    return users;
  }
}

