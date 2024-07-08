import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';

import { User } from "src/modules/users/entities/user.entity"

@Entity()
export class Auth {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar", { length: 500 })
  jwtToken: string;

  @OneToOne(() => User, user => user.auth)
  user: User;

  @Column("boolean")
  isLogged: boolean
}