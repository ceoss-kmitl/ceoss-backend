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

import {
  IAssignWorkloadToRoom,
  ICreateRoom,
  IEditRoom,
  IGetRoomWorkloadQuery,
} from '@controllers/types/room'
import { schema } from '@middlewares/schema'
import { mapTimeSlotToTime } from '@libs/mapper'
import { Room } from '@models/room'
import { DayOfWeek, Degree, Workload, WorkloadType } from '@models/workload'
import { NotFoundError } from '@errors/notFoundError'
import { In } from 'typeorm'

@JsonController()
export class RoomController {
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

  @Get('/room/:id/workload')
  @UseBefore(schema(IGetRoomWorkloadQuery, 'query'))
  async getRoomWorkload(
    @Param('id') id: string,
    @QueryParams() query: IGetRoomWorkloadQuery
  ) {
    const { academic_year, semester } = query

    const room = await Room.createQueryBuilder('room')
      .innerJoinAndSelect('room.workloadList', 'workloadList')
      .innerJoinAndSelect('workloadList.subject', 'subject')
      .innerJoinAndSelect('workloadList.timeList', 'timeList')
      .innerJoinAndSelect(
        'workloadList.teacherWorkloadList',
        'teacherWorkloadList'
      )
      .innerJoinAndSelect('teacherWorkloadList.teacher', 'teacher')
      .innerJoinAndSelect('teacherWorkloadList.workload', 'workload')
      .where('room.id = :id', { id })
      .andWhere('workloadList.academicYear = :academic_year', { academic_year })
      .andWhere('workloadList.semester = :semester', { semester })
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
}
