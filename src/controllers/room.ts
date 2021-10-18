import {
  JsonController,
  Get,
  Post,
  UseBefore,
  Body,
  Put,
  Param,
  Delete,
  QueryParams,
} from 'routing-controllers'
import { In } from 'typeorm'

import {
  IAssignWorkloadToRoom,
  IAutoAssignWorkloadToRoomQuery,
  ICreateRoom,
  IEditRoom,
  IGetRoomWorkloadQuery,
  IResetRoomWorkloadQuery,
} from '@controllers/types/room'
import { schema } from '@middlewares/schema'
import { mapTimeSlotToTime } from '@libs/mapper'
import { Room } from '@models/room'
import { DayOfWeek, Degree, Workload, WorkloadType } from '@models/workload'
import { NotFoundError } from '@errors/notFoundError'

import { ROOM_TEACHER_PAIR, SUBJECT_NO_ROOM } from 'constants/room'

@JsonController()
export class RoomController {
  @Get('/room/:id/workload')
  @UseBefore(schema(IGetRoomWorkloadQuery, 'query'))
  async getRoomWorkload(
    @Param('id') id: string,
    @QueryParams() query: IGetRoomWorkloadQuery
  ) {
    const { academic_year, semester } = query

    const room = await Room.createQueryBuilder('room')
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
      .where('room.id = :id', { id })
      .getOne()

    if (!room)
      throw new NotFoundError('ไม่พบห้องดังกล่าว', [`Room ${id} is not found`])

    const result = [] as {
      workloadList: {
        id: string
        subjectId: string
        code: string
        name: string
        section: number
        type: WorkloadType
        fieldOfStudy: string
        degree: Degree
        classYear: number
        dayOfWeek: DayOfWeek
        startSlot: number
        endSlot: number
        timeList: { start: string; end: string }[]
        teacherList: {
          teacherId: string
          weekCount: number
          isClaim: boolean
        }[]
        isClaim: boolean
      }[]
    }[]

    for (let day = DayOfWeek.Monday; day <= DayOfWeek.Sunday; day++) {
      result.push({
        workloadList: [],
      })
    }

    for (const workload of room.workloadList) {
      const thatDay = result[workload.dayOfWeek - 1]
      const { subject } = workload

      thatDay.workloadList.push({
        id: workload.id,
        subjectId: subject.id,
        code: subject.code,
        name: subject.name,
        section: workload.section,
        type: workload.type,
        fieldOfStudy: workload.fieldOfStudy,
        degree: workload.degree,
        classYear: workload.classYear,
        dayOfWeek: workload.dayOfWeek,
        startSlot: workload.getFirstTimeSlot(),
        endSlot: workload.getLastTimeSlot(),
        timeList: workload.timeList.map((time) => ({
          start: mapTimeSlotToTime(time.startSlot),
          end: mapTimeSlotToTime(time.endSlot + 1),
        })),
        teacherList: workload.getTeacherList().map((teacher) => ({
          teacherId: teacher.id,
          weekCount: workload.getWeekCount(teacher.id),
          isClaim: workload.getIsClaim(teacher.id),
        })),
        isClaim: true,
      })
    }

    return result
  }

  @Post('/room/:id/workload')
  @UseBefore(schema(IAssignWorkloadToRoom))
  async assignWorkloadToRoom(
    @Param('id') id: string,
    @Body() body: IAssignWorkloadToRoom
  ) {
    const { workloadIdList } = body

    const room = await Room.findOne({
      where: { id },
      relations: ['workloadList'],
    })
    if (!room)
      throw new NotFoundError('ไม่พบห้องดังกล่าว', [`Room ${id} is not found`])

    const workloadList = await Workload.find({
      where: { id: In(workloadIdList || []) },
    })
    room.workloadList = [...room.workloadList, ...workloadList]

    await room.save()
    return 'Workload assigned to room'
  }

