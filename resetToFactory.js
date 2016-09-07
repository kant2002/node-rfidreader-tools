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
    client.on("message", function (msg, rinfo) {
		var magicByte = msg[0];
		console.log("Server got: " + JSON.stringify(msg.toJSON()) + " from " + rinfo.address + ":" + rinfo.port);
		if (magicByte === rfidReader.commands.dataReceived1 || magicByte == rfidReader.commands.dataReceived2)
		{
			processBindingData(msg);
		} else if (magicByte == rfidReader.commands.deviceDiscovery) {
			registerDevice(msg);
		} else {
			console.log("Server got: " + JSON.stringify(msg.toJSON()) + " from " + rinfo.address + ":" + rinfo.port);
		}		
	});
	var resetToFactory = rfidReader.createResetToFactory();
	client.send(resetToFactory, 0, resetToFactory.length, deviceBroadcastPort, argv.deviceIp, failOnError);
    console.log("Reset to factory, command send. Press Ctrl+C to terminate program.")
});

var argv = yargs
    .describe('ip', 'IP Address to which bind application')
    .describe('deviceIp', 'IP Address which set to device')
    .count('verbose').argv;

client.bind({
	port: deviceBroadcastPort,
	address: argv.ip || "169.254.167.154"
});
