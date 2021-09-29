import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm'
import { nanoid } from 'nanoid'
import { Workload } from '@models/workload'

/**
 * slot1 - slot 52
 * 08:00 - 20:00
 * each slot = 15 mins
 */
@Entity()
export class Time extends BaseEntity {
  @PrimaryColumn()
  id: string

  @ManyToOne(() => Workload, (workload) => workload.timeList, {
    onDelete: 'CASCADE',
  })
  workload: Workload

  @Column()
  startSlot: number

  @Column()
  endSlot: number

  @BeforeInsert()
  private beforeInsert() {
    this.id = nanoid(10)
  }
}
