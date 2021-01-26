import * as Users from './User'
import * as Departments from './Department'
import * as Jobs from './Job'

export const Mutation = {
  ...Users,
  ...Jobs,
  ...Departments
}