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
import {
  ICreateAccountRequest,
  IEditAccountRequest,
} from '@controllers/types/account'
import { schema } from '@middlewares/schema'
import { Account } from '@models/account'
import { AccountNotFoundError } from '@errors/notFoundError'
import { BadRequestError } from '@errors/badRequestError'

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
    if (!account) throw new AccountNotFoundError(id)

    return {
      id: account.id,
      username: account.username,
      isAdmin: account.isAdmin,
    }
  }

  @Post('/account')
  @UseBefore(schema(ICreateAccountRequest))
  async create(@Body() body: ICreateAccountRequest) {
    const { username, password, isAdmin } = body
    const isExist = await Account.findOneByUsername(username)
    if (isExist) throw new BadRequestError('Account already exist')

    const account = new Account()
    account.username = username
    account.password = password
    account.isAdmin = isAdmin ?? false

    await account.save()
    return 'Account created'
  }

  @Put('/account/:id')
  @UseBefore(schema(IEditAccountRequest))
  async edit(@Param('id') id: string, @Body() body: IEditAccountRequest) {
    const { username, password, isAdmin } = body
    const isExist = await Account.findOneByUsername(username)
    if (isExist) throw new BadRequestError('This username has been used')

    const account = await Account.findOne(id)
    if (!account) throw new AccountNotFoundError(id)

    account.username = username ?? account.username
    account.password = password ?? account.password
    account.isAdmin = isAdmin ?? account.isAdmin

    await account.save()
    return 'Account edited'
  }

  @Delete('/account/:id')
  async delete(@Param('id') id: string) {
    const account = await Account.findOne(id)
    if (!account) throw new AccountNotFoundError(id)

    await account.softRemove()
    return 'Account deleted'
  }
}
