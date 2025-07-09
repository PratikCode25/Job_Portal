const mongoose = require('mongoose');

const specializationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }
}, { timestamps: true })

module.exports = mongoose.model('Specialization', specializationSchema);