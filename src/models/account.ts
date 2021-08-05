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

  @Column({ name: 'is_admin' })
  isAdmin: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date

  @BeforeInsert()
  private beforeInsert() {
    this.id = nanoid(10)
  }

  static findOneByUsername(username: string) {
    return this.findOne({ where: { username } })
  }
}