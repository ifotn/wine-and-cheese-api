import mongoose, { Mongoose } from "mongoose";

const cheeseSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0.01,
        max: 50
    },
    stinkRating: {
        type: Number,
    },
    category: {
        type: String,
        required: true
    }
});

const Cheese = mongoose.model('Cheese', cheeseSchema);
export default Cheese;
