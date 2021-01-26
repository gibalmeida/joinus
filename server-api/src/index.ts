import { server } from './server'

const PORT = process.env.PORT || 4000

server.listen({ port: PORT}).then(({ url, subscriptionsUrl }) => {
  console.log(`🚀 Server ready at ${url}`)
  console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`)
})