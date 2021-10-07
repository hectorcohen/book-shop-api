import app from './server'
import {graphqlHTTP} from 'express-graphql'
import {buildSchema} from "graphql";
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Event from './models/event';
import User from './models/user'

app.set('PORT', process.env.PORT || 8000)

app.use('/graphql', graphqlHTTP({
	schema: buildSchema(`
		
		type Event {
			_id: ID!
			title: String!
			description: String!
			price: Float!
			date: String!
		}
		
		type User {
			_id: ID!
			email: String!
			password: String!
		}
		
		input EventInput {
			title: String!
			description: String!
			price: Float!
			date: String!
		}
		
		input UserInput {
			email: String!
			password: String!
		}
	
		type RootQuery {
			events: [Event!]!
		}
		
		type RootMutation {
			createEvent(eventInput: EventInput) : Event
			createUser(userInput: UserInput): User
		}	
		
		schema {
			query: RootQuery
			mutation: RootMutation
		}
	`),
	rootValue: {
		events: () => {
			return Event.find().then(response => {
				return response.map(event =>  {
					return event
				})
			}).catch(error => {
				throw error
			})
		},
		createEvent: async(args) => {
			const event = new Event({
				title: args.eventInput.title,
				description: args.eventInput.description,
				price: +args.eventInput.price,
				date: new Date(args.eventInput.date),
				creator: '615cd0fc53cd7a4ce614c210'
			})

			let createdEvents;

			return event
				.save()
				.then((result) =>
				{
					createdEvents = result
						return User.findById('615cd0fc53cd7a4ce614c210')
				})
				.then(user => {
					if(user){
						throw new Error('User exists already')
					}

					user.createdEvents.push(event)
					return user.save();

				}).then((result) => {
					return createdEvents
				})
				.catch(error => {
				throw error
			})
		},
		createUser: async(args) => {
			try{
				const userFound = await User.findOne({email: args.userInput.email});
				if(userFound) {
					throw new Error('User exists already')
				}

				const newUser = new User({
					email: args.userInput.email,
					password: await User.encryptPassword(args.userInput.password)
				})

				const  userSaved = await newUser.save()

				return userSaved
			}catch (error) {
				throw new Error('User exists already')
			}

		}
	},
	graphiql: true
}))


mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.xsr5j.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
	.then(() => app.listen(app.get('PORT'), ()=> {
		console.log(`Server running on port ${app.get('PORT')} and database is connected`);
	}))
	.catch((error) => console.error(error))

