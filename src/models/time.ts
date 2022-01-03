import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm'
import { nanoid } from 'nanoid'

import { Workload } from './workload'

/**
 * slot1 - slot 52
 * 08:00 - 20:00
 * each slot = 15 mins
 */
@Entity()
export class Time extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column()
  startSlot: number

  @Column()
  endSlot: number

  @ManyToOne(() => Workload, (workload) => workload.timeList, {
    onDelete: 'CASCADE',
  })
  workload: Workload

  // ==============
  // Hooks function
  // ==============

  @BeforeInsert()
  private beforeInsert() {
    this.id = nanoid(10)
  }

  // ===============
  // Static function
  // ===============

  /**
   * @example
   * Time.toTimeString(1) => '08:00'
   * Time.toTimeString(1, '.') => '08.00'
   */
  static toTimeString(timeSlot: number, seperator = ':') {
    const START_HOURS = 8
    let minutes = (timeSlot - 1) * 15
    let hours = 0
    while (minutes >= 60) {
      hours += 1
      minutes -= 60
    }
    const hr = `${String(hours + START_HOURS).padStart(2, '0')}`
    const min = `${String(minutes).padStart(2, '0')}`
    return `${hr}${seperator}${min}`
  }

  /**
   * @example
   * Time.fromTimeString('08:00') => 1
   * Time.fromTimeString('08.00', '.') => 1
   */
  static fromTimeString(timeString: string, seperator = ':') {
    const [hr, min] = timeString.split(seperator).map((each) => Number(each))
    const START_HOURS = 8
    const totalMinute = (hr - START_HOURS) * 60 + min
    const slot = Math.floor(totalMinute / 15) + 1
    return slot
  }

  static createFromTimeString(startTime: string, endTime: string) {
    return Time.create({
      startSlot: Time.fromTimeString(startTime),
      endSlot: Time.fromTimeString(endTime) - 1,
    })
  }
}
