import { extendType } from "nexus";

export const department = extendType({
  type: 'Mutation',
  definition(t) {
    t.crud.createOneDepartment({
      alias: 'createDepartment',
      async resolve(root, args, ctx, info, originalResolve) {
        args = {
          ...args,
          data: {
            ...args.data
          },
        }
        const res = await originalResolve(root, args, ctx, info)
        return res
      }
    })

    t.crud.deleteOneDepartment( { alias: 'deleteDepartment' })
    t.crud.updateOneDepartment( { alias: 'updateDepartment' })
  }
})