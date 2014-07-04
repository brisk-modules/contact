var fs = require("fs"),
	brisk = require("brisk"),
	hbs = require("hbs"),
	nodemailer = require('nodemailer'),
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

	submit: function( data ){

		var site = brisk.loadConfig('site');

		// check user details
		user = user || {};
		// fallback to options
		user.name = data.name || "Someone";
		user.email = data.email || false;
		message = data.message || "";
		// prerequisites
		if( !user.email || !message ) return; // all other fields are non-breaking?

		// Create a Direct transport object
		//var transport = nodemailer.createTransport("Direct", {debug: true});
		// Create an Amazon SES transport object
		var transport = nodemailer.createTransport("SES", {
			AWSAccessKeyID: this.site.config.api.aws.key,
			AWSSecretKey: this.site.config.api.aws.secret,
			ServiceUrl: "https://email."+ this.options.region +".amazonaws.com" // make this variable?
		});

		// Message object
		var message = {

			// sender info
			from: '"'+ user.name +'" <'+ user.email +'>',

			// Comma separated list of recipients
			to: site.name +' <'+ site.email +'>',

			// Subject of the message
			subject: site.name +': New Feedback', //

			// plaintext body
			text: this.data.register.text({ user: user, message: message }),

			// HTML body
			html: this.data.register.html({ user: user, message: message }),

			// An array of attachments
			attachments:[]
		};

		//console.log('Sending Mail', message);

		transport.sendMail(message, function(error, response){
			if(error){
				console.log('Error occured');
				console.log(error.message);
				return;
			}else{
				//console.log(response);
				console.log('Message sent successfully!');
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
