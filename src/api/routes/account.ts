import Express from 'express'
import AccountService from '@api/services/account'
import { asyncWrapper } from '@middlewares/asyncWrapper'
import { validateRequest } from '@middlewares/validateRequest'
import { ICreateAccountRequest, IEditAccountRequest } from '@api/types/account'

const router = Express.Router()

router.get(
  '/account',
  asyncWrapper(async () => {
    const accountList = await AccountService.findAll()
    return accountList.map((account) => ({
      id: account.id,
      username: account.username,
    }))
  })
)

router.get(
  '/account/:id',
  asyncWrapper(async (req) => {
    const { id } = req.params
    const account = await AccountService.findById(id)
    return {
      id: account.id,
      username: account.username,
      isAdmin: account.isAdmin,
    }
  })
)

router.post(
  '/account',
  validateRequest(ICreateAccountRequest),
  asyncWrapper(async (req) => {
    const result = await AccountService.create(req.body)
    return result
  })
)

router.put(
  '/account/:id',
  validateRequest(IEditAccountRequest),
  asyncWrapper(async (req) => {
    const { id } = req.params
    const result = await AccountService.edit(id, req.body)
    return result
  })
)

router.delete(
  '/account/:id',
  asyncWrapper(async (req) => {
    const { id } = req.params
    const result = await AccountService.remove(id)
    return result
  })
)

export default router
