import { createTestContext } from './__helpers'
import { createUserMutation, loginMutation } from './graphql'
import { Prisma, Role } from '@prisma/client'
import { NexusGenFieldTypes } from '../src/generated/index'

const ctx = createTestContext()

// interface User {
//   name: string
//   email: string
//   password: string
// }

const userOne: Prisma.UserCreateInput = {
  name: 'user one',
  email: 'userone@domain.com',
  password: 'mypassword1',
}

const createUser = async (user: Prisma.UserCreateInput)  => {
  const data = await ctx.client.request<NexusGenFieldTypes['Mutation'], Prisma.UserCreateInput>(createUserMutation, user)
  return data
}

test('successfully create an user', async () => {
  const userResult = await createUser(userOne)

  expect(userResult).toHaveProperty('signup')
  expect(userResult.signup.user.name).toEqual(userOne.name)
  expect(userResult.signup.user.role).toEqual(Role.APPLICANT)

})

test('unsuccessfully create an user with the same email twice', async () => {
  // await createUser(userOne)
  // now try to create the same user again
  await expect(createUser(userOne)).rejects.toThrow()
})

test('successfully get a token on login', async () => {
  // await createUser(userOne)

  const credentials = {
    email: userOne.email,
    password: userOne.password,
  }
  const data = await ctx.client.request(loginMutation, credentials)

  expect(data).toHaveProperty('login')
  expect(data.login.accessToken).toBeDefined()
})

test('unsuccessfully login with wrong password', async () => {
  // await createUser(userOne)

  const credentials = {
    email: userOne.email,
    password: 'wrong_password',
  }

  await expect(ctx.client.request(loginMutation, credentials)).rejects.toThrow()
})
