import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm'
import { nanoid } from 'nanoid'
import { Workload } from '@models/workload'

@Entity()
export class Subject extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column({ unique: true })
  code: string

  @Column()
  name: string

  @Column({ name: 'is_required' })
  isRequired: boolean

  @Column()
  credit: number

  @Column({ name: 'lecture_hours' })
  lectureHours: number

  @Column({ name: 'lab_hours' })
  labHours: number

  @Column({ name: 'independent_hours' })
  independentHours: number

  @OneToMany(() => Workload, (workload) => workload.subject)
  workloadList: Workload[]

  @BeforeInsert()
  private beforeInsert() {
    this.id = nanoid(10)
  }

  static findOneByCode(code: string) {
    return this.findOne({ where: { code } })
  }
}
