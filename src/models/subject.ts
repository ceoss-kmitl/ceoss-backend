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

  @Column({ default: 'CE' })
  curriculumCode: string

  @Column({ default: false })
  isInter: boolean

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
