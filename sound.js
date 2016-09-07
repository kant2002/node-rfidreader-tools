/* global Buffer */
var dgram = require('dgram');
var client = dgram.createSocket("udp4");
var rfidReader = require("rfidreader");
var yargs = require("yargs");

var broadcastAddress = "255.255.255.255";
var deviceBroadcastPort = 39169;

function failOnError(err) {
	if (err) {
		throw err;
	}	
}

client.on("error", function (err) {
  console.log("Server error:\n" + err.stack);
  client.close();
});

client.on("listening", function () {
	var address = client.address();
  	console.log("Server listening " + address.address + ":" + address.port);
	console.log("Start listening.");
    client.setBroadcast(true);
	var setSound = rfidReader.setSoundCommand(0, argv.sound || rfidReader.soundType.shortBeepOnce);
	client.send(setSound, 0, setSound.length, deviceBroadcastPort, argv.deviceIp, function (err) {
        if (err) {
            throw err;
        }
        
        process.exit(0);	
    });
});

var argv = yargs
    .describe('ip', 'IP Address to which bind application')
    .describe('deviceIp', 'IP Address which set to device')
    .describe('sound', 'Sound type')
    .count('verbose').argv;

client.bind({
	port: deviceBroadcastPort,
	address: argv.ip || "169.254.167.154"
});
