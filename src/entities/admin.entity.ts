import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('admins')
export class Admin {
  @PrimaryColumn()
  adminId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ unique: true })
  email: string;

  @Column()
  branch: string;

  @Column()
  password: string;
}
