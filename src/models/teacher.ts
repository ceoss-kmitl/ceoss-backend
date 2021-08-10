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

  @Column()
  name: string

  @Column()
  title: string

  @Column({ name: 'is_executive' })
  isExecutive: boolean

  @ManyToMany(() => Workload, { cascade: true })
  @JoinTable({ name: 'teacher_workload' })
  workloadList: Workload[]

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

  static findByName(name: string, options: FindOneOptions<Teacher> = {}) {
    return this.findOne({ where: { name }, ...options })
  }
}
