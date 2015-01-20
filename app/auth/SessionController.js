Session = function(userID){
	this.userID = userID;
}

exports = module.exports = {
	login: function(req, userID){
		req.auth.session.set({
			'userID': userID
		});
	},
	logoff: function(req){
		req.auth.session.clear();
	}
}