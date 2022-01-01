import {
  JsonController,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  QueryParams,
  Res,
} from 'routing-controllers'
import { Response } from 'express'
import { In, IsNull, Not } from 'typeorm'
import { isNil, merge, omitBy, uniq } from 'lodash'

import {
  IAssignWorkloadToRoom,
  IAutoAssignWorkloadToRoomQuery,
  ICreateRoom,
  IEditRoom,
  IGetRoomExcelQuery,
  IGetAvailableRoomCompensated,
  IGetRoomWorkloadQuery,
  IResetRoomWorkloadQuery,
} from '@controllers/types/room'
import {
  mapDateToDayOfWeek,
  mapTimeSlotToTime,
  mapTimeToTimeSlot,
} from '@libs/mapper'
import { Room } from '@models/room'
import { Workload } from '@models/workload'
import { DayOfWeek, Degree, WorkloadType } from '@constants/common'
import { Excel } from '@libs/Excel'
import { isSameDay } from '@libs/utils'
import { ROOM_TEACHER_PAIR, SUBJECT_NO_ROOM } from '@constants/room'
import { ValidateBody, ValidateQuery } from '@middlewares/validator'
import { NotFoundError } from '@errors/notFoundError'
import { BadRequestError } from '@errors/badRequestError'

import { generateRoomExcel } from './templates/roomExcel'
import { IGetTeacherWorkloadResponse } from './types/teacher'

@JsonController()
export class RoomController {
  @Get('/room/excel')
  @ValidateQuery(IGetRoomExcelQuery)
  async getRoomExcel(
    @Res() res: Response,
    @QueryParams() query: IGetRoomExcelQuery
  ) {
    const { academic_year, semester } = query

    const roomList = await Room.createQueryBuilder('room')
      .leftJoinAndSelect(
        'room.workloadList',
        'workloadList',
        'workloadList.academicYear = :academic_year AND workloadList.semester = :semester',
        { academic_year, semester }
      )
      .leftJoinAndSelect('workloadList.subject', 'subject')
      .leftJoinAndSelect('workloadList.timeList', 'timeList')
      .leftJoinAndSelect(
        'workloadList.teacherWorkloadList',
        'teacherWorkloadList'
      )
      .leftJoinAndSelect('teacherWorkloadList.teacher', 'teacher')
      .leftJoinAndSelect('teacherWorkloadList.workload', 'workload')
      .orderBy('room.name', 'ASC')
      .getMany()

    const excel = new Excel(res)
    await generateRoomExcel(excel, roomList, academic_year, semester)

    const yearAndSemester = `${String(academic_year).substr(2, 2)}-${semester}`
    const file = await excel.createFile(`${yearAndSemester} ตารางการใช้ห้อง`)
    return file
  }

  //   @Get('/room/available/compensated')
  //   @ValidateQuery(IGetAvailableRoomCompensated)
  //   async getAvailableRoomForCompensated(
  //     @QueryParams() query: IGetAvailableRoomCompensated
  //   ) {
  //     const { academic_year, semester, compensatedDate, startTime, endTime } =
  //       query

  //     const roomList = await Room.createQueryBuilder('room')
  //       .leftJoinAndSelect(
  //         'room.workloadList',
  //         'workloadList',
  //         'workloadList.academicYear = :academic_year AND workloadList.semester = :semester',
  //         { academic_year, semester }
  //       )
  //       .leftJoinAndSelect('room.compensatedList', 'compensatedList')
  //       .leftJoinAndSelect(
  //         'compensatedList.compensatedTimeList',
  //         'compensatedTimeList'
  //       )
  //       .leftJoinAndSelect('workloadList.timeList', 'timeList')
  //       .orderBy('room.name', 'ASC')
  //       .getMany()

  //     return roomList
  //       .filter((room) => {
  //         let isTimeOverlap = false
  //         for (const roomWorkload of room.workloadList) {
  //           const roomWorkloadDay = roomWorkload.dayOfWeek
  //           const roomWorkloadStart = roomWorkload.getFirstTimeSlot()
  //           const roomWorkloadEnd = roomWorkload.getLastTimeSlot()

