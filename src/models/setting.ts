import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class Setting extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column({ default: '' })
  deanName: string

  @Column({ default: '' })
  viceDeanName: string

  @Column({ default: '' })
  headName: string

  @Column({ default: '' })
  directorSIIEName: string

  @Column({ default: 0 })
  lecturePayRateNormal: number

  @Column({ default: 0 })
  labPayRateNormal: number

  @Column({ default: 0 })
  lecturePayRateInter: number

  @Column({ default: 0 })
  labPayRateInter: number

  @Column({ default: 0 })
  lecturePayRateExternal: number

  @Column({ default: 0 })
  labPayRateExternal: number

  @Column({ default: 0 })
  assistantPayRate: number

  @Column({ default: 0 })
  assistantPayRateInter: number

  @Column({ default: 0 })
  normalClaimLimit: number

  @Column({ default: 0 })
  interClaimLimit: number

  /**
   * @deprecated For WebScrapV1 only
   */
  @Column()
  webScrapUrl: string

  @Column({ type: 'timestamptz' })
  webScrapUpdatedDate: Date

  private static async createDefault() {
    const setting = new Setting()
    setting.id = 'CE'
    setting.webScrapUrl =
      'http://www.reg.kmitl.ac.th/teachtable_v20/teachtable_show.php?midterm=0&faculty_id=01&dept_id=05&curr_id=19&curr2_id=06&year=0&semester=0'
    setting.webScrapUpdatedDate = new Date()

    return await setting.save()
  }

  static async get() {
    return (
      (await this.findOne({ where: { id: 'CE' } })) ||
      (await this.createDefault())
    )
  }
}
