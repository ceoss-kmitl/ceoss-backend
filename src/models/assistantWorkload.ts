import { BaseEntity, Column, Entity, ManyToOne } from 'typeorm'

import { Assistant } from './assistant'
import { Workload } from './workload'

@Entity()
export class AssistantWorkload extends BaseEntity {
  @ManyToOne(() => Assistant, (assistant) => assistant.assistantWorkloadList, {
    primary: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  assistant: Assistant

  @ManyToOne(() => Workload, (workload) => workload.assistantWorkloadList, {
    primary: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  workload: Workload

  @Column({ type: 'timestamptz', array: true, default: [] })
  dayList: Date[]
}
