import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Admin, Staff } from '../entities';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private authService: AuthService) {
    super();
  }

  serializeUser(
    user: Admin | Staff,
    done: (err: any, user: { id: string; type: 'admin' | 'staff' }) => void,
  ): void {
    const userType = 'adminId' in user ? 'admin' : 'staff';
    const id = 'adminId' in user ? user.adminId : user.staffId;
    done(null, { id, type: userType });
  }

  async deserializeUser(
    payload: { id: string; type: 'admin' | 'staff' },
    done: (err: any, user: Admin | Staff | null) => void,
  ): Promise<void> {
    try {
      const user = await this.authService.findUserById(
        payload.id,
        payload.type,
      );
      if (!user) {
        return done(new Error('User not found'), null);
      }
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
}
