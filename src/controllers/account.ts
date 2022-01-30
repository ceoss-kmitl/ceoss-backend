import { HeaderParam, JsonController, Post } from 'routing-controllers'
import { get } from 'lodash'

import { Server } from '@configs/server'

@JsonController()
export class AccountController {
  // ===========
  // Google auth
  // ===========

  @Post('/account/signout')
  async signOut(@HeaderParam('authorization') bearerToken: string) {
    const accessToken = get(bearerToken.split(' '), 1, '')
    try {
      await Server.oAuth2.revokeToken(accessToken)
    } catch (error) {
      return 'Invalid access token'
    }
    return 'Signed out'
  }
}
