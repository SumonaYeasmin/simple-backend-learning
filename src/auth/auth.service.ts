
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async login(loginDto: LoginDto) {
  const { email, password } = loginDto;

  // 1. Email দিয়ে user খোঁজা
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  // 2. User না পাওয়া গেলে
  if (!user) {
    throw new UnauthorizedException('Invalid email or password');
  }

  // 3. Password compare
  const isPasswordValid = await bcrypt.compare(
    password,
    user.password,
  );

  // 4. Password ভুল হলে
  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid email or password');
  }

  // 3. JWT তৈরি
  const payload = {
    sub: user.id,
    email: user.email,
  };

  const accessToken = await this.jwtService.signAsync(payload);

  // 4. Token return
  return {
    accessToken,
  };
}
}

