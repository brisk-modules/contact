var _ = require('underscore'),
	async = require("async"),
	brisk = require("brisk"),
	bcrypt = require("bcrypt"),
	Parent = brisk.getBaseController("main"),
	Mailer = require("../../index").getHelper("contact-mailer");


var controller = Parent.extend({
	name: "account",

	options: {
		assets: [], // list of models related with users
		private: ["onSend"] // list of inaccessible methods
	},

	index : function(req, res){

		if( !this.isAuthenticated(req, res) ) return res.redirect('/');
		//
		res.view = "contact";
		this.render( req, res );

	},

	// login to an existing account
	submit: function(req, res){

		switch( req.method ){
			case "POST":
				// get data
				var data = getData( c );
				// send the email
				var mailer = new Mailer( req.site );
				mailer.submit( data );
				// wait for submission?
				// trigger event
				this._onSend(req, res);
				// redirect to homepage..

			break;
			default:
				// else redirect to the homepage
				return res.redirect('/');
			break;
		}

	},


	// prompt the user to complete the authentication
	onSend : function(req, res){
	},

	// private
	_onSend : function(req, res){
		// display an error message...
		// supporting flash middleware
		this.alert = alerts( req, res );
		this.alert("success", "Your message has been sent successfully.");

		this.onSend(req, res);
	},

});


// Helpers

function alerts( req, res ){
	// thisis the method used to alert messages during validation...
	return function( type, message ){
		// support flash middleware
		if( req.flash ) req.flash(type, message);
	}
}

function getData( post ){
	var data = post;
	// error control...
	//  filter
	return data;
}



module.exports = controller;