  //           const workloadDay = mapDateToDayOfWeek(new Date(compensatedDate))
  //           const workloadStart = mapTimeToTimeSlot(startTime)
  //           const workloadEnd = mapTimeToTimeSlot(endTime) - 1

  //           if (
  //             workloadDay === roomWorkloadDay &&
  //             workloadStart <= roomWorkloadEnd &&
  //             workloadEnd >= roomWorkloadStart
  //           ) {
  //             isTimeOverlap = true
  //           }
  //         }
  //         return !isTimeOverlap
  //       })
  //       .filter((room) => {
  //         let isTimeOverlap = false
  //         for (const compensated of room.compensatedList) {
  //           const compensatedDay = new Date(compensated.compensatedDate)
  //           const compensatedStart = compensated.getFirstCompensatedTimeSlot()
  //           const compensatedEnd = compensated.getLastCompensatedTimeSlot()

  //           const workloadDay = new Date(compensatedDate)
  //           const workloadStart = mapTimeToTimeSlot(startTime)
  //           const workloadEnd = mapTimeToTimeSlot(endTime) - 1

  //           if (
  //             isSameDay(compensatedDay, workloadDay) &&
  //             workloadStart <= compensatedEnd &&
  //             workloadEnd >= compensatedStart
  //           ) {
  //             isTimeOverlap = true
  //           }
  //         }
  //         return !isTimeOverlap
  //       })
  //       .map((room) => ({
  //         roomId: room.id,
  //         roomName: room.name,
  //       }))
  //   }

  @Get('/room/auto-assign')
  async autoAssignWorkloadToRoom(
    @QueryParams() query: IAutoAssignWorkloadToRoomQuery
  ) {
    const { academic_year, semester } = query

    /**
     * === Auto assign logic ===
     * 1. Filter out subject that doesn't need room
     * 2. Assign workload to room first priority by `constant`
     * 3. Assign remaining workload to any room that fit
     */
    let workloadList = await Workload.find({
      relations: [
        'room',
        'subject',
        'timeList',
        'teacherWorkloadList',
        'teacherWorkloadList.teacher',
        'teacherWorkloadList.workload',
      ],
      where: {
        academicYear: academic_year,
        semester,
        room: IsNull(),
        subject: Not(IsNull()),
      },
    })

    // Step 1: Filter out subject that doesn't need room
    workloadList = workloadList.filter(
      (workload) => !SUBJECT_NO_ROOM.includes(workload.subject.code)
    )

    // Step 2: Assign workload to room first priority by `constant`
    for (const { roomName, teacherNameList } of ROOM_TEACHER_PAIR) {
      const room = await Room.findOne({
        relations: [
          'workloadList',
          'workloadList.timeList',
          'workloadList.teacherWorkloadList',
          'workloadList.teacherWorkloadList.teacher',
          'workloadList.teacherWorkloadList.workload',
        ],
        where: { name: roomName },
      })
      if (!room) continue
      room.workloadList = room.workloadList.filter(
        (workload) =>
          workload.academicYear === academic_year &&
          workload.semester === semester
      )

      for (const workload of workloadList) {
        const foundAllTeacher = workload
          .getTeacherList()
          .every((teacher) => teacherNameList.includes(teacher.name))
        if (!foundAllTeacher) continue

        // Room found & Teacher list found!
        // Check if can assign workload to that room
        let isTimeOverlap = false
        for (const roomWorkload of room.workloadList) {
          const roomWorkloadDay = roomWorkload.dayOfWeek
          const roomWorkloadStart = roomWorkload.getFirstTimeSlot()
          const roomWorkloadEnd = roomWorkload.getLastTimeSlot()

          const workloadDay = workload.dayOfWeek
          const workloadStart = workload.getFirstTimeSlot()
          const workloadEnd = workload.getLastTimeSlot()

          if (
            workloadDay === roomWorkloadDay &&
            workloadStart <= roomWorkloadEnd &&
            workloadEnd >= roomWorkloadStart
          ) {
            isTimeOverlap = true
          }
        }
        // If can't assign skip then to next workload
        if (isTimeOverlap) continue

        // Assign workload to that room
        workload.room = room
        await workload.save()
      }
    }

    // Step 3: Assign remaining workload to any room that fit
    workloadList = workloadList.filter((workload) => !workload.room)
    for (const workload of workloadList) {
      const roomList = await Room.find({
        relations: [
          'workloadList',
          'workloadList.timeList',
          'workloadList.teacherWorkloadList',
          'workloadList.teacherWorkloadList.teacher',
          'workloadList.teacherWorkloadList.workload',
        ],
        order: {
          name: 'ASC',
        },
      })

      // Search for room that fit with this workload
      for (const room of roomList) {
        room.workloadList = room.workloadList.filter(
          (workload) =>
            workload.academicYear === academic_year &&
            workload.semester === semester
        )

        // Check if can assign workload to this room
        let isTimeOverlap = false
        for (const roomWorkload of room.workloadList) {
          const roomWorkloadDay = roomWorkload.dayOfWeek
          const roomWorkloadStart = roomWorkload.getFirstTimeSlot()
          const roomWorkloadEnd = roomWorkload.getLastTimeSlot()

          const workloadDay = workload.dayOfWeek
          const workloadStart = workload.getFirstTimeSlot()
          const workloadEnd = workload.getLastTimeSlot()

          if (
            workloadDay === roomWorkloadDay &&
            workloadStart <= roomWorkloadEnd &&
            workloadEnd >= roomWorkloadStart
          ) {
            isTimeOverlap = true
          }
        }
        // If can't assign then skip to next room
        if (isTimeOverlap) continue

        // Assign workload to that room
        workload.room = room
        await workload.save()
      }
    }

    return 'OK'
  }

