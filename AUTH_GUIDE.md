# 🛡️ NestJS Complete Authentication & Authorization (RBAC) Master Guide

এই গাইডে রেজিস্ট্রেশন, পাসওয়ার্ড হ্যাশিং, JWT লগইন, রুট প্রটেকশন (JwtAuthGuard), এবং রোল-ভিত্তিক অথরাইজেশন (RolesGuard)-এর প্রতিটি ফাইলের সম্পূর্ণ কোড একসাথে দেওয়া হলো।

---

## ১. প্রয়োজনীয় প্যাকেজ ইনস্টল

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt
```

---

## ২. `.env` ফাইল

```env
JWT_SECRET=my-super-secret-key-12345
```

---

## ৩. `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

model User {
  id       Int     @id @default(autoincrement())
  name     String
  email    String  @unique
  password String
  role     Role    @default(USER)

  posts    Post[]
}

model Post {
  id      Int     @id @default(autoincrement())
  title   String
  content String?
  userId  Int
  user    User    @relation(fields: [userId], references: [id])
}

enum Role {
  USER
  ADMIN
}
```

---

## ৪. `src/auth/dto/register.dto.ts`

```typescript
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'নাম ফাঁকা রাখা যাবে না' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'ইমেইল ফাঁকা রাখা যাবে না' })
  @IsEmail({}, { message: 'সঠিক ইমেইল এড্রেস দিতে হবে' })
  email: string;

  @IsNotEmpty({ message: 'পাসওয়ার্ড ফাঁকা রাখা যাবে না' })
  @IsString()
  @MinLength(6, { message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' })
  password: string;
}
```

---

## ৫. `src/auth/dto/login.dto.ts`

```typescript
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'সঠিক ইমেইল এড্রেস দিতে হবে' })
  email: string;

  @IsNotEmpty({ message: 'পাসওয়ার্ড ফাঁকা রাখা যাবে না' })
  @IsString()
  password: string;
}
```

---

## ৬. `src/auth/auth.service.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '../lib/prisma.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // ১. ইউজার রেজিস্ট্রেশন (পাসওয়ার্ড হ্যাশ করে সেভ)
  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    // পাসওয়ার্ড হ্যাশ করা
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
        role: user.role,
      },
    };
  }

  // ২. ইউজার লগইন (পাসওয়ার্ড ম্যাচ ও JWT accessToken তৈরি)
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Email দিয়ে ইউজার খোঁজা
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // পাসওয়ার্ড তুলনা করা
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // JWT পে-লোড তৈরি
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
    };
  }
}
```

---

## ৭. `src/auth/strategies/jwt.strategy.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  // টোকেন আসল হলে req.user-এ এই ডাটা যুক্ত হয়
  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
```

---

## ৮. `src/auth/guards/jwt-auth.guard.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

---

## ৯. `src/auth/decorators/roles.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';
import { Role } from '../../generated/prisma/enums.js';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

---

## ১০. `src/auth/guards/roles.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // যদি রুটে কোনো নির্দিষ্ট রোল না চাওয়া হয়, তাহলে সবার জন্য উন্মুক্ত
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // ইউজারের রোল কি অনুমোদিত রোলগুলোর একটি?
    return requiredRoles.some((role) => user?.role === role);
  }
}
```

---

## ১১. `src/auth/auth.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { RolesGuard } from './guards/roles.guard.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy, RolesGuard],
  exports: [PassportModule, JwtModule, RolesGuard],
})
export class AuthModule {}
```

---

## ১২. `src/auth/auth.controller.ts`

```typescript
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { Roles } from './decorators/roles.decorator.js';
import { Role } from '../generated/prisma/enums.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ১. রেজিস্ট্রেশন (পাবলিক)
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // ২. লগইন (পাবলিক)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // ৩. প্রোটেক্টেড রুট (যেকোনো লগইন করা ইউজার ঢুকতে পারবে)
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    return {
      message: 'This is a protected route!',
      user: req.user,
    };
  }

  // ৪. অ্যাডমিন রুট (শুধুমাত্র ADMIN রোলের ইউজাররা ঢুকতে পারবে)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin')
  getAdminDashboard(@Req() req: any) {
    return {
      message: 'Welcome Admin! You have access to this VIP admin route.',
      user: req.user,
    };
  }
}
```

---

## 🧪 পোস্টম্যানে টেস্ট করার গাইড

| ফিচার | মেথড | URL | হেডার / টোকেন | রেসপন্স |
| :--- | :---: | :--- | :--- | :--- |
| **রেজিস্টার** | `POST` | `http://localhost:3000/auth/register` | Body (name, email, password) | `201 Created` |
| **লগইন** | `POST` | `http://localhost:3000/auth/login` | Body (email, password) | `accessToken` রিটার্ন |
| **প্রোফাইল (টোকেন সহ)** | `GET` | `http://localhost:3000/auth/profile` | Auth: `Bearer <token>` | `200 OK` (ইউজারের তথ্য) |
| **প্রোফাইল (টোকেন ছাড়া)**| `GET` | `http://localhost:3000/auth/profile` | কোনো টোকেন ছাড়া | `401 Unauthorized` |
| **অ্যাডমিন (USER রোল)** | `GET` | `http://localhost:3000/auth/admin` | Auth: `Bearer <token>` | `403 Forbidden` |
| **অ্যাডমিন (ADMIN রোল)** | `GET` | `http://localhost:3000/auth/admin` | Auth: `Bearer <admin_token>` | `200 OK` (অ্যাডমিন ডাটা) |
