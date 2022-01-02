import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm'
import { nanoid } from 'nanoid'

import { IAcademicTime } from '@controllers/types/common'

import { TeacherWorkload } from './teacherWorkload'
import { Workload } from './workload'

@Entity()
export class Teacher extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column({ unique: true })
  name: string

  @Column()
  title: string

  @Column()
  executiveRole: string

  @Column()
  isActive: boolean

  @Column()
  isExternal: boolean

  @OneToMany(
    () => TeacherWorkload,
    (teacherWorkload) => teacherWorkload.teacher,
    { cascade: true }
  )
  teacherWorkloadList: TeacherWorkload[]

  // ==============
  // Hooks function
  // ==============

  @BeforeInsert()
  private beforeInsert() {
    this.id = nanoid(10)
  }

  // ===============
  // Static function
  // ===============

  static async findOneByIdAndJoinWorkload(
    id: string,
    {
      academicYear,
      semester,
      compensation,
    }: IAcademicTime & { compensation?: boolean }
  ) {
    const teacher = await this.findOne({
      relations: [
        'teacherWorkloadList',
        'teacherWorkloadList.teacher',
        'teacherWorkloadList.workload',
        'teacherWorkloadList.workload.compensationFrom',
        'teacherWorkloadList.workload.room',
        'teacherWorkloadList.workload.subject',
        'teacherWorkloadList.workload.timeList',
        'teacherWorkloadList.workload.teacherWorkloadList',
        'teacherWorkloadList.workload.teacherWorkloadList.teacher',
      ],
      where: { id },
    })

    if (teacher) {
      teacher.teacherWorkloadList = teacher.teacherWorkloadList.filter(
        (tw) =>
          tw.workload?.academicYear === academicYear &&
          tw.workload?.semester === semester
      )
      if (compensation !== undefined) {
        teacher.teacherWorkloadList = compensation
          ? teacher.teacherWorkloadList.filter(
              (tw) => tw.workload.compensationFrom
            )
          : teacher.teacherWorkloadList.filter(
              (tw) => !tw.workload.compensationFrom
            )
      }
    }
    return teacher
  }

  static async findManyAndJoinWorkload({
    academicYear,
    semester,
    compensation,
    isClaim,
    isActive,
    isExternal,
  }: IAcademicTime & {
    compensation?: boolean
    isClaim?: boolean
    isActive?: boolean
    isExternal?: boolean
  }) {
    const teacherList = await this.find({
      relations: [
        'teacherWorkloadList',
        'teacherWorkloadList.teacher',
        'teacherWorkloadList.workload',
        'teacherWorkloadList.workload.compensationFrom',
        'teacherWorkloadList.workload.room',
        'teacherWorkloadList.workload.subject',
        'teacherWorkloadList.workload.timeList',
        'teacherWorkloadList.workload.teacherWorkloadList',
        'teacherWorkloadList.workload.teacherWorkloadList.workload',
        'teacherWorkloadList.workload.teacherWorkloadList.teacher',
      ],
      where: {
        isActive,
        isExternal,
      },
    })

    teacherList.forEach((teacher) => {
      teacher.teacherWorkloadList = teacher.teacherWorkloadList.filter(
        (tw) =>
          tw.workload?.academicYear === academicYear &&
          tw.workload?.semester === semester
      )
      if (isClaim !== undefined) {
        teacher.teacherWorkloadList = teacher.teacherWorkloadList.filter(
          (tw) => tw.isClaim === isClaim
        )
      }
      if (compensation !== undefined) {
        teacher.teacherWorkloadList = compensation
          ? teacher.teacherWorkloadList.filter(
              (tw) => tw.workload.compensationFrom
            )
          : teacher.teacherWorkloadList.filter(
              (tw) => !tw.workload.compensationFrom
            )
      }
    })

    return teacherList
  }

  // ===============
  // Public function
  // ===============

  public getFullName() {
    return `${this.title}${this.name}`
  }

  /** Required relation with `TeacherWorkload` */
  public getWorkloadList() {
    return this.teacherWorkloadList.map((tw) => tw.workload)
  }

  public filterTeacherWorkloadList(
    options: Partial<Workload>
  ): TeacherWorkload[] {
    return this.teacherWorkloadList.filter((teacherWorkload: any) =>
      Object.entries(options).every(
        ([key, value]) => teacherWorkload.workload[key] === value
      )
    )
  }

  public getWeekCount(workloadId: string) {
    const teacherWorkload = this.teacherWorkloadList.find(
      (teacherWorkload) =>
        teacherWorkload.teacher.id === this.id &&
        teacherWorkload.workload.id == workloadId
    )
    if (!teacherWorkload) return -1
    return teacherWorkload.weekCount
  }

  public getIsClaim(workloadId: string) {
    const teacherWorkload = this.teacherWorkloadList.find(
      (teacherWorkload) =>
        teacherWorkload.teacher.id === this.id &&
        teacherWorkload.workload.id == workloadId
    )
    if (!teacherWorkload) return false
    return teacherWorkload.isClaim
  }
}
