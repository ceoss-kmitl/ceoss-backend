import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'
import { nanoid } from 'nanoid'

@Entity()
export class Account extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column({ unique: true })
  username: string

  @Column()
  password: string

  @Column()
  isAdmin: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date

  @BeforeInsert()
  private beforeInsert() {
    this.id = nanoid(10)
  }

  static findOneByUsername(username: string) {
    return this.findOne({ where: { username } })
  }
}
