export const createUser = /* GraphQL */ `
  mutation createUser($name: String, $email: String!, $password: String!) {
    signup(name: $name, email: $email, password: $password) {
      accessToken
      user{
        id
        name
      }
    }
  }
`