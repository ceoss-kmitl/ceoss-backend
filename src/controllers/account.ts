import { Body, JsonController, Post } from 'routing-controllers'
import { chain } from 'lodash'

import { ValidateBody } from '@middlewares/validator'
import { createOAuthInstance } from '@configs/oauth'
import { Account } from '@models/account'
import { BadRequestError } from '@errors/badRequestError'

import { IGoogleLogin, IGoogleLogout, IGoogleRefresh } from './types/account'

@JsonController()
export class AccountController {
  // ===========
  // Google auth
  // ===========

  @Post('/account/google-login')
  @ValidateBody(IGoogleLogin)
  async googleLogin(@Body() body: IGoogleLogin) {
    const { code, deviceId } = body
    const OAuth = createOAuthInstance()

    const { tokens } = await OAuth.getToken(code)
    const { refresh_token, access_token, id_token } = tokens || {}
    if (!refresh_token || !access_token || !id_token) {
      throw new BadRequestError('เข้าสู่ระบบไม่สำเร็จ', [
        'Can not get credentials with this code',
      ])
    }
    OAuth.setCredentials(tokens)

    const ticket = await OAuth.verifyIdToken({
      idToken: id_token,
    })
    const { email, picture } = ticket.getPayload() || {}
    if (!email) {
      throw new BadRequestError('เข้าสู่ระบบไม่สำเร็จ', [
        'Can not get profile with this code',
      ])
    }

    const account = await Account.findOne({ where: { email } })

    if (!account) {
      const newAccount = new Account()
      newAccount.email = email
      newAccount.deviceId = deviceId
      newAccount.refreshToken = refresh_token
      await newAccount.save()

      return {
        imageUrl: picture,
        email,
        accessToken: access_token,
      }
    }

    if (account.deviceId !== deviceId) {
      account.deviceId = deviceId
      await account.save()
    }

    return {
      imageUrl: picture,
      email,
      accessToken: access_token,
    }
  }

  @Post('/account/google-refresh')
  @ValidateBody(IGoogleRefresh)
  async getNewAccessToken(@Body() body: IGoogleRefresh) {
    const { email, deviceId } = body

    const account = await Account.findOne({ where: { email } })
    if (!account) {
      throw new BadRequestError('กรุณาลงชื่อเข้าใช้ใหม่อีกครั้ง', [
        'Account not found',
      ])
    }
    if (account.deviceId !== deviceId) {
      throw new BadRequestError('กรุณาลงชื่อเข้าใช้ใหม่อีกครั้ง', [
        'Refresh token from new device',
      ])
    }

    const OAuth = createOAuthInstance()
    OAuth.setCredentials({
      refresh_token: account.refreshToken,
    })
    const headers = await OAuth.getRequestHeaders()
    const newAccessToken = chain(headers)
      .get('Authorization', '')
      .split(' ')
      .get(1, '')
      .value()

    if (!newAccessToken) {
      throw new BadRequestError('กรุณาลงชื่อเข้าใช้ใหม่อีกครั้ง', [
        'Can not re-new token',
      ])
    }

    return {
      accessToken: newAccessToken,
    }
  }

  @Post('/account/google-logout')
  @ValidateBody(IGoogleLogout)
  async googleLogout(@Body() body: IGoogleLogout) {
    const { email, deviceId } = body

    const account = await Account.findOne({ where: { email } })
    if (!account) {
      return 'Account not found'
    }
    if (account.deviceId !== deviceId) {
      return 'Can not logout from new device'
    }

    const OAuth = createOAuthInstance()
    await OAuth.revokeToken(account.refreshToken)
    await account.remove()
    return 'Logout success'
  }
}
