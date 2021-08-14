import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm'
import { nanoid } from 'nanoid'

@Entity()
export class Subject extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column()
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

  @BeforeInsert()
  private beforeInsert() {
    this.id = nanoid(10)
  }
}
