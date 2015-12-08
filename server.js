// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var mongoose   = require('mongoose');
var config     = require('./server/config/config');
var jwt        = require('jsonwebtoken'); // used to create, sign, and verify tokens
var Users      = require('./server/models/users');
var Artwork    = require('./server/models/artwork');
var Images     = require('./server/models/images');
var fs         = require('fs');
var cors       = require('cors');
var cloudinary = require('cloudinary');
var port 	   = process.env.PORT || 4250;        // set our port

// Configure Packages
// =============================================

// Database connection to mongoDB
mongoose.connect(config.database);

// configure app to use bodyParser()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser({uploadDir:'./uploads'}));

//Enabling CORS for all cross domain request
app.use(cors());

// use morgan to log request to the console
app.use(morgan('dev'));

app.use(express.static(__dirname + '/public'));

//Secrete Variable
app.set('superSecret', config.secret); // secret variable

// Configuring Cloudinary Image CDN
cloudinary.config({ 
  cloud_name: config.cloudinaryCloudName, 
  api_key: config.cloudinaryAPIkey, 
  api_secret: config.cloudinaryAPIsecret
});




// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

router.use(function(req, res, next) {
	// do logging
	console.log('Working...');
	next(); // make sure we go to the next routes and don't stop there
});

// test route to make sure everything is working (accessed at GET http://localhost:4000/api)
router.get('/', function(req, res) {
    res.json({ error: 'false', message: 'Hooray! Welcome to our api!' });   
});

// Authentication Routes
// Step One - Register Account (not authenticated yet)
// ======================================================================
router.route('/register')

.post(function(req, res){
	var user = new Users(); // create a new instance of the User model
	user.name = req.body.name;
	user.email = req.body.email;
	user.password = req.body.password;
	user.userClass = 'patron';

	Users.findOne({ email: user.email }, function(err, userMatch){
		if (err)
			throw err;
		if(userMatch){
			res.json({ success:false, message: 'A user with that email address already exists. Try logging in.'});
		} else if (!userMatch){
			user.save(function(err) {
				if (err)
					res.send(err);
				// create a token
				var token = jwt.sign(user, app.get('superSecret'), {
					expiresInMinutes: 1440 // expires in 24 hours
				});

				res.json({
					success: true, 
					message: 'User Successfully Created.', 
					data:user,
					token:token
				});
			});
		}
	});

});

// Authentication Routes
// Step One - Login (not authenticated yet)
// ======================================================================
router.route('/login')

.post(function(req, res) {
	Users.findOne({ email: req.body.email }).select('+password').exec(function(err, user) {
		if (err)
			throw err;

		if (!user) {
			res.json({ success: false, message: 'Authentication failed. User not found.'});
		} else if (user) {

			// check if password matches
			if (user.password != req.body.password) {
				res.json({ success: false, message: 'Authentication failed. Wrong Password'});
			} else {

				// if user is found and password is correct
				// create a token
				var token = jwt.sign(user, app.get('superSecret'), {
					expiresInMinutes: 1440 // expires in 24 hours
				});
				// userObject = {
				// 	email: user.email,
				// 	name: user.name,
				// 	yVotes: user.yVotes
				// }
				res.json({
					success: true,
					message: 'Successfully Authenticated.',
					data: user,
					token: token
				});
			}
		}	
	});
});

// Retrieve Password route
// ======================================
router.route('/getPassword')

.post(function(req, res) {

	Users.findOne({ email: req.body.email }).select('+password').exec(function(err, user){
		if (err)
			res.send(err);

		if (!user) {
			res.json({ success: false, message: 'Email not found.'});	
		} 
		else if (user){
			var pwd = user.password;
			res.json({ message: 'Password retrieved', data:pwd });
		}

		
	});
});

//route middleware to authenticate and check token
router.use(function(req, res, next) {

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.headers['x-access-token'];

	// decode token
	if (token) {

		// verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {
			if (err)
				return res.json({ success: false, message: 'Failed to authenticate token.'});
			else
				// if everything checks out good, save to request for use in other routes
				req.decoded = decoded;
		});
	} else {

		// if there is no token
		// return an error
		return res.json({ success: false, message: 'No token provided.'});
	}
	next();
});





// Verify authentication route
// ================================================
router.route('/check')

// returns decoded token
.get(function(req, res) {
	res.json(req.decoded);
});


// User Routes
//======================================================================
router.route('/users')

// Fetch all users
.get(function(req, res) {
	Users.find(function(err, users) {
		if (err)
			res.send(err);
		res.json({count:users.length, data:users});
	});

})

// routes that end in /users/:user_id
// =====================================================
router.route('/users/:user_id')

