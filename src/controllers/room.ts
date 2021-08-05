import {
  JsonController,
  Get,
  Post,
  UseBefore,
  Body,
  Put,
  Param,
  Delete,
} from 'routing-controllers'

import { schema } from '@middlewares/schema'
import { Room } from '@models/room'
import { ICreateRoom, IEditRoom } from '@controllers/types/room'
import { NotFoundError } from '@errors/notFoundError'

@JsonController()
export class RoomController {
  @Get('/room')
  async getRoom() {
    const roomList = await Room.find()
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

    const room = await Room.findOne(id)
    if (!room) throw new NotFoundError(`Room ${id} is not found`)

    room.name = name ?? room.name
    room.capacity = capacity ?? room.capacity

    await room.save()
    return 'Room edited'
  }

  @Delete('/room/:id')
  async deleteRoom(@Param('id') id: string) {
    const room = await Room.findOne(id)
    if (!room) throw new NotFoundError(`Room ${id} is not found`)

    await room.softRemove()
    return 'Room deleted'
  }
}