  @Delete('/room/:roomId/workload/:workloadId')
  @UseBefore(schema(IAssignWorkloadToRoom))
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
        `Room ${roomId} is not found`,
      ])

    room.workloadList = room.workloadList.filter(
      (workload) => workload.id !== workloadId
    )

    await room.save()
    return 'Workload un-assigned from room'
  }

  @Get('/room/auto-assign')
  async autoAssignWorkloadToRoom(
    @QueryParams() query: IAutoAssignWorkloadToRoomQuery
  ) {
    const { academic_year, semester } = query
    const debug = {} as any

    // Get workload with un-assigned room
    let workloadList = await Workload.createQueryBuilder('workload')
      .leftJoinAndSelect('workload.room', 'room', 'workload.room IS NULL')
      .leftJoinAndSelect('workload.timeList', 'timeList')
      .leftJoinAndSelect('workload.subject', 'subject')
      .leftJoinAndSelect('workload.teacherWorkloadList', 'teacherWorkloadList')
      .leftJoinAndSelect('teacherWorkloadList.teacher', 'teacher')
      .where(
        'workload.academicYear = :academic_year AND workload.semester = :semester',
        { academic_year, semester }
      )
      .getMany()

    // Step 1: Assign workload to room reference from custom constant
    for (const { roomName, teacherNameList } of ROOM_TEACHER_PAIR) {
      // Pick workload of these teachers
      const _workloadList = workloadList.filter((workload) =>
        workload
          .getTeacherList()
          .every((teacher) => teacherNameList.includes(teacher.name))
      )

      for (const _workload of _workloadList) {
        // Find room that fit with this workload
        const room = await Room.createQueryBuilder('room')
          .leftJoinAndSelect(
            'room.workloadList',
            'workloadList',
            'workloadList.academicYear = :academic_year AND workloadList.semester = :semester',
            { academic_year, semester }
          )
          .leftJoinAndSelect(
            'workloadList.timeList',
            'timeList',
            ':workloadStartSlot > timeList.endSlot OR :workloadEndSlot < timeList.startSlot',
            {
              workloadStartSlot: _workload.getFirstTimeSlot(),
              workloadEndSlot: _workload.getLastTimeSlot(),
            }
          )
          .where('room.name = :roomName', { roomName })
          .getOne()

        // If found compatible room, assign workload to it
        if (room) {
          room.workloadList = [...room.workloadList, _workload]
          await room.save()

          if (!debug[roomName]) {
            debug[roomName] = [_workload]
          } else {
            debug[roomName].push(_workload)
          }
        }
      }
    }

    // Step 2: Ignore subject that doesn't need the room
    workloadList = workloadList.filter(
      (workload) => !SUBJECT_NO_ROOM.includes(workload.subject.code)
    )

    // Step 3: Assign remainning workload to any room
    workloadList = workloadList.filter((workload) => !workload.room)
    for (const _workload of workloadList) {
      // Find room list that fit with this workload
      const roomList = await Room.createQueryBuilder('room')
        .leftJoinAndSelect(
          'room.workloadList',
          'workloadList',
          'workloadList.academicYear = :academic_year AND workloadList.semester = :semester AND workloadList.dayOfWeek = :dayOfWeek',
          { academic_year, semester, dayOfWeek: _workload.dayOfWeek }
        )
        .leftJoinAndSelect(
          'workloadList.timeList',
          'timeList',
          ':startSlot > timeList.endSlot OR :endSlot < timeList.startSlot',
          {
            startSlot: _workload.getFirstTimeSlot(),
            endSlot: _workload.getLastTimeSlot(),
          }
        )
        .orderBy('room.name')
        .getMany()

      // Assign workload to first compatible room
      const room = roomList[0]
      if (room) {
        room.workloadList = [...room.workloadList, _workload]
        await room.save()

        if (!debug[room.name]) {
          debug[room.name] = [_workload]
        } else {
          debug[room.name].push(_workload)
        }
      }
    }

    return debug
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

  @Get('/room')
  async getRoom() {
    const roomList = await Room.find({ order: { name: 'ASC' } })
    return roomList
  }

  @Post('/room')
  @UseBefore(schema(ICreateRoom))
  async createRoom(@Body() body: ICreateRoom) {
    const { name, capacity } = body

    const room = new Room()
    room.name = name
    room.capacity = capacity

    await room.save()
    return 'Room created'
  }

  @Put('/room/:id')
  @UseBefore(schema(IEditRoom))
  async editRoom(@Param('id') id: string, @Body() body: IEditRoom) {
    const { name, capacity } = body

    const room = await Room.findOne({ where: { id } })
    if (!room)
      throw new NotFoundError('ไม่พบห้องดังกล่าว', [`Room ${id} is not found`])

    room.name = name ?? room.name
    room.capacity = capacity ?? room.capacity

    await room.save()
    return 'Room edited'
  }

  @Delete('/room/:id')
  async deleteRoom(@Param('id') id: string) {
    const room = await Room.findOne(id)
    if (!room)
      throw new NotFoundError('ไม่พบห้องดังกล่าว', [`Room ${id} is not found`])

    await room.remove()
    return 'Room deleted'
  }
}
