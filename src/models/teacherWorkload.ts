import { BaseEntity, Column, Entity, ManyToOne } from 'typeorm'
import { Teacher } from '@models/teacher'
import { Workload } from '@models/workload'

@Entity()
export class TeacherWorkload extends BaseEntity {
  @ManyToOne(() => Teacher, (teacher) => teacher.teacherWorkloadList, {
    primary: true,
    onDelete: 'CASCADE',
  })
  teacher: Teacher

  @ManyToOne(() => Workload, (workload) => workload.teacherWorkloadList, {
    primary: true,
    onDelete: 'CASCADE',
  })
  workload: Workload

  @Column({ default: 15 })
  weekCount: number
}
