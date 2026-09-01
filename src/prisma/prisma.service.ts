

import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { prisma } from '../lib/prisma.js';


@Injectable()
export class PrismaService implements OnModuleDestroy {
  async onModuleDestroy() {
    await prisma.$disconnect();
  }
}