// Fetch an individual user by user_id
.get(function(req, res) {
	Users.findById(req.params.user_id, function(err, user) {
		if (err)
			res.send(err);
		res.json({data:user});
	});
})

// Update existing user's information
.put(function(req, res) {
	Users.findById(req.params.user_id, function(err, user) {
		if (err)
			res.send(err);
		user.name = req.body.name; // update the user name
		user.email = req.body.email;
		user.password = req.body.password;
		user.userClass = req.body.userClass;


		user.save(function(err) {
			if (err)
				res.send(err);
			res.json({ message: 'User Updated.', data:user });
		});
	});
})

.delete(function(req, res) {
	Users.remove({
		_id: req.params.user_id
	}, function(err, user) {
		if (err)
			res.send(err);
		res.json({message:'Successfully Deleted.'});
	});
});

// View Friendships
// ==========================================
router.route('/users/:user_id/friendships') 

// returns a user's friendship array
.get(function(req, res) {
	Users.findById(req.params.user_id, function(err, user) {
		if (err)
			res.send(err);
		res.json({ count:user.friendships.length, data:user.friendships});
	});
});

// Accept/Confirm Friendship
// =================================

	// Changes the frienship state from 'Pending' to 'Accepted'.
	// Code goes here

// Upload User Profile Pic
// ====================================
router.route('/users/:user_id/uploadProfile')

.post(function(req, res) {
	Users.findById(req.params.user_id, function(err, user) {
		if (err)
			res.send(err);

		console.log(req.files);

		// temporary location of the file
		var tmp_path = req.files.profileImg.path;

		// upload image to cloudinary
		cloudinary.uploader.upload(tmp_path, function(result) { 
			if (err) throw err;

		  console.log(result) 
		 user.profileImg = result.secure_url;

		 user.save(function(err, user, result) {
			if (err)
				res.send(err);

			// delete temp file, so the temp upload directory doesn't get filled with unwanted files
			fs.unlink(tmp_path, function() {
				if (err) throw err;
				res.json({message: 'Profile Uploaded Successfully.', data:user});
			});
			
		});

		});		

	});

});

// User Friend Connection
// (Closer in functionality to a follower, needs to allow distinction btw pending and accepted.)
// ==========================================
router.route('/users/:user_id/connect') //:user_id is the user initiating/sending the friendship

.post(function(req, res) {	

	// Finds the to: user receiving the friendship request
	Users.findById(req.body.user_id, function(err, user) {
		if (err)
			res.send(err);

		// Finds the from: user sending the friendship request
		Users.findById(req.params.user_id, function(err, iUser) {
			if (err)
				res.send(err);

			// Set object templates to push into both user's friendship array
			var recipientFriend = {id:req.params.user_id, state:'pending', name:iUser.name};
			var initialFriend = {id:req.body.user_id, state:'pending', name:user.name};

			// Pushing friendship objects into both user's friend arrays
			user.friendships.push(recipientFriend); // Pushes Object to the followers array
			iUser.friendships.push(initialFriend); // Pushes Object to the followers array

			iUser.save(); // updates initiating follower's user object

			// Saves userObject and return JSON response
			user.save(function(err) {
			if (err)
				res.send(err);

			//JSON response message
			res.json({ message: 'Friend Request Sent', to:user, from:iUser });
		});

		});// End of 2nd user findById (nested)

		
	}); // End of 1st user findById

});

// Accept Friend Request
// ===========================
router.route('/users/:user_id/acceptConnection') //:user_id is for the accepting/receiving user, not the user who sent the request

.post(function(req, res) {

	// Finds the accepting user
	Users.findById(req.params.user_id, function(err, iUser) {
		if (err)
			res.send(err);

		// Finds the replyTo: user, who sent the connection
		Users.findById(req.body.user_id, function(err, user) {
			if (err)
				res.send(err);

			// Set object templates to push into both user's friendship array. Accepting friend should have the replyTo friend's name in the object.
			var acceptFriend = {id:req.body.user_id, state:'accepted', name:user.name};
			var replyFriend = {id:req.params.user_id, state:'accepted', name:iUser.name};

			// Pusing friendship objects into both user's friendship arrays
			iUser.friendships.push(acceptFriend); // Wrong - should edit the object in the existing array - not push a new one
			user.friendships.push(replyFriend); // Wrong - should edit the object in the existing array - not push a new one

			// Saves the accepting user's object
			iUser.save(); // updates initiating follower's user object

			// Saves the replyTo user's object
			user.save(function(err) {
			if (err)
				res.send(err);
			res.json({ message: 'Friendship Accepted', acceptedBy:iUser, replyTo:user });
		});

		});// End of 2nd user findById (nested)

		
		
	}); // End of 1st user findById

});


