const industryModel = require("../model/industryModel");
const mongoose = require('mongoose');

const industryRepositories = {
    addIndustry: async (data) => {
        const { name, normalized } = data;
        const industry = new industryModel({
            name,
            normalized
        })
        await industry.save();
        return industry;
    },

    getAllIndustries: async () => {
        return await industryModel.find({}).select('name');

    },

    findIndustryByNormalizedName: async (normalizedName) => {
        return await industryModel.findOne({ normalized: normalizedName })
    },

    getIndustryById: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await industryModel.findById(id);
    },

    updateIndustry: async (id, data) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const { name, normalized } = data;
        return await industryModel.findByIdAndUpdate(id, { name, normalized }, { new: true, runValidators: true });
    },

    deleteIndustry: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await industryModel.findByIdAndDelete(id);
    }

}

module.exports = industryRepositories;