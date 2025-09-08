import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface AuthenticatedUser {
  adminId?: string;
  staffId?: string;
}

@Injectable()
export class BranchGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user = request.user;

    if (!user) {
      return false;
    }

    // Master admin has access to everything
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if ('adminId' in user && user.adminId === 'MASTER') {
      return true;
    }

    // For non-master users, we'll check branch access in the controller
    // This guard just ensures user is authenticated
    return true;
  }
}
