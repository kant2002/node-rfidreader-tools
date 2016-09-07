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
	console.log("Start listening.")
    client.setBroadcast(true);
	var setSound = rfidReader.setSoundCommand(0, rfidReader.soundType.shortBeepOnce);
	client.send(setSound, 0, setSound.length, deviceBroadcastPort, broadcastAddress, failOnError);
	var updateReaderCommand = rfidReader.updateReaderCommand(argv.deviceIp, argv.mask, argv.gateway, 0, argv.serialNumber, 1);
	client.send(updateReaderCommand, 0, updateReaderCommand.length, deviceBroadcastPort, broadcastAddress, function (err) {
		console.log(arguments);
		if (err) {
			throw err;
		}
		
		var setSound = rfidReader.setSoundCommand(0, rfidReader.soundType.shortBeepOnce);
		client.send(setSound, 0, setSound.length, deviceBroadcastPort, broadcastAddress, failOnError);
	});
});

var argv = yargs
    .describe('ip', 'IP Address to which bind application')
    .describe('port', 'Port to use')
    .describe('deviceIp', 'IP Address which set to device')
    .describe('mask', 'Subnet mask')
    .describe('gateway', 'Gateway to send network via')
    .describe('serialNumber', 'Device serial number')
    .count('verbose').argv;

client.bind({
	port: argv.port || deviceBroadcastPort,
	address: argv.ip || "169.254.167.154"
});
