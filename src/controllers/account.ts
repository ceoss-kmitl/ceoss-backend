import {
  Body,
  Delete,
  Get,
  JsonController,
  Param,
  Post,
  Put,
  UseBefore,
} from 'routing-controllers'

import { ICreateAccount, IEditAccount } from 'controllers/types/account'
import { schema } from 'middlewares/schema'
import { Account } from 'models/account'
import { NotFoundError } from 'errors/notFoundError'
import { BadRequestError } from 'errors/badRequestError'

@JsonController()
export class AccountController {
  @Get('/account')
  async findAll() {
    const accountList = await Account.find()
    return accountList
  }

  @Get('/account/:id')
  async findById(@Param('id') id: string) {
    const account = await Account.findOne(id)
    if (!account)
      throw new NotFoundError('ไม่พบบัญชีดังกล่าว', [
        `Account ${id} is not found`,
      ])

    return {
      id: account.id,
      username: account.username,
      isAdmin: account.isAdmin,
    }
  }

  @Post('/account')
  @UseBefore(schema(ICreateAccount))
  async create(@Body() body: ICreateAccount) {
    const { username, password, isAdmin } = body
    const isExist = await Account.findOneByUsername(username)
    if (isExist)
      throw new BadRequestError('มีบัญชีนี้อยู่แล้วในระบบ', [
        'Account already exist',
      ])

    const account = new Account()
    account.username = username
    account.password = password
    account.isAdmin = isAdmin ?? false

    await account.save()
    return 'Account created'
  }

  @Put('/account/:id')
  @UseBefore(schema(IEditAccount))
  async edit(@Param('id') id: string, @Body() body: IEditAccount) {
    const { username, password, isAdmin } = body
    const isExist = await Account.findOneByUsername(username)
    if (isExist)
      throw new BadRequestError('ชื่อนี้ถูกใช้ไปแล้ว', [
        'This username has been used',
      ])

    const account = await Account.findOne(id)
    if (!account)
      throw new NotFoundError('ไม่พบบัญชีดังกล่าว', [
        `Account ${id} is not found`,
      ])

    account.username = username ?? account.username
    account.password = password ?? account.password
    account.isAdmin = isAdmin ?? account.isAdmin

    await account.save()
    return 'Account edited'
  }

  @Delete('/account/:id')
  async delete(@Param('id') id: string) {
    const account = await Account.findOne(id)
    if (!account)
      throw new NotFoundError('ไม่พบบัญชีดังกล่าว', [
        `Account ${id} is not found`,
      ])

    await account.softRemove()
    return 'Account deleted'
  }
}
