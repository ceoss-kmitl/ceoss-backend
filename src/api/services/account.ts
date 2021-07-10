import { Account } from '@models/account'
import { AccountNotFoundError } from '@errors/notFoundError'
import { BadRequestError } from '@errors/badRequestError'
import {
  ICreateAccountRequest,
  IEditAccountRequest,
} from '@api/interfaces/account'

const findAll = async () => {
  const accountList = await Account.find()
  return accountList
}

const findById = async (id: string) => {
  const account = await Account.findOne(id)
  if (!account) throw new AccountNotFoundError(id)

  return account
}

const create = async ({
  username,
  password,
  isAdmin = false,
}: ICreateAccountRequest) => {
  const isExist = await Account.findOneByUsername(username)
  if (isExist) throw new BadRequestError('Account already exist')

  const account = new Account()
  account.username = username
  account.password = password
  account.isAdmin = isAdmin

  await account.save()
  return 'Account created'
}

const edit = async (
  id: string,
  { username, password, isAdmin }: IEditAccountRequest
) => {
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

const remove = async (id: string) => {
  const account = await Account.findOne(id)
  if (!account) throw new AccountNotFoundError(id)

  await account.softRemove()
  return 'Account deleted'
}

export default {
  findAll,
  findById,
  create,
  edit,
  remove,
}
