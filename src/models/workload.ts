import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm'
import { isNil } from 'lodash'
import { nanoid } from 'nanoid'

import { DayOfWeek, Degree, WorkloadType } from '@constants/common'
import { RelationError } from '@errors/relationError'

import { Subject } from './subject'
import { Room } from './room'
import { Time } from './time'
import { TeacherWorkload } from './teacherWorkload'
import { Compensated } from './compensated'

@Entity()
export class Workload extends BaseEntity {
  @PrimaryColumn()
  id: string

  @ManyToOne(() => Subject, (subject) => subject.workloadList, {
    onDelete: 'CASCADE',
  })
  subject: Subject

  @OneToMany(
    () => TeacherWorkload,
    (teacherWorkload) => teacherWorkload.workload
  )
  teacherWorkloadList: TeacherWorkload[]

  @Column()
  section: number

  @Column({ type: 'enum', enum: WorkloadType })
  type: WorkloadType

  @Column({ type: 'enum', enum: DayOfWeek })
  dayOfWeek: DayOfWeek

  @OneToMany(() => Time, (time) => time.workload, {
    cascade: true,
  })
  timeList: Time[]

  @ManyToOne(() => Room, (room) => room.workloadList, { onDelete: 'CASCADE' })
  room: Room

  @OneToMany(() => Compensated, (compensated) => compensated.workload)
  compensatedList: Compensated[]

  @Column()
  academicYear: number

  @Column()
  semester: number

  @Column({ type: 'enum', enum: Degree })
  degree: Degree

  @Column()
  fieldOfStudy: string

  @Column()
  classYear: number

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
    if (isNil(this.timeList)) throw new RelationError('Time')

    const sortedTimeList = [...this.timeList].sort(
      (a, b) => a.startSlot - b.startSlot
    )
    return sortedTimeList[0].startSlot
  }

  /** Required relation with `Time` */
  public getLastTimeSlot() {
    if (isNil(this.timeList)) throw new RelationError('Time')

    const sortedTimeList = [...this.timeList].sort(
      (b, a) => a.startSlot - b.startSlot
    )
    return sortedTimeList[0].endSlot
  }

  /** Required relation with `Time` */
  public getTimeStringList() {
    if (isNil(this.timeList)) throw new RelationError('Time')

    return this.timeList.map((time) => ({
      start: Time.toTimeString(time.startSlot),
      end: Time.toTimeString(time.endSlot + 1),
    }))
  }

  /** Required relation with `TeacherWorkload` */
  public getTeacherList() {
    if (isNil(this.teacherWorkloadList))
      throw new RelationError('TeacherWorkload')

    return this.teacherWorkloadList.map(
      (teacherWorkload) => teacherWorkload.teacher
    )
  }

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
