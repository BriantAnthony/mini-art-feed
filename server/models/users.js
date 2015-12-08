var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
	id: {type:String, select: false},
	name: String,
	email: String,
	password: {type: String, select: false},
	userClass: {type: String},
	createTimestamp: {type:Date, default:Date.now},
	profileImg: String,
	thumbnail: String,
	brand: String,
	//city: String,
	//state: String,
	//country: String,
	yVotes: {type:Number, default:0},
	nVotes: {type:Number, default:0},
	friendships: [{
		id: String,
		state: String,
		_id: {type:String, select:false},
		name: String
	}],
	collections: [{
		artId: String,
		img: String,
		collectionName: {type:String, default:'Untitled'},
		title: String,
		artist: String,
		genre: String,
		subject: String,
		acquired: {type:Date, default:Date.now}
		//patronage: Number
	}],
	patronScore: {type:Number, default:0}
	
});

module.exports = mongoose.model('Users', UserSchema);