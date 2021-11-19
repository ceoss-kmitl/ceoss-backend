import { nanoid } from 'nanoid'
import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm'

import { Workload } from 'models/workload'
import { Compensated } from 'models/compensated'

@Entity()
export class Room extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column({ unique: true })
  name: string

  @Column()
  capacity: number

  @OneToMany(() => Workload, (workload) => workload.room)
  workloadList: Workload[]

  @OneToMany(() => Compensated, (compensated) => compensated.compensatedRoom)
  compensatedList: Compensated[]

  @BeforeInsert()
  private beforeInsert() {
    this.id = nanoid(10)
  }
}
