import { PrismaClient } from '@prisma/client'
import { PubSub } from 'apollo-server'
import { sign, verify } from 'jsonwebtoken'
import { APP_SECRET, tokens } from './constants'
import { Context, Token } from '../types'

export const handleErrors = (error: any) => {
  // you can add some logging mechanism here e.g. Sentry]
  // console.log(error)
  throw error
}

export const generateAccessToken = (userId: number, userRole: string) => {
  const accessToken = sign(
    {
      userId,
      userRole,
      type: tokens.access.name,
      timestamp: Date.now(),
    },
    APP_SECRET,
    {
      expiresIn: tokens.access.expiry
    }
  )
  return accessToken
}

export const prisma = new PrismaClient()
const pubsub = new PubSub()

export const createContext = (ctx: any): Context => {
  let userId: number
  let userRole: string
  try {
    let Authorization = ''
    try {
      // for queries and mutations
      Authorization = ctx.req.get('Authorization')
    } catch (e) {
      // specifically for subscriptions as the above will fail
      Authorization = ctx?.connection?.context?.Authorization
    }
    const token = Authorization.replace('Bearer ', '')
    const verifiedToken = verify(token, APP_SECRET) as Token

    if (!verifiedToken.userId && verifiedToken.type !== tokens.access.name) 
      userId = -1 
    else 
      userId = verifiedToken.userId
      userRole = verifiedToken.userRole
  } catch (e) {
    userId = -1
  }

  return {
    ...ctx,
    prisma,
    pubsub,
    userId,
    userRole
  }
}