// Randomized Artwork Route
// ====================================
router.route('/artwork/randomized')

.get(function(req, res) {
	Artwork.find(function(err, artwork) {
		if (err)
			res.send(err);

		var maxNumber = artwork.length;
		var randomNumber = Math.floor(Math.random() * maxNumber);

		res.json({ randomizedNumber:randomNumber, data:artwork[randomNumber] });

	});
});


// Artwork Routes
//------------------------------------------
router.route('/artwork')

// Get all artwork
.get(function(req, res) {
	Artwork.find(function(err, artwork) {
		if (err)
			res.send(err);
		res.json({count:artwork.length, data:artwork});
	});
})

// Upload new artwork
.post(function(req, res) {
	var art = new Artwork(); // create a new instance of the Artworks model
	art.title = req.body.title;
	art.style = req.body.style;
	art.genre = req.body.genre;
	art.tags = req.body.tags;

	// Find Artist by user_id
	Users.findById(req.body.user_id, function(err, artist){
		if (err)
			res.send(err);

		// Sets artist profile image and artist name inside the artwork object
		art.artistImg = artist.profileImg;
		art.artist = artist.name;

		art.save(function(err, art, result) {
			if (err)
				res.send(err);
			// temporary location of the file
		var tmp_path = req.files.artImg.path;
		console.log(req.files.artImg);

		// upload image to cloudinary
		cloudinary.uploader.upload(tmp_path, function(result) { 
			if (err) throw err;

		 console.log(result) 
		 art.img = result.secure_url;

		 art.save(function(err, art, result) {
			if (err)
				res.send(err);

			// delete temp file, so the temp upload directory doesn't get filled with unwanted files
			fs.unlink(tmp_path, function() {
				if (err) throw err;
			
			}); // end of fs.unlink
			
		}); // end of user.save()

		});	 // end of cloudinary

			console.log({message: 'Artwork Uploaded Successfully.', data:art});
			res.json({message: 'Artwork Updated Successfully.', data:art});
				//res.end();

		}); // end of user.save()

	}); // End of find by user_id
	
	


});

// Artwork Routes end with _id
// ========================================================
router.route('/artwork/:art_id')

.get(function(req, res) {
	Artwork.findById(req.params.art_id, function(err, art) {
		if (err)
			res.send(err);
		res.json({data:art});
	});
})

.delete(function(req, res) {
	Artwork.remove({
		_id: req.params.art_id
	}, function(err, art) {
		if (err)
			res.send(err);
		res.json({message:'Artwork Successfully Deleted.'});
	});
})

.put(function(req, res) {
	Artwork.findById(req.params.art_id, function(err, art) {
		if (err)
			res.send(err);
		art.title = req.body.title;
		art.artist = req.body.artist;
		art.style = req.body.style;
		art.genre = req.body.genre;
		var updatedTag = req.body.tags;
		art.tags.push(updatedTag);

		//Update timestamps -- eventually remove here and repurpose for time tracking votes and patron scores
		var artSnapshot = {yVotes:art.yVotes, nVotes:art.nVotes, patronScore:art.patronScore};
		art.updateTimestamps.push(artSnapshot);

		

		 art.save(function(err, art, result) {
			if (err)
				res.send(err);
				
			res.json({ message: 'Artwork Updated Successfully', data:art});
			
		}); // end of user.save()

	});
});

// Take snapshots Timestamps of all artwork
// ========================================

// Write Code, modeled after /api/artwork/:art_id .PUT , #update timestamps -- req.body input

// Upload Update Artwork Image
// =======================================
router.route('/artwork/:art_id/uploadArt')

.post(function(req, res) {
	Artwork.findById(req.params.art_id, function(err, art) {
		if (err)
			res.send(err);
		// temporary location of the file
		var tmp_path = req.files.artImg.path;
		console.log(req.files.artImg);

		// upload image to cloudinary
		cloudinary.uploader.upload(tmp_path, function(result) { 
			if (err) throw err;

		 console.log(result) 
		 art.img = result.secure_url;

		 art.save(function(err, art, result) {
			if (err)
				res.send(err);

			// delete temp file, so the temp upload directory doesn't get filled with unwanted files
			fs.unlink(tmp_path, function() {
				if (err) throw err;
				//res.writeHead(200, {'Content-Type': 'text/html'});
				//res.write('Code: '+code);
				//res.write('<script>setTimeout(function () { window.location.href = "http://localhost:8100"; }, 1000);</script>');
				//res.end();
				res.json({message: 'Artwork Updated Successfully.', data:art});
			}); // end of fs.unlink
			
		}); // end of user.save()

		});	 // end of cloudinary

	}); // end of Artwork.findById
}); // End of POST




