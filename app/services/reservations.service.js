const mongoose = require('mongoose');
const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
const usersHelper = require('../helpers/usersHelper')();

module.exports = reservationsService;

function reservationsService(options) {
    let Reservation

    if (!options.modelService) {
        throw new Error('Options.modelService is required');
    }

    Reservation = options.modelService;

    return {
        getVehiclesDateRangeUsageTime: getVehiclesDateRangeUsageTime
    }

    function getVehiclesDateRangeUsageTime(params, queryCondition) {
        let start = new Date(params.startDate)
        let endDate = new Date(params.endDate)

        let days = []
        for (let startDate = new Date(params.startDate); startDate <= endDate; startDate.setDate(startDate.getDate() + 1)) {
            let date = new Date(startDate)
            let momentDate = moment(date).add(1, 'd')
            let stringDate = momentDate.format('M-D-YYYY')
            days.push(stringDate);
        }

        let agencyId = queryCondition.agency
        let query = Reservation.aggregate()

        if (params.id) {
            query
                .match({
                    agency: mongoose.Types.ObjectId(agencyId),
                    reservationDate: {
                        $gte: start,
                        $lte: endDate,
                    },
                    vehicle: mongoose.Types.ObjectId(params.id)
                })
        }
        else {
            query
                .match({
                    agency: mongoose.Types.ObjectId(agencyId),
                    reservationDate: {
                        $gte: start,
                        $lte: endDate,
                    },
                })
        }
        return query
            .group({
                _id: {
                    vehicle: '$vehicle',
                    dayOfWeek: { $dayOfWeek: "$reservationDate" },
                    "date": {
                        "$concat": [
                            { "$substr": [{ "$month": "$reservationDate" }, 0, 2] }, "-",
                            { "$substr": [{ "$dayOfMonth": "$reservationDate" }, 0, 2] }, "-",
                            { "$substr": [{ "$year": "$reservationDate" }, 0, 4] }
                        ]
                    }
                },
                vehicleUsageTime: { $sum: '$expectedDuration' },
            })
            .lookup({
                from: "vehicles",
                localField: "_id.vehicle",
                foreignField: "_id",
                as: "_id.vehicle"
            })
            .group({
                _id: {
                    vehicle: '$_id.vehicle.name',
                },
                days: { $addToSet: "$_id.date" },
                values: { $push: { label: '$_id.date', value: '$vehicleUsageTime' } },
            })
            .project({ missingDays: { $setDifference: [days, "$days"] }, values: 1 })
            .unwind("$missingDays")
            .unwind("$values")
            .group({
                _id: "$_id",
                values: { $addToSet: { label: "$values.label", value: "$values.value" } },
                missingDays: { $addToSet: { label: "$missingDays", value: { $literal: 0 } } }
            })
            .project({ "_id": 0, "key": '$_id.vehicle', values: { $setUnion: ["$values", "$missingDays"] } })

    }
}