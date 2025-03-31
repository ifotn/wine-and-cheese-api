import mongoose from 'mongoose';

// create schema to store 2FA codes in the db for 10 minutes
const tempSessionSchema = new mongoose.Schema({
    username: { type: String, required: true },
    verificationCode: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '10m' }
});

// generate as mongoose model for CRUD & make public
const TempSession = mongoose.model('TempSession', tempSessionSchema);
export default TempSession;