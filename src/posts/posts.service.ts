import { Injectable } from '@nestjs/common';
import { prisma } from '../lib/prisma.js';

@Injectable()
export class PostsService {
  async createPost() {
    return await prisma.post.create({
      data: {
        title: 'My First Post',
        content: 'Learning Prisma Relations',
        userId: 1,
      },
    });
  }

  async getUserWithPosts(userId: number) {
    return prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        posts: true,
      },
    });
  }

  async createPostWithConnect() {
  return prisma.post.create({
    data: {
      title: 'Second Post',
      content: 'Learning Prisma connect',
      user: {
        connect: {
          id: 1,
        },
      },
    },
  });
}

async createUserWithPost() {
  return prisma.user.create({
    data: {
      name: 'Rahim',
      email: 'rahim@gmail.com',
       password: 'mypassword123',

      posts: {
        create: {
          title: 'My Nested Post',
          content: 'Learning Nested Create',
        },
      },
    },
    include: {
      posts: true,
    },
  });
}


}


