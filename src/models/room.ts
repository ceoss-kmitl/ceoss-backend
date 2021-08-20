import { nanoid } from 'nanoid'
import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm'
import { Workload } from '@models/workload'

@Entity()
export class Room extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column()
  name: string

  @Column()
  capacity: number

  @OneToMany(() => Workload, (workload) => workload.room)
  workloadList: Workload[]

  @BeforeInsert()
  private beforeInsert() {
    this.id = nanoid(10)
  }
}
