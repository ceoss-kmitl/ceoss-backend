import { nanoid } from 'nanoid'
import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm'
import { Workload } from '@models/workload'
import { Room } from '@models/room'
import { Time } from '@models/time'

@Entity()
export class Compensated extends BaseEntity {
  @PrimaryColumn()
  id: string

  @ManyToOne(() => Workload, (workload) => workload.compensatedList)
  workload: Workload

  @Column('timestamptz')
  originalDate: Date

  @Column('timestamptz')
  compensatedDate: Date

  @ManyToOne(() => Room, (room) => room.compensatedList)
  compensatedRoom: Room

  @OneToMany(() => Time, (time) => time.compensatedOriginal, {
    cascade: true,
  })
  originalTimeList: Time[]

  @OneToMany(() => Time, (time) => time.compensated, {
    cascade: true,
  })
  compensatedTimeList: Time[]

  @BeforeInsert()
  private beforeInsert() {
    this.id = nanoid(10)
  }
}
