import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date

  @BeforeInsert()
  private beforeInsert() {
    this.id = nanoid(10)
  }
}