  @Delete('/room/reset-assign')
  async resetAllRoomWorkload(@QueryParams() query: IResetRoomWorkloadQuery) {
    const { academic_year, semester } = query

    const roomList = await Room.find({ relations: ['workloadList'] })
    for (const room of roomList) {
      room.workloadList = room.workloadList.filter(
        (workload) =>
          workload.academicYear !== academic_year &&
          workload.semester !== semester
      )
      await room.save()
    }

    return 'Reset room workload'
  }

  // ===============
  // Room x Workload
  // ===============

  @Get('/room/:id/workload')
  @ValidateQuery(IGetRoomWorkloadQuery)
  async getRoomWorkload(
    @Param('id') id: string,
    @QueryParams() query: IGetRoomWorkloadQuery
  ) {
    const { academicYear, semester } = query

    const room = await Room.findOneByIdAndJoinWorkload(id, {
      academicYear,
      semester,
    })
    if (!room)
      throw new NotFoundError('ไม่พบห้องดังกล่าว', [
        `Room id(${id}) is not found`,
      ])

    const result: IGetTeacherWorkloadResponse[] = []
    for (let day = DayOfWeek.MONDAY; day <= DayOfWeek.SUNDAY; day++) {
      result.push({
        workloadList: [],
      })
    }

    for (const _workload of room.workloadList) {
      const thisDay = result[_workload.dayOfWeek - 1]
      const { subject, room } = _workload
      const teacherListOfThisWorkload = _workload.teacherWorkloadList.map(
        (tw) => ({
          teacherId: tw.teacher.id,
          weekCount: tw.weekCount,
          isClaim: tw.isClaim,
        })
      )

      thisDay.workloadList.push({
        id: _workload.id,
        roomId: room?.id,
        subjectId: subject.id,
        code: subject.code,
        name: subject.name,
        section: _workload.section,
        type: _workload.type,
        fieldOfStudy: _workload.fieldOfStudy,
        degree: _workload.degree,
        classYear: _workload.classYear,
        dayOfWeek: _workload.dayOfWeek,
        startSlot: _workload.getFirstTimeSlot(),
        endSlot: _workload.getLastTimeSlot(),
        timeList: _workload.getTimeStringList(),
        teacherList: teacherListOfThisWorkload,
        isClaim: true,
      })
    }

    return result
  }

