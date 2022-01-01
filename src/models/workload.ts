import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm'
import { nanoid } from 'nanoid'

import { DayOfWeek, Degree, WorkloadType } from '@constants/common'

import { Subject } from './subject'
import { Room } from './room'
import { Time } from './time'
import { TeacherWorkload } from './teacherWorkload'

@Entity()
export class Workload extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column({ type: 'enum', enum: WorkloadType })
  type: WorkloadType

  @Column({ type: 'enum', enum: DayOfWeek })
  dayOfWeek: DayOfWeek

  @Column({ type: 'enum', enum: Degree })
  degree: Degree

  @Column({ type: 'timestamptz', nullable: true })
  compensationFromDate: Date

  @Column({ type: 'timestamptz', nullable: true })
  compensationDate: Date

  @Column()
  academicYear: number

  @Column()
  semester: number

  @Column()
  section: number

  @Column()
  fieldOfStudy: string

  @Column()
  classYear: number

  @OneToMany(() => Time, (time) => time.workload, {
    cascade: true,
  })
  timeList: Time[]

  @ManyToOne(() => Room, (room) => room.workloadList, {
    onDelete: 'CASCADE',
  })
  room?: Room

  @ManyToOne(() => Subject, (subject) => subject.workloadList, {
    onDelete: 'CASCADE',
  })
  subject: Subject

  @OneToMany(() => TeacherWorkload, (tw) => tw.workload, {
    onDelete: 'CASCADE',
  })
  teacherWorkloadList: TeacherWorkload[]

  @ManyToOne(() => Workload, (workload) => workload.compensationList)
  compensationFrom: Workload

  @OneToMany(() => Workload, (workload) => workload.compensationFrom)
  compensationList: Workload[]

  // ==============
  // Hooks function
  // ==============

  @BeforeInsert()
  private beforeInsert() {
    this.id = nanoid(10)
  }

  // ===============
  // Public function
  // ===============

  /** Required relation with `Time` */
  public getFirstTimeSlot() {
    const sortedTimeList = [...this.timeList].sort(
      (a, b) => a.startSlot - b.startSlot
    )
    return sortedTimeList[0].startSlot
  }

  /** Required relation with `Time` */
  public getLastTimeSlot() {
    const sortedTimeList = [...this.timeList].sort(
      (b, a) => a.startSlot - b.startSlot
    )
    return sortedTimeList[0].endSlot
  }

  /** Required relation with `Time` */
  public getTimeStringList() {
    return this.timeList.map((time) => ({
      start: Time.toTimeString(time.startSlot),
      end: Time.toTimeString(time.endSlot + 1),
    }))
  }

  /** Required relation with `TeacherWorkload` */
  public getTeacherList() {
    return this.teacherWorkloadList.map(
      (teacherWorkload) => teacherWorkload.teacher
    )
  }

  /** Required relation with `TeacherWorkload` */
  public getTeacherWorkload(teacherId: string) {
    return this.teacherWorkloadList.find(
      (teacherWorkload) =>
        teacherWorkload.teacher.id === teacherId &&
        teacherWorkload.workload.id == this.id
    )
  }

  public getWeekCount(teacherId: string) {
    const teacherWorkload = this.teacherWorkloadList.find(
      (teacherWorkload) =>
        teacherWorkload.teacher.id === teacherId &&
        teacherWorkload.workload.id == this.id
    )
    if (!teacherWorkload) return -1
    return teacherWorkload.weekCount
  }

  public getIsClaim(teacherId: string) {
    const teacherWorkload = this.teacherWorkloadList.find(
      (teacherWorkload) =>
        teacherWorkload.teacher.id === teacherId &&
        teacherWorkload.workload.id == this.id
    )
    if (!teacherWorkload) return false
    return teacherWorkload.isClaim
  }
}
