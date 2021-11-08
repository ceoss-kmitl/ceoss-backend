import { nanoid } from 'nanoid'
import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm'
import { Workload } from '@models/workload'

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

  @BeforeInsert()
  private beforeInsert() {
    this.id = nanoid(10)
  }
}