  @Post('/room/:id/workload')
  @ValidateBody(IAssignWorkloadToRoom)
  async assignWorkloadToRoom(
    @Param('id') id: string,
    @Body() body: IAssignWorkloadToRoom
  ) {
    const room = await Room.findOne({
      where: { id },
      relations: ['workloadList'],
    })
    if (!room)
      throw new NotFoundError('ไม่พบห้องดังกล่าว', [
        `Room id(${id}) is not found`,
      ])

    const uniqueWorkloadIdList = uniq(body.workloadIdList)
    const workloadList = await Workload.find({
      where: { id: In(uniqueWorkloadIdList) },
    })
    if (uniqueWorkloadIdList.length !== workloadList.length)
      throw new NotFoundError('ไม่พบภาระงานบางส่วน', [
        `Some Workload id(${uniqueWorkloadIdList.join(', ')}) is not found`,
      ])

    room.workloadList.push(...workloadList)

    await room.save()
    return 'Workload assigned to room'
  }

  @Delete('/room/:roomId/workload/:workloadId')
  async unAssignWorkloadFromRoom(
    @Param('roomId') roomId: string,
    @Param('workloadId') workloadId: string
  ) {
    const room = await Room.findOne({
      where: { id: roomId },
      relations: ['workloadList'],
    })
    if (!room)
      throw new NotFoundError('ไม่พบห้องดังกล่าว', [
        `Room id(${roomId}) is not found`,
      ])

    const workload = await Workload.findOne({
      where: { id: workloadId },
    })
    if (!workload)
      throw new NotFoundError('ไม่พบภาระงานดังกล่าว', [
        `Workload id(${workloadId}) is not found`,
      ])

    room.workloadList = room.workloadList.filter(
      (workload) => workload.id !== workloadId
    )

    await room.save()
    return 'Workload un-assigned from room'
  }

  // =============
  // CRUD Endpoint
  // =============

  @Get('/room')
  async getRoom() {
    const roomList = await Room.find({
      order: { name: 'ASC' },
    })
    return roomList
  }

  @Post('/room')
  @ValidateBody(ICreateRoom)
  async createRoom(@Body() body: ICreateRoom) {
    const isExist = await Room.findOne({
      where: { name: body.name },
    })
    if (isExist)
      throw new BadRequestError('มีห้องเรียนชื่อนี้อยู่แล้วในระบบ', [
        `Room name(${body.name}) already exists`,
      ])

    const room = new Room()
    merge(room, body)

    await room.save()
    return 'Room created'
  }

  @Put('/room/:id')
  @ValidateBody(IEditRoom)
  async editRoom(@Param('id') id: string, @Body() body: IEditRoom) {
    const room = await Room.findOne({
      where: { id },
    })
    if (!room)
      throw new NotFoundError('ไม่พบห้องดังกล่าว', [
        `Room id(${id}) is not found`,
      ])

    const isExist = await Room.findOne({
      where: {
        id: Not(id),
        name: body.name,
      },
    })
    if (isExist)
      throw new BadRequestError('มีห้องเรียนชื่อนี้อยู่แล้วในระบบ', [
        `Room name(${body.name}) already exists`,
      ])

    const payload = omitBy(body, isNil)
    merge(room, payload)

    await room.save()
    return 'Room edited'
  }

  @Delete('/room/:id')
  async deleteRoom(@Param('id') id: string) {
    const room = await Room.findOne({
      where: { id },
    })
    if (!room)
      throw new NotFoundError('ไม่พบห้องดังกล่าว', [
        `Room id(${id}) is not found`,
      ])

    await room.remove()
    return 'Room deleted'
  }
}
