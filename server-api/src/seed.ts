import { PrismaClient } from '@prisma/client'

async function  seed() {
  const prisma = new PrismaClient()
  
  const res = await prisma.user.create({
    data: {
      name: 'Administrator',
      password: 'password',
      email: 'admin@teste.com.br'
    }
  })

  console.log(res)

  const res2 = await prisma.user.create({
    data: {
      name: 'Common User',
      password: 'passwd123',
      email: 'user@teste.com.br'
    }
  })

  console.log(res)

  await prisma.$disconnect()
}

seed()