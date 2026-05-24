const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    title:  {type: String, required: true, trim: true},
    amount: {type: Number, required: true, min:1},
    category: {
        type: String,
        enum: ['food', 'transport', 'shopping', 'health', 'entertainment', 'other'],
        required: true
    },
    date: {type: Date, required: true}
}, {timestamps: true});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;