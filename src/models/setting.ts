import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class Setting extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column()
  deanName: string

  @Column()
  viceDeanName: string

  @Column()
  headName: string

  @Column()
  directorSIIEName: string

  @Column()
  lecturePayRateNormal: number

  @Column()
  labPayRateNormal: number

  @Column()
  lecturePayRateInter: number

  @Column()
  labPayRateInter: number

  @Column()
  lecturePayRateExternal: number

  @Column()
  labPayRateExternal: number

  @Column({ default: 0 })
  assistantPayRate: number

  @Column()
  normalClaimLimit: number

  @Column()
  interClaimLimit: number

  @Column()
  webScrapUrl: string

  @Column({ type: 'timestamptz' })
  webScrapUpdatedDate: Date

  private static async createDefault() {
    const setting = new Setting()
    setting.id = 'CE'
    setting.deanName = ''
    setting.viceDeanName = ''
    setting.headName = ''
    setting.directorSIIEName = ''
    setting.lecturePayRateNormal = 0
    setting.labPayRateNormal = 0
    setting.lecturePayRateInter = 0
    setting.labPayRateInter = 0
    setting.lecturePayRateExternal = 0
    setting.labPayRateExternal = 0
    setting.assistantPayRate = 0
    setting.normalClaimLimit = 0
    setting.interClaimLimit = 0
    setting.webScrapUrl =
      'http://www.reg.kmitl.ac.th/teachtable_v20/teachtable_show.php?midterm=0&faculty_id=01&dept_id=05&curr_id=19&curr2_id=06&year=0&semester=0'
    setting.webScrapUpdatedDate = new Date()

    await setting.save()
    return setting
  }

  static async get() {
    return (await this.findOne('CE')) || (await this.createDefault())
  }
}
