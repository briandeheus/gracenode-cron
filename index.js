var gracenode = require('../gracenode');
var log       = gracenode.log.create('cron');
var jobs      = {};
var CronJob   = require('cron').CronJob;

/**
* Wrapper arround node-cron to make it work better with Gracenode.
* @constructor
* @param {string} time A cron-style time object, e.g 0 0 *\/1 * *
* @param {Date} time A JS date object e.g new Date()
*/
// there is a bug in cron module:
/*
 * when time is a Date object and there is no callback as the 2nd argument, cron module breaks
 * */
function Cron(time, cb) {

	this._cron = new CronJob(time, cb);

}

/**
* Set the time the cronjob should be executed.
* @param {string} time A cron-style time object, e.g 0 0 *\/1 * *
*/
Cron.prototype.setTime = function (time) {

	this._cron.setTime(require('cron').time(time));

};

/**
* Add a callback to be executed on each tick.
* @param {function} func Function to be executed 
*/
Cron.prototype.addCallback = function (func) {

	this._cron.addCallback(func);

};

/**
* Start the cronjob
*/
Cron.prototype.start = function () {

	this._cron.start();

};

/**
* Stop the cronjob and prevent the callback from being executed.
*/
Cron.prototype.stop = function () {

	this._cron.stop();

};

/**
* Get a date object with the next date of callback exection
* @returns {Date} date object
*/
Cron.prototype.getNextDate = function () {
	return this._cron.nextDate();
};

/**
* Get the amount of seconds remaining until the callback is being executed.
* @returns {int} seconds remaining
*/
Cron.prototype.getSecondsRemaining = function () {

	var now        = Math.floor(Date.now());
	var expiration = Math.floor(this._cron.nextDate());
	return expiration - now;

};

exports.readConfig = function (config) {


	if (!config) {
		return log.warning('CRON job module setup but no jobs scheduled');
	}
	
	for (var t in config) {

		var task    = config[t];
		var cronJob = new Cron(task.schedule);

		jobs[t] = cronJob;

	}

};

/**
* Return a Cron object.
* @param {string} name Name of the task
* @param {schedule} schedule* optional schedule if you're creating a new task that is not set in the config.
* @param {override} override* optional if true, the module discards the cached Cron object and creates a new
* @param {cb} cb* optional callback to be executed at the given schedule
* @returns {Cron} cron object.
*/
exports.create = function (name, schedule, override, cb) {
	
	if (jobs[name]) {
		if (override) {
			jobs[name].stop();
			delete jobs[name];
		} else {
			return jobs[name];
		}
	}

	if (!schedule) {
		throw new Error('scheduleExpectedForNewCronJob');
	}

	var cronJob = new Cron(schedule, cb);
	jobs[name]  = cronJob;

	return cronJob;

};
