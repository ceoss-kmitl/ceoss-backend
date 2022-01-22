import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm'

import { AssistantWorkload } from './assistantWorkload'

@Entity()
export class Assistant extends BaseEntity {
  @PrimaryColumn()
  id: string // Ex. 61010479

  @Column({ unique: true })
  name: string

  @OneToMany(
    () => AssistantWorkload,
    (assistantWorkload) => assistantWorkload.assistant
  )
  assistantWorkloadList: AssistantWorkload[]
}
