import { Department, Job, User, Role } from '@prisma/client'
import {
  NexusGenArgTypes,
  NexusGenFieldTypes,

} from '../src/generated'
import { createJobMutation, deleteJobMutation, updateJobMutation } from './graphql'
import {
  createAdminUser,
  createApplicantUser,
  createDepartment,
  createJob,
  createTestContext,
  createUser,
  login,
} from './__helpers'

type Mutation = NexusGenFieldTypes['Mutation']
type CreateJobArgTypes = NexusGenArgTypes['Mutation']['createJob']
type UpdateJobArgTypes = NexusGenArgTypes['Mutation']['updateJob']
type DeleteJobArgTypes = NexusGenArgTypes['Mutation']['deleteJob']

const ctx = createTestContext()

let admin: User, applicant: User, managerOne: User,  managerTwo: User
let managerOneDepartment: Department, managerTwoDepartment: Department
let jobDepartmentOne: Job
let jobDepartmentTwo: Job


async function requestCreateJob(data: CreateJobArgTypes): Promise<Job> {
  const result = await ctx.client.request<
    Mutation,
    CreateJobArgTypes
  >(createJobMutation, data )
  return result.createJob
}

async function requestCreateTestJob(): Promise<Job> {
  return requestCreateJob({
    data: {
      name: 'A Job',
      description: 'The job description',
    }
  })
}

async function requestUpdateJob(args: UpdateJobArgTypes) {
  const result = await ctx.client.request<Mutation,UpdateJobArgTypes>(updateJobMutation,args)
  return result.updateJob
}

async function requestUpdateJobTest() {
  return requestUpdateJob({ 
    data: {
      name: { set: "New Job Test"} 
    },
    where: {id: jobDepartmentOne.id}
  })
}

async function requestDeleteJob(args: DeleteJobArgTypes) {
  const result = await ctx.client.request<Mutation,DeleteJobArgTypes>(deleteJobMutation, args)
  return result.deleteJob
}

beforeAll(async () => {
  admin = await createAdminUser(ctx)
  applicant = await createApplicantUser(ctx)

  managerOne = await createUser(ctx, {email:"manager1@test.com",password:"pa3454d",name:"Manager 1", role: Role.MANAGER}) 
  managerTwo = await createUser(ctx, {email:"manager2@test.com",password:"pa3454d",name:"Manager 2", role: Role.MANAGER})

  managerOneDepartment = await createDepartment(ctx, { 
    name: 'Manager\'s One Department',
    manager: {
      connect: {
        id: managerOne.id
      }
    }
  })

  managerTwoDepartment = await createDepartment(ctx, {
    name: 'Manager\'s Two Department',
    manager: {
      connect: {
        id: managerTwo.id,
      },
    },
  })

  jobDepartmentOne = await createJob(ctx, {
    name: "Job A on Department One",
    description: "A sample job on Department One",
    Department: {
      connect: {
        id: managerOneDepartment.id
      }
    }
  })

  jobDepartmentTwo = await createJob(ctx, {
    name: "Job B on Department Two",
    description: "A sample job on Department Two",
    Department: {
      connect: {
        id: managerTwoDepartment.id
      }
    }
  })

})

describe('with no user logged in', () => {
  test('should fail to create a job', async () => {
    await expect(requestCreateTestJob()).rejects.toThrow()
  })

  test('should fail to update a job', async () => {
    await expect(requestUpdateJobTest()).rejects.toThrow()
  })

  test('should fail to delete a job', async () => {
    await expect(requestDeleteJob({ 
      where: { 
        id: jobDepartmentOne.id
      }
    })).rejects.toThrow()
  })
})

describe('with applicant user logged in', () => {
  beforeAll(async () => {
    await login(ctx, applicant)
  })

  test('should fail create a job', async () => {
    await expect(requestCreateTestJob()).rejects.toThrow()
  })

  test('should fail to update a job', async () => {
    await expect(requestUpdateJobTest()).rejects.toThrow()
  })

  test('should fail to delete a job', async () => {
    await expect(requestDeleteJob({ 
      where: { 
        id: jobDepartmentOne.id
      }
    })).rejects.toThrow()
  })
})

describe('with manager user logged in', () => {

  beforeAll(async () => {
    await login(ctx, managerTwo)
  })

  test('should successfully create a job for his own department', async () => {
    const jobName = 'Job on Department Two'
    const jobDescription = 'Description for job on department two'
    const job = await requestCreateJob({ data: {
      name: jobName,
      description: jobDescription,
      Department: {
        connect: {
          id: managerTwoDepartment.id
        }
      }
    }})

    expect(job.name).toMatch(jobName)
    expect(job.description).toMatch(jobDescription)
    expect(job.departmentId).toEqual(managerTwoDepartment.id)
  })

  test('should fail to create a job for a department that the manager is owned by another manager', async () => {
    await expect(requestCreateJob({
      data: {
        name: "Job for other department",
        description: "Job description",
        Department: {
          connect: {
            id: managerOneDepartment.id
          }
        }
      }
    })).rejects.toThrow();
    
  })

  test('should fail to update a job that is connected with a department the manager doesn\'t is responsible for', async () => {
    await expect(requestUpdateJob({
      data: {
        name: { set: "New Job Name"},
        description: { set: "New Job Description"}
      },
      where: {
        id: jobDepartmentOne.id
      }
    })).rejects.toThrow()
  })

  test('should successfully update a job created by the manager', async () => {

    const jobNewName = "New Job Name for Department Two"
    const jobNewDescription = "New Job Description"
    const job = await requestUpdateJob({
      data: {
        name: { set: jobNewName },
        description: { set: jobNewDescription}
      },
      where: {
        id: jobDepartmentTwo.id
      }
    })

    expect(job.name).toMatch(jobNewName)
    expect(job.description).toMatch(jobNewDescription)
    
  })
  
  test('should fail to delete a job that is connected with a department the manager doesn\'t is responsible for', async () => {
    await expect(requestDeleteJob({
      where: {
        id: jobDepartmentOne.id
      }
    })).rejects.toThrow()
  })
  
  test('should successfully delete the job created by the manager', async () => {
    const job = await requestDeleteJob({ where: {id: jobDepartmentTwo.id}})

    expect(job.id).toEqual(jobDepartmentTwo.id)
  })
})

describe('with admin user logged in', () => {
  beforeAll(async () => {
    await login(ctx, admin)
  })

  test('should successfully create a job', async () => {
    const jobName = 'Job 3'
    const jobDescription = 'Job description 3'
    const job = await requestCreateJob({ data: {
      name: jobName,
      description: jobDescription,
      Department: {
        connect: {
          id: managerOneDepartment.id
        }
      }
    }})

    expect(job.name).toMatch(jobName)
    expect(job.description).toMatch(jobDescription)
    expect(job.departmentId).toEqual(managerOneDepartment.id)
  })

  test('should successfully update a job', async () => {
    const jobNewName = "New Job 3 Name"
    const jobNewDescription = "New Job 3 Description"
    const job = await requestUpdateJob({
      data: { 
        name: {set: jobNewName},
        description: {set: jobNewDescription}
      },
      where: {id: jobDepartmentOne.id }
    })

    expect(job.name).toMatch(jobNewName)
    expect(job.description).toMatch(jobNewDescription)
  })

  test('should delete a job', async () => {

    const job = await requestDeleteJob({
      where: {
        id: jobDepartmentOne.id
      }
    })
    
    expect(job.id).toEqual(jobDepartmentOne.id)
  })
})
