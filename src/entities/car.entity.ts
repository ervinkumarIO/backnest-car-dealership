import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cars')
export class Car {
  @PrimaryColumn()
  chassisNo: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  variant: string;

  @Column('integer')
  price: number;

  @Column('integer')
  year: number;

  @Column()
  color: string;

  @Column()
  transmission: string;

  @Column()
  fuelType: string;

  @Column('integer')
  mileage: number;

  @Column()
  grade: string;

  @Column()
  status: string;

  @Column()
  condition: string;

  @Column('jsonb')
  features: any;

  @Column('text', { nullable: true })
  remarks: string;

  @Column()
  branch: string;

  @Column({ nullable: true })
  soldBy: string;

  @Column({ nullable: true })
  soldAt: string;

  @Column('jsonb')
  image: any;

  @Column({ default: 'no' })
  public: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
