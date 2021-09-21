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
import { Subject } from '@models/subject'
import { Room } from '@models/room'
import { Time } from '@models/time'
import { TeacherWorkload } from '@models/teacherWorkload'

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

export enum Degree {
  Bachelor = 'BACHELOR',
  BachelorCon = 'BACHELOR_CONTINUE',
  BachelorInter = 'BACHELOR_INTER',
  Pundit = 'PUNDIT',
  PunditInter = 'PUNDIT_INTER',
}

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

  @Column()
  isCompensated: boolean

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

  public getTeacherList() {
    return this.teacherWorkloadList.map(
      (teacherWorkload) => teacherWorkload.teacher
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
}
