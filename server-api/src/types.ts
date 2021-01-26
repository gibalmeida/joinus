import { PrismaClient } from '@prisma/client'
import { PubSub } from 'apollo-server'
import { Request, Response } from 'express'

export interface Context {
  prisma: PrismaClient
  req: Request
  res: Response
  pubsub: PubSub
  userId: number
  userRole: string
}

export interface Token {
  userId: number
  userRole: string
  type: string
  timestamp: number
}