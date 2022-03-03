import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class Account extends BaseEntity {
  @PrimaryColumn({ unique: true })
  email: string

  @Column()
  refreshToken: string

  @Column()
  accessToken: string
}
