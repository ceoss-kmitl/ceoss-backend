import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm'
import { nanoid } from 'nanoid'

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
  // Public function
  // ===============

  /**
   * Example result: `3(1-2-1)`
   */
  public getFullCredit() {
    return `${this.credit}(${this.lectureHours}-${this.labHours}-${this.independentHours})`
  }
}
