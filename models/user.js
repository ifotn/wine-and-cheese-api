import mongoose from "mongoose";
// this model should inherit from passport-local-mongoose
// it's a special model for user mgmt NOT a regular model
import passportLocalMongoose from 'passport-local-mongoose';

// passport handles password validation - OMIT from schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minLength: 8
    },
    password: {
        type: String
    }
});

// inherit from / extend passport local mongoose to get all properties and methods (e.g. register())
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);
export default User;