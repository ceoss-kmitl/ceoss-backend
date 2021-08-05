import { nanoid } from 'nanoid'
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'

export class Room extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column()
  name: string

  @Column()
  capacity: number

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
}
