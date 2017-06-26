var restify = require('restify');
var builder = require('botbuilder');
const formflowbotbuilder = require('formflowbotbuilder');

var botConnectorOptions = { 
    //appId: '83b0d9d4-b975-43ba-9406-24279b9a4120', 
    //appPassword:'w5C5gfsKuvtqjqhkRgWScfC'
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
};

// Create bot
var connector = new builder.ChatConnector(botConnectorOptions);

var bot = new builder.UniversalBot(connector);

const myDialogName = 'getFields';

formflowbotbuilder.executeFormFlow('./questions.json', bot, myDialogName, function (err, responses) {
  if (err) {
    console.log(err);
  } else {
    bot.dialog('/', [function (session) {
      session.beginDialog(myDialogName);
    },
      function (session, results) {
        session.send('results: ' + JSON.stringify(responses));
      }]);
  }
});

// Setup Restify Server
var server = restify.createServer();

// Handle Bot Framework messages
/*here we are giving path as "/api/messages" because during the process of regi9stering bot we have given end point URL as "azure qwebapp url/api/messages" if you want to give some other url give the same url whatever you give in the endpoint excluding azure webapp url */
server.post('/api/messages', connector.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
        'directory': '.',
        'default': 'index.html'
}));

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});
