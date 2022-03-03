import { Body, JsonController, Post } from 'routing-controllers'

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
    const { code } = body
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
      newAccount.accessToken = access_token
      newAccount.refreshToken = refresh_token
      await newAccount.save()
    } else {
      account.accessToken = access_token
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
    const { email, accessToken } = body

    const account = await Account.findOne({ where: { email } })
    if (!account) {
      throw new BadRequestError('กรุณาลงชื่อเข้าใช้ใหม่อีกครั้ง', [
        'Account not found',
      ])
    }
    if (account.accessToken !== accessToken) {
      throw new BadRequestError('กรุณาลงชื่อเข้าใช้ใหม่อีกครั้ง', [
        'Invalid access token',
      ])
    }

    const OAuth = createOAuthInstance()
    OAuth.setCredentials({
      access_token: accessToken,
      refresh_token: account.refreshToken,
    })
    const { token } = await OAuth.getAccessToken()
    if (!token) {
      throw new BadRequestError('กรุณาลงชื่อเข้าใช้ใหม่อีกครั้ง', [
        'Can not re-new token',
      ])
    }
    account.accessToken = token
    await account.save()

    return {
      accessToken: token,
    }
  }

  @Post('/account/google-logout')
  @ValidateBody(IGoogleLogout)
  async googleLogout(@Body() body: IGoogleLogout) {
    const { email, accessToken } = body

    const account = await Account.findOne({ where: { email } })
    if (!account) {
      return 'Account not found'
    }
    if (account.accessToken !== accessToken) {
      return 'Invalid access token'
    }

    const OAuth = createOAuthInstance()
    OAuth.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
    })
    await OAuth.revokeCredentials()
    await account.remove()
    return 'Logout success'
  }

  // TODO: Remove this when go on production
  @Post('/account/revoke-token')
  async revokeToken(@Body() body: { token: string }) {
    const { token } = body

    const OAuth = createOAuthInstance()
    OAuth.setCredentials({ access_token: token })
    await OAuth.revokeCredentials()
    return 'Revoke success'
  }
}
