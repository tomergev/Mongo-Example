const router = require('express').Router();
const reservationsController = require('../controllers/reservations.controller')();
const usersHelper = require('../helpers/usersHelper')()

module.exports = router


// api route ===========================================================

router.get('/getVehiclesDateRangeUsageTime', usersHelper.validateAccessRights([ "management", "superuser"]), reservationsController.getVehiclesDateRangeUsageTime)