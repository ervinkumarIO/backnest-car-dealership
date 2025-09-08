import { SetMetadata } from '@nestjs/common';

export type UserType = 'admin' | 'staff';

export const USER_TYPE_KEY = 'userType';
export const UserType = (userType: UserType) =>
  SetMetadata(USER_TYPE_KEY, userType);

// Convenience decorators for specific user types
export const MasterOnly = () => SetMetadata('masterOnly', true);
export const AdminOnly = () => SetMetadata('adminOnly', true);
export const StaffOnly = () => SetMetadata('staffOnly', true);
