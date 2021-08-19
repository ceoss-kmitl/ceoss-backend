import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  FindOneOptions,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'
import { nanoid } from 'nanoid'
import { Workload } from '@models/workload'

@Entity()
export class Teacher extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column({ unique: true })
  name: string

  @Column()
  title: string

  @Column({ name: 'is_executive' })
  isExecutive: boolean

  @Column({ default: true, name: 'is_active' })
  isActive: boolean

  @ManyToMany(() => Workload, { cascade: true })
  @JoinTable({
    name: 'teacher_workload',
    joinColumn: { name: 'teacher_id' },
    inverseJoinColumn: { name: 'workload_id' },
  })
  workloadList: Workload[]

  @BeforeInsert()
  private beforeInsert() {
    this.id = nanoid(10)
  }

  static findByName(name: string, options: FindOneOptions<Teacher> = {}) {
    return this.findOne({ where: { name }, ...options })
  }
}
