var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
//var Users 		 = require('./app/models/users');
//var Artwork 	 = require('./app/models/artwork');

var patronVoteSchema   = new Schema({
	patronId: String,
	yVote: Number,
	nVote: Number
	
});

module.exports = mongoose.model('PatronVote', patronVoteSchema);