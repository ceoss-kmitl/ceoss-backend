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

import { Workload } from './workload'

@Entity()
export class Subject extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column({ unique: true })
  code: string

  @Column()
  name: string

  @Column()
  isRequired: boolean

  @Column()
  credit: number

  @Column()
  lectureHours: number

  @Column()
  labHours: number

  @Column()
  independentHours: number

  @Column()
  curriculumCode: string

  @Column()
  isInter: boolean

  @OneToMany(() => Workload, (workload) => workload.subject)
  workloadList: Workload[]

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
      section,
      compensation,
    }: IAcademicTime & { section?: number; compensation?: boolean }
  ) {
    const subject = await this.findOne({
      relations: [
        'workloadList',
        'workloadList.room',
        'workloadList.subject',
        'workloadList.timeList',
        'workloadList.compensationList',
        'workloadList.compensationFrom',
        'workloadList.compensationFrom.room',
        'workloadList.compensationFrom.timeList',
        'workloadList.teacherWorkloadList',
        'workloadList.teacherWorkloadList.workload',
        'workloadList.teacherWorkloadList.teacher',
        'workloadList.assistantWorkloadList',
        'workloadList.assistantWorkloadList.assistant',
      ],
      where: { id },
    })

    if (subject) {
      subject.workloadList = subject.workloadList.filter(
        (workload) =>
          workload.academicYear === academicYear &&
          workload.semester === semester
      )

      if (section !== undefined) {
        subject.workloadList = subject.workloadList.filter(
          (workload) => workload.section === section
        )
        if (subject.workloadList.length === 0) {
          return undefined
        }
      }

      if (compensation !== undefined) {
        subject.workloadList = compensation
          ? subject.workloadList.filter((workload) => workload.compensationFrom)
          : subject.workloadList.filter(
              (workload) => !workload.compensationFrom
            )
      }
    }

    return subject
  }

  // ===============
  // Public function
  // ===============

  /**
   * Example result: `3(1-2-1)`
   */
  public getFullCredit() {
    return `${this.credit}(${this.lectureHours}-${this.labHours}-${this.independentHours})`
  }
}
