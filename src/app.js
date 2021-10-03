import app from './server'
import {graphqlHTTP} from 'express-graphql'
import {buildSchema} from "graphql";
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config();

app.set('PORT', process.env.PORT || 8000)

const EVENTS = []

app.use('/graphql', graphqlHTTP({
	schema: buildSchema(`
		
		type Event {
			_id: ID!
			title: String!
			description: String!
			price: Float!
			date: String!
		}
		
		input EventInput {
			title: String!
			description: String!
			price: Float!
			date: String!
		}
	
		type RootQuery {
			events: [Event!]!
		}
		
		type RootMutation {
			createEvent(
				eventInput: EventInput	
			) : Event
		}	
		
		schema {
			query: RootQuery
			mutation: RootMutation
		}
	`),
	rootValue: {
		events: () => {
			return EVENTS
		},
		createEvent: (args) => {
			const event = {
				_id: Math.random().toString(),
				title: args.eventInput.title,
				description: args.eventInput.description,
				price: +args.eventInput.price,
				date: args.eventInput.date
			}
			console.log(args)
			EVENTS.push(event)
			return event
		}
	},
	graphiql: true
}))


mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.xsr5j.mongodb.net/bookshop?retryWrites=true&w=majority`)
	.then(() => app.listen(app.get('PORT'), ()=> {
		console.log(`Server running on port ${app.get('PORT')} and database is connected`);
	}))
	.catch((error) => console.error(error))

