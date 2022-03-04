import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm'
import { nanoid } from 'nanoid'

@Entity()
export class Account extends BaseEntity {
  @PrimaryColumn()
  email: string

  @Column({ unique: true })
  refreshToken: string

  @Column({ unique: true })
  deviceId: string

  // ===============
  // Static function
  // ===============

  static async generateUniqueId(): Promise<string> {
    const id = nanoid(10)
    const isExist = await this.findOne({ where: { deviceId: id } })
    if (isExist) {
      return this.generateUniqueId()
    }
    return id
  }
}
