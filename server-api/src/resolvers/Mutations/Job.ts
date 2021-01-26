import { extendType } from "nexus";

export const job = extendType({
  type: 'Mutation',
  definition(t) {
    t.crud.createOneJob({ alias: 'createJob' })

    t.crud.deleteOneJob({ alias: 'deleteJob' })

    t.crud.updateOneJob({ alias: 'updateJob' })
  }
})