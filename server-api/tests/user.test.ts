import { request } from 'graphql-request'
import { createUser } from './graphql'
import { getConfig } from './helpers'

const config = getConfig()

test('successfully create a user', async () => {
  try {
    const user = {
      name: 'user one',
      email: 'userone@domain.com',
      password: 'mypassword1',
    }
    const data: any = await request(config.url, createUser, user)

    expect(data).toHaveProperty('signup')
    expect(data.signup.user.name).toEqual(user.name)
  } catch (e) {
    console.log('error', e)
  }
})