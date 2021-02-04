export const createUserMutation = /* GraphQL */ `
  mutation createUser($name: String, $email: String!, $password: String!) {
    signup(name: $name, email: $email, password: $password) {
      accessToken
      user{
        id
        name
        role
      }
    }
  }
`

export const loginMutation = /* GraphQL */ `
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
    }
  }
`

export const createDepartmentMutation = /* GraphQL */ `
  mutation createDepartment($data: DepartmentCreateInput!) {
    createDepartment(data: $data ) {
      id
      name
    }
  }
`

export const updateDepartmentMutation = /* GraphQL */ `
  mutation updateDepartment($where: DepartmentWhereUniqueInput!, $data: DepartmentUpdateInput! ) {
    updateDepartment(
      where: $where,
      data: $data
    ) {
      id
      name
      managerId
      manager {
        id
        name
        email
      }
    }
  }
`
export const deleteDepartmentMutation = /* GraphQL */ `
  mutation deleteDepartment($where: DepartmentWhereUniqueInput!) {
    deleteDepartment(
      where: $where
    ) {
      id
      name
    }
  }
`

export const createJobMutation = /* GraphQL */ `
  mutation createJob($data: JobCreateInput!) {
    createJob(
      data: $data
    ) {
      id
      name
      description
      departmentId
    }
  }
`

export const updateJobMutation = /* GraphQL */ `
  mutation updateJob($where: JobWhereUniqueInput!, $data: JobUpdateInput!) {
    updateJob(
      where: $where
      data: $data
    ) {
      id
      name
      description
      departmentId
    }
  }
`

export const deleteJobMutation = /* GraphQL */ `
  mutation deleteJob($where: JobWhereUniqueInput!) {
    deleteJob(
      where: $where
    ) {
      id
      name
    }
  }
`