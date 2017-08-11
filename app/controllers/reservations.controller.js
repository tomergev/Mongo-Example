const moment = require('moment');
const responses = require('../models/responses');
const path = require('path');
const apiPrefix = '/api/reservations';
const reservationModel = require('../models/reservation');
const searchesModel = require('../models/searches')
const reservationsService = require('../services/reservations.service')({
    modelService: reservationModel
});
const usersHelper = require('../helpers/usersHelper')();

module.exports = reservationsController;

function reservationsController() {
    return {
        getVehiclesDateRangeUsageTime: getVehiclesDateRangeUsageTime
    }

    function getVehiclesDateRangeUsageTime(req, res) {
        let params = req.query;
        let queryCondition = {
            agency: usersHelper.getAgencyId(req, res),
        };

        let query = reservationsService.getVehiclesDateRangeUsageTime(params, queryCondition).exec();
        query
            .then((reservations) => {
                const responseModel = new responses.ItemsResponse();
                responseModel.items = reservations;
                res.json(responseModel);
            })
            .catch((err) => {
                res.status(500).send(new responses.ErrorResponse(err));
            });
    }
}