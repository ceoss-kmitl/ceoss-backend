import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm'
import { nanoid } from 'nanoid'

@Entity()
export class Account extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column({ unique: true })
  email: string

  @Column({ nullable: true })
  accessToken: string

  @BeforeInsert()
  private beforeInsert() {
    this.id = nanoid(10)
  }

  // ===============
  // Static function
  // ===============

  static async findOneOrCreate(payload: {
    email: string
    accessToken: string
  }) {
    const account = await this.findOne({
      where: {
        email: payload.email,
      },
    })
    if (!account) {
      const newAccount = Account.create(payload)
      return await newAccount.save()
    }

    account.accessToken = payload.accessToken
    return await account.save()
  }
}
