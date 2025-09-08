import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface AuthenticatedUser {
  adminId?: string;
  staffId?: string;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    // Check for MasterOnly decorator
    const masterOnly = this.reflector.getAllAndOverride<boolean>('masterOnly', [
      context.getHandler(),
      context.getClass(),
    ]);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (masterOnly && user.adminId !== 'MASTER') {
      return false;
    }

    // Check for AdminOnly decorator
    const adminOnly = this.reflector.getAllAndOverride<boolean>('adminOnly', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (adminOnly && !('adminId' in user)) {
      return false;
    }

    // Check for StaffOnly decorator
    const staffOnly = this.reflector.getAllAndOverride<boolean>('staffOnly', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (staffOnly && !('staffId' in user)) {
      return false;
    }

    return true;
  }
}
