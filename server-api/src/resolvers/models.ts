import { enumType, objectType } from 'nexus'

export const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.email()
    t.model.role()
    t.model.createdAt()
  }
})

export const AuthPayload = objectType({
  name: 'AuthPayload',
  definition(t) {
    t.string('accessToken')
    t.field('user', { type: 'User'})
  },
})

export const Department = objectType({
  name: 'Department',
  definition(t){
    t.model.id()
    t.model.name()
    t.model.manager()
    t.model.managerId()
    t.model.jobs({
      type: 'Job'
    })
    t.model.createdAt()
    t.model.updatedAt()
  }
})

export const Job = objectType({
  name: 'Job',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.description()
    t.model.departmentId()
    t.model.Department()
    t.model.createdAt()
    t.model.updatedAt()
  }
})

export const Role = enumType({
  name: 'Role',
  members: [ 'ADMIN', 'MANAGER', 'APPLICANT'],
  description: 'The user role on the system.',
})