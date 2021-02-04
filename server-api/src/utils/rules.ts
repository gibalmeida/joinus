import { shield, rule, and, or } from 'graphql-shield'
import { Context } from '../types'
import { handleErrors } from './helpers'
import { debugEnabled, errors, isDev } from './constants'
import { Role } from '@prisma/client'
import { department } from '../resolvers/Mutations/Department'
import { NexusGenArgTypes } from '../generated'

export const rules = {
  isAutheticatedUser: rule({ cache: 'contextual' })(
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
  isAdmin: rule( { cache: 'contextual' })(
    async (_parent, _args, ctx: Context ) => {
      try {
        if (ctx.userId === -1 || ctx.userRole !== Role.ADMIN ) {
          return handleErrors(errors.notAllowed)
        }
        return true
      } catch (e) {
        return e
      }
    }
  ),
  isManager: rule( { cache: 'contextual'})(
    async (_parent, _args, ctx: Context ) => {
      try {
        if (ctx.userId === -1 || ctx.userRole !== Role.MANAGER) {
          return handleErrors(errors.notAllowed)
        }
        return true
      } catch (e) {
        return e
      }
    }
  ),
  isDepartmentManagerOfJob: rule({cache: 'strict'})(
    async (_parent, { data }: NexusGenArgTypes['Mutation']['createJob'], ctx: Context) => {
      if (ctx.userRole === Role.ADMIN) {
        return true
      } if (ctx.userRole !== Role.MANAGER) {
        return false
      }
      
      if (data.Department && (data.Department.connectOrCreate || data.Department.create)) {
        return false
      }      

      try {
        const department = await ctx.prisma.department.findUnique({ where: data.Department.connect })

        if (ctx.userId !== department.managerId) {
          return handleErrors(errors.notAllowed)
        }

        return true

      } catch (e) {
        return e
      }

    }
  ),
  isJobOwner: rule( {cache: 'strict'})(
    async (_parent, args, ctx: Context) => {
      try {
        const job = await ctx.prisma.job.findUnique({ where: args.where, include: { Department: true}})
        
        if (job.Department.managerId !== ctx.userId) {
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
    createDepartment: rules.isAdmin,
    updateDepartment: rules.isAdmin,
    deleteDepartment: rules.isAdmin,
    createJob: or(rules.isAdmin, and(rules.isManager,rules.isDepartmentManagerOfJob)),
    updateJob: or(rules.isAdmin, and(rules.isManager,rules.isJobOwner)),
    deleteJob: or(rules.isAdmin, and(rules.isManager,rules.isJobOwner)),
  },
  // Subscription: {
  //   latestJob: rules.isAutheticatedUser,
  // }
  },
  { 
    allowExternalErrors: isDev(),
    debug: debugEnabled()
  }
)