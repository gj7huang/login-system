import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: { 
        type: String,
        required: [true, 'Email ID must be provided'],
        // validate: [ validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        index: { unique: true, dropDups: true },
        lowercase: true,
    },
    student_id: { 
        type: String, 
        required: [true, 'Student ID must be provided'],
        index: { unique: true, dropDups: true }
    },
    gender: { 
        type: String,
        enum: ['man', 'woman', 'other'],
        required: [true, 'Gender must be provided'] 
    },
    password: {
        type: String,
        required: [true, 'Password must be provided'],
    },
    token: { type: String, required: true },
    created_date: {
        type: Date,
        default: Date.now
    }
}, { versionKey: false });

module.exports = mongoose.model('user', userSchema);
