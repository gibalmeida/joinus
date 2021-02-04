import { AuthenticationError, ForbiddenError, UserInputError } from 'apollo-server'

export const tokens = {
  access: {
    name: 'ACCESS_TOKEN',
    expiry: '1d',
  },
}

export const APP_SECRET = process.env.APP_SECRET

export const isDev = () => process.env.NODE_ENV === 'development'
export const debugEnabled = () => process.env.DEBUG === 'yes'

export const errors = {
  notAuthenticated: new AuthenticationError('Unauthenticated user!'),
  notAllowed: new ForbiddenError('Forbidden Error!'),
  userAlreadyExists: new UserInputError('User already exists!'),
  invalidUser: new UserInputError('Invalid username or password'),
}