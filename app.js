var restify = require('restify');
var builder = require('botbuilder');

var botConnectorOptions = { 
    //appId: '83b0d9d4-b975-43ba-9406-24279b9a4120', 
    //appPassword:'w5C5gfsKuvtqjqhkRgWScfC'
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
};

// Create bot
var connector = new builder.ChatConnector(botConnectorOptions);

var bot = new builder.UniversalBot(connector);

var languages = [ "English", "Español" ];

bot.dialog('/', [
    function(session){ 
        session.send("greeting");
        session.send(session.preferredLocale());
        session.beginDialog('/changeLocaleDialog');
    }
]);

bot.dialog('/changeLocaleDialog',[
    function(session){
        var answers = ["yes", "no"];
        
        builder.Prompts.confirm(session, "do you want change the locale", answers);
    },
    function(session, result){
        if(result.response){
            session.replaceDialog("/localePicker");
        }else{
            session.send("the locale dont will be changed");
            session.send("bye");
            session.endDialog();
        }
    }
]);

bot.dialog('/localePicker',[
      function (session) {
        builder.Prompts.choice(session, "What's your preferred language", languages, {listStyle: builder.ListStyle.button });
    },
    function (session, results) {
        var locale;
        switch (results.response.entity) {
            case 'English':
                locale = 'en';
                break;
            case 'Español':
                locale = 'es';
                break;
        }
        session.preferredLocale(locale, function (err) {
            if (!err) {
                session.send("Your new locale is");
                session.send("bye");
                session.endDialog();
            } else {
                session.error(err);
            }
        });
    }
]);

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
