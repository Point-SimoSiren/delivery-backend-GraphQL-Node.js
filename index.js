const { ApolloServer, UserInputError, gql } = require('apollo-server')
const jwt = require('jsonwebtoken')

const mongoose = require('mongoose')

const User = require('./models/user')
const Category = require('./models/category')
const Item = require('./models/item')
const Order = require('./models/order')

mongoose.set('useFindAndModify', false)

const MONGODB_URI = 'mongodb+srv://sirensimo7:Simppa12345@simozon.e2242.mongodb.net/deliveryapp?retryWrites=true&w=majority'

const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'

mongoose.set('useCreateIndex', true)

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

//---Type definitions------------------

const typeDefs = gql`
  type User {
    username: String!
    name: String!
    address: String!
    phone: String!
    isAdmin: Boolean!
    orders: [Order]
    id: ID
  }

  type Item {
    title: String!
    package: String!
    price: Float!
    description: String!
    manufacturer: String!
    category: Category!
    items: [Item]
    id: ID
  }

  type Order {
    delivered: Boolean!
    deliveredAt: String
    orderedAt: String!
    phone: String!
    totalPrice: Float!
    notes: String
    items: [Item]
    id: ID
  }

  type Token {
    value: String!
  }

  type Category {
    name: String!
    description: String
    id: ID!
  }


  type Query {
    userCount: Int
    categoryCount: Int
    myInfo: User!
    allUsers: [User!]!
    allCategories: [Category!]!
    findCategory(name: String!): Category
    findUser(name: String!): User
  }

  type Mutation {
    addCategory(
      name: String!
      description: String
    ): Category
    editCategory(
      name: String!
      description: String
    ): Category 
    addUser(
      username: String!
      name: String!
      address: String!
      phone: String!
      isAdmin: Boolean!
    ): User
    editUser(
      username: String!
      name: String!
      address: String!
      phone: String!
      isAdmin: Boolean!
    ): User 
    login(
      username: String!
      password: String!
    ): Token 
  }  

  type Subscription {
    categoryAdded: Category!
    userAdded: User!
  }   
`
const { PubSub } = require('apollo-server')
const pubsub = new PubSub()

//---------------RESOLVERS-------------------

const resolvers = {
  Query: {
    userCount: () => User.collection.countDocuments(),
    categoryCount: () => Category.collection.countDocuments(),

    allUsers: (root, args) => {
      return User.find({})
    },
    allCategories: (root, args) => {
      return Category.find({})
    },

    findUser: (root, args) => User.findOne({ name: args.name }),

    myInfo: (root, args, context) => {
      return context.currentUser
    },

    findCategory: (root, args) => Category.findOne({ name: args.name }),

  },


  Mutation: {
    addCategory: async (root, args, context) => {
      const category = new Category({ ...args })

      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      try {
        await category.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      pubsub.publish('CATEGORY_ADDED', { categoryAdded: category })

      return category
    },

    addUser: async (root, args, context) => {
      const user = new User({ ...args })

      const currentUser = context.currentUser

      if (!currentUser || currentUser.isAdmin === false) {
        throw new AuthenticationError("not authenticated")
      }

      try {
        await user.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      pubsub.publish('USER_ADDED', { userAdded: user })

      return user
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secret') {
        throw new UserInputError("wrong credentials")
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },

  },
  Subscription: {
    categoryAdded: {
      subscribe: () => pubsub.asyncIterator(['CATEGORY_ADDED'])
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )

      const currentUser = await User
        .findById(decodedToken.id)

      return { currentUser }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})