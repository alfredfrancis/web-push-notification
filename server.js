var amqp = require('amqp'),
	http = require('http'),
    express = require('express'),
    app = express(),
    server = app.listen(3000),
    io = require('socket.io').listen(server),
    errorHandler = require('express-error-handler'),
    bodyParser = require('body-parser'),
    rabbitMq = amqp.createConnection(
    	{
            host: 'localhost',
            port: 5672,
            login: 'guest',
            password: 'guest',
            connectionTimeout: 10000,
            authMechanism: 'AMQPLAIN',
            vhost: '/',
            noDelay: true,
            ssl: { 
                enabled : false
            }
		}
	);

    app.use(express.static(__dirname + '/public'));

    app.use(bodyParser.json());

    app.use(errorHandler());


    app.get("/", function(req, res){
    	 res.sendFile(path.join(__dirname + '/index.html'));
    });

    app.post("/publish", function(req, res){
        console.log(req.body)
        publishNotification (req.body);
        res.json({ message: 'inserted to queue!' });
    });

    // Report errors
    rabbitMq.on('error', function(err) { 
        console.error('Connection error', err); 
    });

    rabbitMq.on('ready', function () {
       console.log("Rabbitmq Ready");
       var socket = io.sockets.on('connection', function (socket) {
        });

       	rabbitMq.queue('notifications',options={
            	"durable":true,
            	"autoDelete":false
            }, 
            function(queue) 
            {
                // all messages
    			queue.bind('#'); 
            	console.log("queue Ready");

                // Subscribe to the queue
                queue.subscribe(function (message) {
                  console.log(message);
                  let notificationString = message.data.toString('utf8');
                  let notificationObject = JSON.parse(notificationString);
                  console.log("Received Notification");
                  publishNotification (notificationObject);			  
    		});
        });
    });

function publishNotification (notificationObject) {  
    console.log(notificationObject) 

    var newNotification = {
        "title": notificationObject.messageTitle,
        "message":notificationObject.messageBody
      }

    notificationObject.recepients.forEach(function(recepient) {
        console.log(recepient) 
        io.emit(recepient, newNotification);
    });
}
