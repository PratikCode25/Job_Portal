const locationModel = require("../model/locationModel");
const mongoose = require('mongoose');

const locationRepositories = {
    addLocation: async (data) => {
        const { name, normalized } = data;
        const location = new locationModel({
            name,
            normalized
        })
        await location.save();
        return location;
    },

    getAllLocations: async () => {
        return await locationModel.find({}).select('name');

    },

    findLocationByNormalizedName: async (normalizedName) => {
        return await locationModel.findOne({ normalized: normalizedName })
    },

    getLocationById: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await locationModel.findById(id);
    },

    updateLocation: async (id, data) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const { name, normalized } = data;
        return await locationModel.findByIdAndUpdate(id, { name, normalized }, { new: true, runValidators: true });
    },

    deleteLocation: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await locationModel.findByIdAndDelete(id);
    },

    searchLoationByNormalizedName: async (data) => {

        const locations = await locationModel.find({
            normalized: { $regex: data, $options: 'i' }
        }).limit(10);

        return locations;
    },

    findLocationsByIds: async (locationIds) => {
        return await locationModel.find({ _id: { $in: locationIds } });
    }

}

module.exports = locationRepositories;