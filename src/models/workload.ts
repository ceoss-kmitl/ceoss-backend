import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm'
import { nanoid } from 'nanoid'
import { Subject } from '@models/subject'
import { Room } from '@models/room'
import { Time } from '@models/time'

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

  @ManyToOne(() => Subject, (subject) => subject.workloadList, {
    cascade: true,
  })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject

  @Column()
  section: number

  @Column({ type: 'enum', enum: WorkloadType })
  type: WorkloadType

  @Column({ type: 'enum', enum: DayOfWeek, name: 'day_of_week' })
  dayOfWeek: DayOfWeek

  @OneToMany(() => Time, (time) => time.workload, { cascade: true })
  timeList: Time[]

  @ManyToOne(() => Room, (room) => room.workloadList)
  @JoinColumn({ name: 'room_id' })
  room: Room

  @Column({ name: 'is_compensated' })
  isCompensated: boolean

  @Column({ name: 'academic_year' })
  academicYear: number

  @Column()
  semester: number

  @Column()
  fieldOfStudy: string

  @Column({ name: 'class_year' })
  classYear: number

  @BeforeInsert()
  private beforeInsert() {
    this.id = nanoid(10)
  }

  public getFirstTimeSlot() {
    const sortedTimeList = [...this.timeList].sort(
      (a, b) => a.startSlot - b.startSlot
    )
    return sortedTimeList[0].startSlot
  }

  public getLastTimeSlot() {
    const sortedTimeList = [...this.timeList].sort(
      (b, a) => a.startSlot - b.startSlot
    )
    return sortedTimeList[0].endSlot
  }
}
