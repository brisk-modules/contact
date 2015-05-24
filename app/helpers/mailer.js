var fs = require("fs"),
	brisk = require("brisk"),
	hbs = require("hbs"),
	nodemailer = require('nodemailer'),
	ses = require('nodemailer-ses-transport'),
	//
	Main = brisk.getClass("main");


var helper = Main.extend({

	options: {
		user: {},
		region: "us-east-1"
	},

	data: {}, // convert this to a model?

	init: function( site ){
		// site is not optional in this version...
		this.site = site;
		// load messages (once?)
		this.data.register = {
			text: loadFile( this.site._findFile( "app/views/email-contact" ) +".txt" ),
			html: loadFile( this.site._findFile( "app/views/email-contact" ) +".html" )
		}
	},

	submit: function( data, cb ){
		// fallbacks
		var data = data || {};
		var cb = cb || function(){};
		// variables
		var user = {};
		var site = this.site.loadConfig('site');
		// get user details
		user.name = data.name || "User";
		user.email = data.email || false;
		message = data.message || "";
		// prerequisites
		if( !user.email || !message ) return; // all other fields are non-breaking?

		// Create a Direct transport object
		//var transport = nodemailer.createTransport("Direct", {debug: true});
		// Create an Amazon SES transport object
		var transport = nodemailer.createTransport(ses({
			accessKeyId: this.site.config.api.aws.key,
			secretAccessKey: this.site.config.api.aws.secret
			//region: "us-east-1" // option?
		}));

		// Message object
		var message = {

			// sender info
			from: site.name +' <'+ site.email +'>',

			// Comma separated list of recipients
			to: site.name +' <'+ site.email +'>',

			// Subject of the message
			subject: site.name +': New Feedback', //

			// plaintext body
			text: this.data.register.text({ user: user, message: message, site: site }),

			// HTML body
			html: this.data.register.html({ user: user, message: message, site: site }),

			// An array of attachments
			//attachments:[]
		};

		//console.log('Sending Mail', message);

		transport.sendMail(message, function(error, response){
			if(error){
				console.log('Error occured');
				console.log(error.message);
				return cb( error );
			}else{
				//console.log(response);
				//console.log('Message sent successfully!');
				return cb(null, true); // success
			}

		});

	},

	self: function() {
		//return this;
	},


});

// Helpers

function loadFile( file ){
	var string = fs.readFileSync( file, "utf8");
	var template = hbs.compile( string );
	return template;
}


module.exports = helper;
