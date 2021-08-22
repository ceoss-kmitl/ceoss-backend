import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class Setting extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column()
  deanName: string

  @Column()
  headName: string

  @Column()
  lecturePayRate: number

  @Column()
  labPayRate: number

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
    setting.headName = ''
    setting.lecturePayRate = 0
    setting.labPayRate = 0
    setting.normalClaimLimit = 0
    setting.interClaimLimit = 0
    setting.webScrapUrl =
      'http://www.reg.kmitl.ac.th/teachtable_v20/teachtable_show.php?midterm=0&faculty_id=01&dept_id=05&curr_id=19&curr2_id=06&year=2563&semester=1'
    setting.webScrapUpdatedDate = new Date()

    await setting.save()
    return setting
  }

  static async get() {
    return (await this.findOne('CE')) || (await this.createDefault())
  }
}
