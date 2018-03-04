let User = require('../models/user')
let OAuthClient = require('../models/oAuthClient')
let OAuthAccessToken = require('../models/oAuthAccessToken')
let OAuthAuthorizationCode = require('../models/oAuthAuthorizationCode')
let OAuthRefreshToken = require('../models/oAuthRefreshToken')

let getAccessToken = (bearerToken) =>{
  return OAuthAccessToken
  	.findOne({acess_token: bearerToken})
  	.populate('User')
  	.populate('OAuthClient')
  	.then(function(accessToken){
  		console.log('at', acessToken)
  		if(!acessToken) return false;
  		let token = accessToken;
  		token.user = token.User;
  		token.client = token.OAuthClient;
  		token.scope = token.scope
  		return token;
  	})
  	.catch(function(err){
  		console.log("getAccessToken - Err: ")

  	})
}

let getClient=(clientId, clientSecret)=>{
	const options = {client_id: clientId};
	if (clientSecret) options.client_secret = clientSecret;

	return OAuthClient
		.findOne(options)
		.then(function (client){
			if(!client) return new Error("client not found");
			var clientWithGrants = client
			clientWithGrants.grants =  ['authorization_code', 'password', 'refresh_token', 'client_credentials']
			// TODO need to create another table for redirect URIs
			clientWithGrants.redirectUris =  [clientWithGrants.redirect_uri]
			delete clientWithGrants.redirect_uri
			//clientWithGrants.refreshTokenLifetime = integer optional
     		//clientWithGrants.accessTokenLifetime  = integer optional
     		return clientWithGrants
		}).catch(function (err){
			console.log("getClient - Err: ", err)
		})
}

let getUser= (username, passowrd)=>{
	return User
		.findOne({username: username})
		.then(function (user){
			return user.password === password ? user : false
		})
		.catch(function(err){
			console.log("getUser - Err: ", err)
		})
}

let revokeAuthorizationCode = (code) =>{
	return OAuthAuthorizationCode.findOne({
		where: {
			authorization_code: code.code
		}
	}).then(function(rCode){
		//if(rCode) rCode.destroy();
	    /***
	     * As per the discussion we need set older date
	     * revokeToken will expected return a boolean in future version
	     * https://github.com/oauthjs/node-oauth2-server/pull/274
	     * https://github.com/oauthjs/node-oauth2-server/issues/290
	     */
	     let expiredCode = code
	     expiredCode.expiresAt = new Date('2015-05-28T06:59:53.000Z')
	     return expiredCode
	}).catch(function(err){
		console.log("getUser - Err: ", err)
	});
}

let revokeToken = token => {
  return OAuthRefreshToken.findOne({
    where: {
      refresh_token: token.refreshToken
    }
  }).then(function (rT) {
    if (rT) rT.destroy();
    /***
     * As per the discussion we need set older date
     * revokeToken will expected return a boolean in future version
     * https://github.com/oauthjs/node-oauth2-server/pull/274
     * https://github.com/oauthjs/node-oauth2-server/issues/290
     */
    var expiredToken = token
    expiredToken.refreshTokenExpiresAt = new Date('2015-05-28T06:59:53.000Z')
    return expiredToken
  }).catch(function (err) {
    console.log("revokeToken - Err: ", err)
  });
}

let saveToken = (token, client, user) => {
	return Promise.all([
		OAuthAccessToken.create({
			access_token: token.accessToken,
			expires: token.accessTokenExpiresAt,
			OAuthClient: client_id,
			User: user._id,
			scope: token.scope
		}),
		token.refreshToken ? OauthRefreshToken.create({
	        refresh_token: token.refreshToken,
	        expires: token.refreshTokenExpiresAt,
	        OAuthClient: client._id,
	        User: user._id,
	        scope: token.scope
	      }) : [],
	])
	.then(function(resultsArray){
		return Object.assign({
			{
				client: client,
		        user: user,
		        access_token: token.accessToken, // proxy
		        refresh_token: token.refreshToken, // proxy
			}
		}, token)
	})
	.catch(function (err) {
      console.log("revokeToken - Err: ", err)
    });
}