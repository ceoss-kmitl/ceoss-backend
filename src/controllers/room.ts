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
import dayjs from 'dayjs'

import { Excel } from '@libs/Excel'
import { DayOfWeek } from '@constants/common'
import { ROOM_TEACHER_PAIR, SUBJECT_NO_ROOM } from '@constants/room'
import { ValidateBody, ValidateQuery } from '@middlewares/validator'
import { NotFoundError } from '@errors/notFoundError'
import { BadRequestError } from '@errors/badRequestError'
import { Room } from '@models/room'
import { Workload } from '@models/workload'
import { Time } from '@models/time'

import {
  IAssignWorkloadToRoom,
  IAutoAssignWorkloadToRoomQuery,
  ICreateRoom,
  IEditRoom,
  IGetRoomExcelQuery,
  IGetAvailableRoom,
  IGetRoomWorkloadQuery,
  IResetRoomWorkloadQuery,
} from './types/room'
import { IGetTeacherWorkloadResponse } from './types/teacher'
import { generateRoomExcel } from './templates/roomExcel'

@JsonController()
export class RoomController {
  // ==========
  // Room Excel
  // ==========

  @Get('/room/excel')
  @ValidateQuery(IGetRoomExcelQuery)
  async getRoomExcel(
    @Res() res: Response,
    @QueryParams() query: IGetRoomExcelQuery
  ) {
    const { academicYear, semester } = query

    const roomList = await Room.find({
      relations: [
        'workloadList',
        'workloadList.compensationFrom',
        'workloadList.subject',
        'workloadList.timeList',
        'workloadList.teacherWorkloadList',
        'workloadList.teacherWorkloadList.teacher',
        'workloadList.teacherWorkloadList.workload',
      ],
      order: { name: 'ASC' },
    })
    roomList.forEach((room) => {
      room.workloadList = room.workloadList.filter(
        (workload) =>
          !workload.compensationFrom &&
          workload.academicYear === academicYear &&
          workload.semester === semester
      )
    })

    const excel = new Excel(res)
    await generateRoomExcel(excel, roomList, academicYear, semester)

    const yearSemester = `${String(academicYear).substring(2, 4)}-${semester}`
    const file = await excel.createFile(`${yearSemester} ตารางการใช้ห้อง`)
    return file
  }

  // ===========
  // Room Action
  // ===========

  @Post('/room/auto-assign')
  async autoAssignWorkloadToRoom(
    @QueryParams() query: IAutoAssignWorkloadToRoomQuery
  ) {
    const { academicYear, semester } = query

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
        'compensationFrom',
        'teacherWorkloadList',
        'teacherWorkloadList.teacher',
        'teacherWorkloadList.workload',
      ],
      where: {
        academicYear,
        semester,
        room: IsNull(),
        compensationFrom: IsNull(),
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
          workload.academicYear === academicYear &&
          workload.semester === semester
      )

      for (const workload of workloadList) {
        const foundAllTeacher = workload
          .getTeacherList()
          .every((teacher) => teacherNameList.includes(teacher.name))
        if (!foundAllTeacher) continue

        // Room found & Teacher list found!
        // Check if can assign workload to that roomconst date = dayjs(compensatedDate)
        const day = workload.dayOfWeek
        const start = workload.getFirstTimeSlot()
        const end = workload.getLastTimeSlot()
        const hasTimeOverlap = room.workloadList.some((_workload) => {
          const _day = _workload.dayOfWeek
          const _start = _workload.getFirstTimeSlot()
          const _end = _workload.getLastTimeSlot()

          return day === _day && start <= _end && end >= _start
        })

        // If can't assign skip then to next workload
        if (hasTimeOverlap) continue

        // Assign workload to that room
        workload.room = room
        await workload.save()
      }
    }

    // Step 3: Assign remaining workload to any room that fit
    workloadList = workloadList.filter((workload) => !workload.room)
    for (const workload of workloadList) {
      // Get all room then sort by name
      const roomList = await Room.find({
        relations: [
          'workloadList',
          'workloadList.timeList',
          'workloadList.teacherWorkloadList',
          'workloadList.teacherWorkloadList.teacher',
          'workloadList.teacherWorkloadList.workload',
        ],
        order: { name: 'ASC' },
      })
      roomList.forEach((room) => {
        room.workloadList = room.workloadList.filter(
          (workload) =>
            workload.academicYear === academicYear &&
            workload.semester === semester
        )
      })

      for (const room of roomList) {
        // Check if can assign workload to this room
        const day = workload.dayOfWeek
        const start = workload.getFirstTimeSlot()
        const end = workload.getLastTimeSlot()
        const hasTimeOverlap = room.workloadList.some((_workload) => {
          const _day = _workload.dayOfWeek
          const _start = _workload.getFirstTimeSlot()
          const _end = _workload.getLastTimeSlot()

          return day === _day && start <= _end && end >= _start
        })

        // If can't assign skip then to next workload
        if (hasTimeOverlap) continue

        // Assign workload to that room
        // then skip to next workload
        workload.room = room
        await workload.save()
        break
      }
    }

    return 'Room auto-assign completed'
  }

  @Post('/room/reset-assign')
  async resetAllRoomWorkload(@QueryParams() query: IResetRoomWorkloadQuery) {
    const { academicYear, semester } = query

    const roomList = await Room.find({
      relations: ['workloadList'],
    })
    for (const room of roomList) {
      room.workloadList = room.workloadList.filter(
        (workload) =>
          workload.academicYear !== academicYear &&
          workload.semester !== semester
      )
    }

    await Room.save(roomList)
    return 'Reset all room-workload completed'
  }

  // ===============
  // Room x Workload
  // ===============

  @Get('/room/available-workload')
  @ValidateQuery(IGetAvailableRoom)
  async getAvailableRoomForThisWorkload(
    @QueryParams() query: IGetAvailableRoom
  ) {
    const { academicYear, semester, compensatedDate, startTime, endTime } =
      query

    const roomList = await Room.findManyAndJoinWorkload({
      academicYear,
      semester,
    })

    return roomList
      .filter((room) => {
        const date = dayjs(compensatedDate)
        const start = Time.fromTimeString(startTime)
        const end = Time.fromTimeString(endTime) - 1

        const hasTimeOverlap = room.workloadList.some((_workload) => {
          const _start = _workload.getFirstTimeSlot()
          const _end = _workload.getLastTimeSlot()
          const isSameDay = _workload.compensationDate
            ? dayjs(_workload.compensationDate).isSame(date, 'day')
            : date.weekday() === _workload.dayOfWeek
          return isSameDay && start <= _end && end >= _start
        })

        return !hasTimeOverlap
      })
      .map((room) => ({
        roomId: room.id,
        roomName: room.name,
      }))
      .sort((a, b) => a.roomName.localeCompare(b.roomName))
  }

  @Get('/room/:id/workload')
  @ValidateQuery(IGetRoomWorkloadQuery)
  async getRoomWorkload(
    @Param('id') id: string,
    @QueryParams() query: IGetRoomWorkloadQuery
  ) {
    const { academicYear, semester, compensation } = query

    const room = await Room.findOneByIdAndJoinWorkload(id, {
      academicYear,
      semester,
      compensation,
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
      const thisDay = result[_workload.dayOfWeek]
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
