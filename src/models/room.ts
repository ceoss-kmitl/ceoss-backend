import { nanoid } from 'nanoid'
import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm'

import { IAcademicTime } from '@controllers/types/common'
import { Workload } from '@models/workload'

@Entity()
export class Room extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column({ unique: true })
  name: string

  @Column()
  capacity: number

  @OneToMany(() => Workload, (workload) => workload.room)
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
    { academicYear, semester }: IAcademicTime
  ) {
    const room = await this.findOne({
      relations: [
        'workloadList',
        'workloadList.subject',
        'workloadList.timeList',
        'workloadList.teacherWorkloadList',
        'workloadList.teacherWorkloadList.workload',
        'workloadList.teacherWorkloadList.teacher',
      ],
      where: { id },
    })

    if (room) {
      room.workloadList = room.workloadList.filter(
        (workload) =>
          workload.academicYear === academicYear &&
          workload.semester === semester
      )
    }
    return room
  }
}
