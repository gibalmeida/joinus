import { Department, Prisma, PrismaClient, Role, User, UserCreateArgs, UserCreateInput } from '@prisma/client'
import { ServerInfo } from 'apollo-server'
import { execSync } from 'child_process'
import getPort, { makeRange } from 'get-port'
import { GraphQLClient } from 'graphql-request'
import { nanoid } from 'nanoid'
import { join } from 'path'
import { Client } from 'pg'
import { hashPassword, prisma } from '../src/utils/helpers'
import { server } from '../src/server'
import { createUserMutation, loginMutation } from './graphql'
import { NexusGenArgTypes, NexusGenFieldTypes } from '../src/generated'

type TestContext = {
  client: GraphQLClient
  db: PrismaClient
}

export function createTestContext(): TestContext {
  let ctx = {} as TestContext
  const graphqlCtx = graphqlTestContext()
  const prismaCtx = prismaTestContext()

  beforeAll(async () => {
    const client = await graphqlCtx.before()
    const db = await prismaCtx.before()

    Object.assign(ctx, {
      client,
      db,
    })
  })

  afterAll(async () => {
    await graphqlCtx.after()
    await prismaCtx.after()
  })

  return ctx
}

function graphqlTestContext() {
  let serverInstance: ServerInfo | null = null

  return {
    async before() {
      const port = await getPort({ port: makeRange(5000, 6000) })

      serverInstance = await server.listen({ port })
      serverInstance.server.on('close', async () => {
        await prisma.$disconnect()
      })

      return new GraphQLClient(`http://localhost:${port}`)
    },
    async after() {
      serverInstance?.server.close()
    },
  }
}

function prismaTestContext() {
  const prismaBinary = join(__dirname, '..', 'node_modules', '.bin', 'prisma')
  let schema = ''
  let databaseUrl = ''
  let prismaClient: null | PrismaClient = null

  return {
    async before() {
      // Generate a unique schema identifier for this test context
      schema = `test_${nanoid()}`
      // Generate the pg connection string for the test schema
      databaseUrl = `postgres://joinus:AsTruf4x_p@localhost:5432/testing?schema=${schema}`

      // Set the required environment variable to contain the connection string
      // to our database test schema
      process.env.DATABASE_URL = databaseUrl

      // Run the migrations to ensure our schema has the required structure
      execSync(`${prismaBinary} migrate deploy --preview-feature`, {
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl,
        },
      })

      // Construct a new Prisma Client connected to the generated Postgres schema
      prismaClient = new PrismaClient()

      return prismaClient
    },
    async after() {
      // Drop the schema after the tests have completed
      const client = new Client({
        connectionString: databaseUrl,
      })
      await client.connect()
      await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
      await client.end()

      // Release the Prisma Client connection
      await prismaClient?.$disconnect()
    },
  }
}

type Credentials = NexusGenArgTypes['Mutation']['login']

export async function createUser(ctx: TestContext, data: Prisma.UserCreateInput) {

  const user = await ctx.db.user.create({
    data: {
      ...data,
      password: await hashPassword(data.password)
    }
  })

  return {...user, password: data.password}
}

export async function createAdminUser(ctx: TestContext): Promise<User> {
  const credentials: Credentials = {email: "admin@test.com", password: "P4ssw0rd"}

  return await createUser(ctx, {
      ...credentials,
      name: "Admin",
      role: Role.ADMIN
  })
}

export async function createApplicantUser(ctx: TestContext): Promise<User> {
  const credentials: Credentials = {email: "applicant@test.com", password: "p455w0rd"}

  return await createUser(ctx, {
    ...credentials,
    name: "Applicant",
    role: Role.APPLICANT
  })
}

export async function createManagerUser(ctx: TestContext): Promise<User> {
  const credentials: Credentials = {email: "manager@test.com", password: "pA55w_rd"}

  return await createUser(ctx, {
    ...credentials,
    name: "Manager",
    role: Role.MANAGER
  })
}

export async function createDepartment(ctx: TestContext, data: Prisma.DepartmentCreateInput) {

  return await ctx.db.department.create( { data } )

}

export async function createTestDepartment(ctx: TestContext) {
  return createDepartment(ctx, {
      name: "Test Department"
  })
}

export async function createJob(ctx: TestContext, data: Prisma.JobCreateInput) {
  return await ctx.db.job.create( { data } )
}

export async function createJobTest(ctx: TestContext) {
  return createJob(ctx, {
    name: "Job Test",
    description: "This is test job"
  })
}

export async function login(ctx: TestContext, credentials: Credentials) {
  const result = await ctx.client.request<NexusGenFieldTypes['Mutation'], Credentials>(loginMutation, credentials)

  if (!result.login.accessToken) {
    throw 'Authentication failed!'
  }

  ctx.client.setHeader( "authorization", `Bearer ${result.login.accessToken}`)
}