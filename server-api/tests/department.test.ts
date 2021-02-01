import { Department, User } from '@prisma/client'
import { NexusGenArgTypes, NexusGenFieldTypes } from '../src/generated'
import { createTestContext, createAdminUser, createApplicantUser, createManagerUser, login, createTestDepartment } from './__helpers'
import { createDepartmentMutation, deleteDepartmentMutation, updateDepartmentMutation } from './graphql'

type mutationFieldTypes = NexusGenFieldTypes['Mutation']
type createDepartmentArgTypes = NexusGenArgTypes['Mutation']['createDepartment']
type updateDepartmentArgTypes = NexusGenArgTypes['Mutation']['updateDepartment']

const ctx = createTestContext()

let admin: User
let applicant: User
let manager: User
let testDepartment: Department

async function createDepartmentWithoutManager() {
  return ctx.client.request<mutationFieldTypes,createDepartmentArgTypes>(createDepartmentMutation, {data: { name: "Department A"}})
}

async function updateTestDepartmentName(newName: string) {
  const { updateDepartment } = await ctx.client.request<mutationFieldTypes,updateDepartmentArgTypes>(updateDepartmentMutation, { 
    data: { 
      name: { 
        set: newName 
      }},
      where: {
        id: testDepartment.id
      }
    }
  )

  return updateDepartment
}

async function connectDepartmentWithManager(department: Department, manager: User ) {
  const { updateDepartment } = await ctx.client.request<mutationFieldTypes,updateDepartmentArgTypes>(updateDepartmentMutation, {
    where: {
      id: department.id
    },
    data: {
      manager: {
        connect: {
         id: manager.id
        }
      }
    }
  })

  return updateDepartment
}

async function deleteDepartment(id: number) {
  const { deleteDepartment } = await ctx.client.request<
    mutationFieldTypes,
    NexusGenArgTypes['Mutation']['deleteDepartment']
  >(deleteDepartmentMutation, {where: {id: id}} )

  return deleteDepartment
}

beforeAll( async() => {
  admin = await createAdminUser(ctx)
  applicant = await createApplicantUser(ctx)
  manager = await createManagerUser(ctx)
  testDepartment = await createTestDepartment(ctx)
})

describe('with no user logged in', () => {
  test('should unsuccesfully create a department', async () => {
    await expect(createDepartmentWithoutManager).rejects.toThrow()
  })

  test('should unsuccessfully update a department', async () => {
    await expect(updateTestDepartmentName('New Dept. Name')).rejects.toThrow()    
  })

  test('should unsuccessfully delete a department', async () => {
    await expect(deleteDepartment(testDepartment.id)).rejects.toThrow()    
  })
  
  
})

describe('with an applicant user logged in', () => {

  beforeAll( async() => {
    await login(ctx, applicant)
  })

  test('should unsuccessfully create a department', async () => {
    await expect(createDepartmentWithoutManager).rejects.toThrow()
  })

  test('should unsuccessfully update a department', async () => {
    await expect(updateTestDepartmentName('New Dept. Name')).rejects.toThrow()    
  })

  test('should unsuccessfully delete a department', async () => {
    await expect(deleteDepartment(testDepartment.id)).rejects.toThrow()    
  })

  
})

describe('with an manager user logged in', () => {

  beforeAll( async () => {
    await login(ctx, manager)
  })

  test('should unsuccessfully create a department', async () => {
    await expect(createDepartmentWithoutManager).rejects.toThrow()
  })

  test('should unsuccessfully update a department', async () => {
    await expect(updateTestDepartmentName('New Dept. Name')).rejects.toThrow()    
  })

  test('should unsuccessfully delete a department', async () => {
    await expect(deleteDepartment(testDepartment.id)).rejects.toThrow()    
  })

})

describe('with an administrator user logged in', () => {

  beforeAll( async () => {
    await login(ctx, admin)
  })

  test('should successfully create a department', async () => {

    const { createDepartment } = await createDepartmentWithoutManager()

    expect(createDepartment.id).toBeDefined()
    expect(createDepartment.name).toBeDefined()
  })

  test('should successfully update a department name', async () => {

    const newName = "New Department Name"
    
    expect((await updateTestDepartmentName(newName)).name).toMatch(newName)
  })

  test('should connect a department with a manager', async () => {

    const department = connectDepartmentWithManager(testDepartment, manager)

    expect((await department).managerId).toEqual(manager.id)
    
  })
  
  
  test('should successfully delete a department', async () => {

    expect((await deleteDepartment(testDepartment.id)).id).toEqual(testDepartment.id)
  })
  
})