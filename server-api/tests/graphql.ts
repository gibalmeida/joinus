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