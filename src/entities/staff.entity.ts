import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('staff')
export class Staff {
  @PrimaryColumn()
  staffId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  branch: string;

  @Column()
  password: string;
}
