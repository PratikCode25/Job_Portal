const courseModel = require('../model/courseModel');
const mongoose = require('mongoose');

const courseRepositories = {

    findCourseByname: async (name) => {
        return await courseModel.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } })
    },

    addCourse: async (data) => {
        const { name, educationLevel } = data;
        const course = new courseModel({
            name,
            educationLevel
        })
        await course.save();
        return course;
    },

    getAllCourses: async () => {
        return await courseModel.find({});
    },

    getCourseById: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await courseModel.findById(id);
    },

    updateCourse: async (id, data) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const { name, educationLevel } = data;
        return await courseModel.findByIdAndUpdate(id, { name, educationLevel }, { new: true, runValidators: true });
    },

    deleteCourse: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await courseModel.findByIdAndDelete(id);
    },

    getCoursesByEducationLevel:async(level)=>{
        return await courseModel.find({educationLevel:level})
    }
}

module.exports = courseRepositories