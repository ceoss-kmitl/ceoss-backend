import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm'
import { nanoid } from 'nanoid'
import { TeacherWorkload } from '@models/teacherWorkload'
import { Workload } from '@models/workload'

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
    (teacherWorkload) => teacherWorkload.teacher
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
  // Public function
  // ===============

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
