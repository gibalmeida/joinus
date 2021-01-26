import { extendType, nonNull, stringArg } from 'nexus'
import { compare, hash } from 'bcrypt'
import { generateAccessToken, handleErrors } from '../../utils/helpers'
import { errors } from '../../utils/constants'

export const user = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('signup',{
      type: 'AuthPayload',
      args: {
        name: stringArg(),
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      async resolve(_parent, { name, email, password }, ctx) {
        try {
          const hashedPassword = await hash(password, 10)
          const user = await ctx.prisma.user.create({
            data: {
              name,
              email,
              password: hashedPassword,
              role: 'user'
            }
          })

          const accessToken = generateAccessToken(user.id, user.role)
          return {
            accessToken,
            user,
          }
        } catch (e) {
          handleErrors(errors.userAlreadyExists)
        }
      }
    })

    t.field('login', {
      type: 'AuthPayload',
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      async resolve(_parent, { email, password }, ctx) {
        let user = null
        try {
          user = await ctx.prisma.user.findUnique({
            where: {
              email,
            },
          })
        } catch (e) {
          handleErrors(errors.invalidUser)
        }

        if (!user) handleErrors(errors.invalidUser)

        const passwordValid = await compare(password, user.password)
        if (!passwordValid) handleErrors(errors.invalidUser)

        const accessToken = generateAccessToken(user.id, user.role)
        return {
          accessToken,
          user,
        }
      }
    })
  }
})