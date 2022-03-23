import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm'
import { nanoid } from 'nanoid'

@Entity()
export class Web extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column()
  url: string

  // ==============
  // Hooks function
  // ==============

  @BeforeInsert()
  private beforeInsert() {
    this.id = nanoid(10)
  }
}