// Alt upload Artwork Image
// ========================

router.route('/artwork/uploadArt')

.post(function(req, res) {
	// Artwork Id into the request body as {"_id": "xxxxxxxxxxxx"}
	Artwork.findById(req.body._id, function(err, art) {
		if (err)
			res.send(err);
		// temporary location of the file
		var tmp_path = req.body.artImg;

		// upload image to cloudinary
		cloudinary.uploader.upload(tmp_path, function(result) { 
			if (err) throw err;

		  console.log(result) 
		 art.img = result.secure_url;

		 art.save(function(err, art, result) {
			if (err)
				res.send(err);

			// delete temp file, so the temp upload directory doesn't get filled with unwanted files
			fs.unlink(tmp_path, function() {
				if (err) throw err;
				res.json({message: 'Artwork Updated Successfully.', data:art});
			}); // end of fs.unlink
			
		}); // end of user.save()

		});	 // end of cloudinary

	}); // end of Artwork.findById
}); // End of POST



// Collect Artwork
// ===========================
router.route('/artwork/:art_id/collect')

// Post with user_id and collectionName
.post(function(req, res) {
	Artwork.findById(req.params.art_id, function(err, art) {
		if (err)
			res.send(err);

		Users.findById(req.body.user_id, function(err, user) {
			if (err)
				res.send(err);
			var collectedArt = {ownerId:req.body.user_id, name:user.name, collectionName:req.body.collectionName};
			var artPatron = {artId:req.body.user_id, collectionName:req.body.collectionName, title:art.title, img:art.img, artist:art.artist, genre:art.genre, subject:art.subject};

			art.collectedBy.push(collectedArt); // Pushes Object to the Artwork's collectedBy array
			user.collections.push(artPatron); // Pushes Object to the User's collections array

			user.save(); // updates Art Patron's user object

			art.save(function(err) {
			if (err)
				res.send(err);
			res.json({ message: 'Artwork Acquired', artwork:art, patron:user });
		});

		});// End of Patron query (nested)

		
		
	}); // End of Artwork query
});

// Add Delete function below


// Yes Vote on Artwork
// ===========================
router.route('/artwork/:art_id/yesVote')

// Post with user_id and collectionName
.post(function(req, res) {
	Artwork.findById(req.params.art_id, function(err, art) {
		if (err)
			res.send(err);
		art.yVotes = art.yVotes+1;
		//art.patronScore = art.yVotes - art.nVotes;
		art.patronScore = (art.yVotes - art.nVotes)*10;

		Users.findById(req.body.user_id, function(err, user) {
			if (err)
				res.send(err);
			//var collectedArt = {ownerId:req.params.user_id, name:user.name, collectionName:req.body.collectionName};
			//var artPatron = {artId:req.body.user_id, collectionName:req.body.collectionName, title:art.title, artist:art.artist, genre:art.genre, subject:art.subject};

			//art.collectedBy.push(collectedArt); // Pushes Object to the Artwork's collectedBy array
			//user.collections.push(artPatron); // Pushes Object to the User's collections array
			user.yVotes = user.yVotes+1; 


			user.save(); // updates Art Patron's user object

			art.save(function(err) {
			if (err)
				res.send(err);
			res.json({ message: 'Yes Vote Casted', artwork:art, patron:user });
		});

		});// End of Patron query (nested)

		
		
	}); // End of Artwork query
});

// No Vote on Artwork
// ===========================
router.route('/artwork/:art_id/noVote')

// Post with user_id and collectionName
.post(function(req, res) {
	Artwork.findById(req.params.art_id, function(err, art) {
		if (err)
			res.send(err);
		art.nVotes = art.nVotes+1;
		art.patronScore = (art.yVotes - art.nVotes)*10;

		Users.findById(req.body.user_id, function(err, user) {
			if (err)
				res.send(err);
			//var collectedArt = {ownerId:req.params.user_id, name:user.name, collectionName:req.body.collectionName};
			//var artPatron = {artId:req.body.user_id, collectionName:req.body.collectionName, title:art.title, artist:art.artist, genre:art.genre, subject:art.subject};

			//art.collectedBy.push(collectedArt); // Pushes Object to the Artwork's collectedBy array
			//user.collections.push(artPatron); // Pushes Object to the User's collections array
			user.nVotes = user.nVotes+1; 

			user.save(); // updates Art Patron's user object

			art.save(function(err) {
			if (err)
				res.send(err);
			res.json({ message: 'No Vote Casted', artwork:art, patron:user });
		});

		});// End of Patron query (nested)

		
		
	}); // End of Artwork query
})




// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server running on port ' + port);