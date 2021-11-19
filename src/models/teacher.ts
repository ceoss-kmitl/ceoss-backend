import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  FindOneOptions,
  OneToMany,
  PrimaryColumn,
} from 'typeorm'
import { nanoid } from 'nanoid'

import { TeacherWorkload } from 'models/teacherWorkload'
import { Workload } from 'models/workload'

@Entity()
export class Teacher extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column({ unique: true })
  name: string

  @Column()
  title: string

  @Column({ default: '' })
  executiveRole: string

  @Column({ default: true })
  isActive: boolean

  @Column({ default: false })
  isExternal: boolean

  @OneToMany(
    () => TeacherWorkload,
    (teacherWorkload) => teacherWorkload.teacher
  )
  teacherWorkloadList: TeacherWorkload[]

  @BeforeInsert()
  private beforeInsert() {
    this.id = nanoid(10)
  }

  static findByName(name: string, options: FindOneOptions<Teacher> = {}) {
    return this.findOne({ where: { name }, ...options })
  }

  public getFullName() {
    return `${this.title}${this.name}`
  }

  public getWorkloadList() {
    return this.teacherWorkloadList.map(
      (teacherWorkload) => teacherWorkload.workload
    )
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
