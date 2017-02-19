// Config ===============================================

//require the Twilio module and create a REST client
var client       = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

var Q            = require('q');
var request      = require('request');
var cheerio      = require('cheerio');

// Helper Functions ===============================================

var getAnswer = function() {
  var deferred = Q.defer();
  request('http://liveprizetrivia.com/answer-of-the-day/', function(error, response, body) {
    if (error) {
      deferred.reject(new Error(error));
    } else if (!error && response.statusCode == 200) {
      var $ = cheerio.load(body);
      var answer = $('main .entry-content h2').last().text();
      var message = '\n\nThe Free Trivia answer of the day is: \n' + answer;

      deferred.resolve(message);
    }
  });
  return deferred.promise;
};

var sendMessage = function(message) {
  var deferred = Q.defer();
  client.sendMessage({  //Send an SMS text message
    to: process.env.PHONE_NUMBER, // Any number Twilio can deliver to
    from: process.env.TWILIO_NUMBER, // A number you bought from Twilio and can use for outbound communication
    body:  message // body of the SMS message
  }, function(err, responseData) { //this function is executed when a response is received from Twilio
    if (err) {
      deferred.reject(new Error(err));
    } else if (!err) { // "err" is an error received during the request, if any
      console.log(responseData.from); // outputs "+14506667788"
      console.log(responseData.body); // outputs "word to your mother."
      deferred.resolve();
    }
  });
  return deferred.promise;
};

// Init ===============================================

Q.fcall(getAnswer).then(sendMessage);
