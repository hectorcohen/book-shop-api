import {Schema, model} from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new Schema({
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	createdEvents: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Event'
		}
	]
})

userSchema.statics.encryptPassword = async(password) => {
	const salt = await 	bcrypt.genSalt(10)
	return await bcrypt.hash(password, salt)
}

userSchema.statics.comparePassword = async(password, recivedPassword) => {
	return await bcrypt.compare(password, recivedPassword)
}

export default model('User',  userSchema)