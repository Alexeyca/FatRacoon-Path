var client;

//mqtt client settings
var hostname = "192.168.100.124";
var port ="1883";
var topics="#";
var clientName;

$('.menu').resizable();
$('.projects').resizable();
$('.devices').resizable();
$('.main').resizable();
$('.propertys').resizable();

if ( window.sessionStorage.clientId){
    clientName = window.sessionStorage.clientId;
}else{
    clientName = "mqtt_js_" + parseInt(Math.random()*100000, 10);
    window.sessionStorage.clientId=clientName;
}

function connectMqtt(){
    clientMqtt = new Paho.Mqtt.Client(hostname, Number(port), clientName);
    console.info('Connecting to Mqtt, host : ', hostname, '. port: ', port, 'Client Name: ',clientName);
    connectMqtt.onConnectionLost = onConnectionLost;
    connectMqtt.onMessageArrived = onMessageArrived;

    var options = {
        onSuccess: onConnect,
        onFailure: onFail,
        useSSL:true
    };
    connectMqtt.connect(options);
    console.info('Connecting...');
}

function onConnect(){
    console.log("Client connected");
    options = {qos:0, onSuccess:function(context){console.log("subscribed");}}
    clientMqtt.subscribe(topics, options);
}

function onFail(context){
    console.log("Failed to connect");
}

function onConnectionLost(responseObject){
    if (responseObject.errorCode !== 0) {
        console.log("Connection Lost: " + responseObject.errorMessage);
        window.alert("Someone else took my websocket!");
    }
}

function onMessageArrived(message){
    console.log("topic: ", message.destinationName, "message: ", message.payloadString);

}

