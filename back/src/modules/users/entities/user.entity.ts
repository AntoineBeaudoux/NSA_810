import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { IsString } from 'class-validator';

import { Auth } from "src/modules/auth/entities/auth.entity"

export enum UserRole {
    ADMIN = "admin",
    EMPLOYEE = "employee"
}

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar", { length: 200, unique: true })
  @IsString()
  username: string;

  @Column("varchar", { length: 200 })
  password: string

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  role: UserRole

  @OneToOne(() => Auth, auth => auth.user, { eager: true })
  @JoinColumn()
  auth: Auth;
}