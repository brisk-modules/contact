var brisk = require("brisk"),
	ccap = require("ccap"),
	Parent = brisk.getBaseController("main"),
	Mailer = require("../../index").getHelper("mailer");

// data
var captchas = [];

var controller = Parent.extend({
	name: "contact",

	options: {
		private: ["onError", "onSend"] // list of inaccessible methods
	},

	index : function(req, res){

		if( !this.isAuthenticated(req, res) ) return res.redirect('/');
		//
		res.view = "contact";
		this.render( req, res );

	},

	captcha: function(req, res){

		// initiate new capcha
		var captcha = ccap();
		var data = captcha.get();

		// only allow upto 100 simultaneous captchas (to preserve memory)
		if( captchas.length > 100 ) captchas.shift();

		// add first param in the list of captcha's
		captchas.push( data[0] );

		// return the second param (image blob)
		res.end( data[1] );

	},

	// login to an existing account
	submit: function(req, res){

		switch( req.method ){
			case "POST":
				// verify captcha
				var valid = verifyCaptcha( req.body );
				// exit now
				if( !valid ) {
					this._onError(req, res);
					return res.redirect('/');
				}
				// get data
				var data = getData( req.body );
				// send the email
				var mailer = new Mailer( req.site );
				mailer.submit( data );
				// wait for submission?
				// trigger event
				this._onSend(req, res);
				// redirect to homepage..
				res.redirect('/');
			break;
			default:
				// else redirect to the homepage
				return res.redirect('/');
			break;
		}

	},


	// if the validation fails...
	onError: function(req, res){
	},

	// when we have a successful submission
	onSend: function(req, res){
	},

	// private
	_onError: function(req, res){
		// display an error message...
		// supporting flash middleware
		this.alert = alerts( req, res );
		this.alert("error", "There was a problem with your input");
		// user actions
		this.onSend(req, res);
	},

	_onSend: function(req, res){
		// display an error message...
		// supporting flash middleware
		this.alert = alerts( req, res );
		this.alert("success", "Your message has been sent successfully");
		// user actions
		this.onSend(req, res);
	}

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

function verifyCaptcha( post ){
	//get index of submitted captcha
	var i = captchas.indexOf( post.captcha );
	if( i > -1 ){
		// delete captcha from list
		delete captchas[i];
		return true;
	}
	return false;
}

module.exports = controller;
