var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ArtworkSchema   = new Schema({
	img: String,
	owner: String,
	title: String,
	artist: String,
	style: String,
	genre: String,
	tags: [String],
	yVotes: {type:Number, default:0},
	nVotes: {type:Number, default:0},
	patronScore: {type:Number, default:0},
	patronageChg: Number,
	collectedBy: [{
		ownerId: String,
		name: String,
		//patronScore: Number
		collectionName: {type:String, default:'Untitled'}
	}],
	createTimestamp: {type:Date, default:Date.now},
	updateTimestamps: [{
		date: {type:Date, default:Date.now}, 
		yVotes: Number, 
		nVotes: Number,
		patronScore: Number
	}],	
	
});

module.exports = mongoose.model('Artwork', ArtworkSchema);