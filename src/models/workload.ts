import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'
import { nanoid } from 'nanoid'
import { Subject } from '@models/subject'
import { Room } from '@models/room'

export enum WorkloadType {
  Lecture = 'LECTURE',
  Lab = 'LAB',
}

export enum DayOfWeek {
  Monday = 1,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday,
}

@Entity()
export class Workload extends BaseEntity {
  @PrimaryColumn()
  id: string

  @ManyToOne(() => Subject, (subject) => subject.workloadList)
  subject: Subject

  @Column()
  section: number

  @Column({ type: 'enum', enum: WorkloadType })
  type: WorkloadType

  @Column({ type: 'enum', enum: DayOfWeek, name: 'day_of_week' })
  dayOfWeek: DayOfWeek

  /**
   * slot1 - slot 52
   * 08:00 - 20:00
   * each slot = 15 mins
   */
  @Column({ name: 'start_time_slot' })
  startTimeSlot: number

  @Column({ name: 'end_time_slot' })
  endTimeSlot: number

  @ManyToOne(() => Room, (room) => room.workloadList)
  room: Room

  @Column({ name: 'is_compensated' })
  isCompensated: boolean

  @Column({ name: 'academic_year' })
  academicYear: number

  @Column()
  semester: number

  @BeforeInsert()
  private beforeInsert() {
    this.id = nanoid(10)
  }
}
