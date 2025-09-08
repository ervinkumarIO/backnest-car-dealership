export interface JwtUser {
  sub: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'MASTER';
  type: 'admin' | 'staff';
  name: string;
  branch?: string;
}

export interface AuthenticatedRequest {
  user: JwtUser;
}
