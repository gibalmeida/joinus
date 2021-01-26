import { shield, rule } from 'graphql-shield'
import { Context } from '../types'
import { handleErrors } from './helpers'
import { errors } from './constants'

export const rules = {
  isAutheticatedUser: rule( { cache: 'contextual' })(
    (_parent, _args, ctx: Context) => {
      try {
        if (ctx.userId === -1) {
          return handleErrors(errors.notAuthenticated)
        }
        return true
      } catch (e) {
        return e
      }
    }
  ),
  isAutheticatedUserAndAdmin: rule( { cache: 'contextual' })(
    async (_parent, args, ctx: Context ) => {
      try {
        if (ctx.userId === -1 || ctx.userRole !== 'admin') {
          return handleErrors(errors.notAllowed)
        }
        return true
      } catch (e) {
        return e
      }
    }
  )
}

export const permissions = shield({
  Query: {
    me: rules.isAutheticatedUser,
    // signout: rules.isAutheticatedUser,
  },
  Mutation: {
    createDepartment: rules.isAutheticatedUserAndAdmin,
    updateDepartment: rules.isAutheticatedUserAndAdmin,
    deleteDepartment: rules.isAutheticatedUserAndAdmin,
    createJob: rules.isAutheticatedUserAndAdmin,
    updateJob: rules.isAutheticatedUserAndAdmin,
    deleteJob: rules.isAutheticatedUserAndAdmin,
  },
  // Subscription: {
  //   latestJob: rules.isAutheticatedUser,
  // }
})