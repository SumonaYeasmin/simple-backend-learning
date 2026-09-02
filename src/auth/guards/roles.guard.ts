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
