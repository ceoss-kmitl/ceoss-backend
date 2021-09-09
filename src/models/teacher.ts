import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  FindOneOptions,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
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

  @Column({ default: '' })
  executiveRole: string

  @Column({ default: true })
  isActive: boolean

  @ManyToMany(() => Workload, { cascade: true })
  @JoinTable({ name: 'teacher_workload' })
  workloadList: Workload[]

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
}
