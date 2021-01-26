import { extendType } from "nexus"

export const department = extendType({
  type: 'Query',
  definition(t) {
    t.crud.departments({ filtering: true, ordering: true, pagination: true})
    t.crud.department()
  }
})