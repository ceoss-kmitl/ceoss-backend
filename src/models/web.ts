import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class Web extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column()
  url: string
}
