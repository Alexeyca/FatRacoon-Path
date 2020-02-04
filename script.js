var clientMqtt;

//mqtt client settings
var hostname = "192.168.100.124";
var port = "9001";
var topics = "#";
var clientName;

var mqttTopics = [
  { "id" : "mqtt", "parent" : "#", "text" : "mqtt" },
];

var projectsTree = [
  { "id" : "projects", "parent" : "#", "text" : "projects" },
];

$('.menu').resizable();
$('.projects').resizable();
$('.devices').resizable();
$('.main').resizable();
$('.propertys').resizable();



function connectMqtt() {
  if (window.sessionStorage.clientId) {
    clientName = window.sessionStorage.clientId;
    console.info("seesionName " + window.sessionStorage.clientId)
  } else {
    clientName = "mqtt_js_" + parseInt(Math.random() * 100000, 10);
    window.sessionStorage.clientId = clientName;
    console.info("session now " + window.sessionStorage.clientId)
  }
  console.info("ClientName is " + clientName)
  clientMqtt = new Paho.MQTT.Client(hostname, Number(port), clientName);
  console.info('Connecting to Mqtt, host : ', hostname, '. port: ', port, 'Client Name: ', clientName);
  clientMqtt.onConnectionLost = onConnectionLost;
  clientMqtt.onMessageArrived = onMessageArrived;

  var options = {
    onSuccess: onConnect,
    onFailure: onFail,
    useSSL: false
  };
  clientMqtt.connect(options);
  console.info('Connecting...');
}

function onConnect() {
  console.log("Client connected");
  options = { qos: 0, onSuccess: function (context) { console.log("subscribed"); } }
  clientMqtt.subscribe(topics, options);
}

function onFail(context) {
  console.log("Failed to connect");
}

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("Connection Lost: " + responseObject.errorMessage);
    window.alert("Someone else took my websocket!");
  }
}

function onMessageArrived(message) {
  console.log("topic: ", message.destinationName, "message: ", message.payloadString);
  updateMqttTree(message.destinationName, message.payloadString);

}

function updateMqttTree(topic, message) {
  var chain = topic.split("/");
  console.log(chain);
  var count=0;
  for (var segment of chain){
    var check=1;
    if (!mqttTopics.some(x=>x.id==segment)){
      if (count>0){
        console.log(chain[count-1]);
        $('#mqttTree').jstree().create_node(chain[count-1],{"id":segment,"text":segment});
      }else{
        $('#mqttTree').jstree().create_node("#",{"id":segment,"text":segment});
      }
      mqttTopics=$('#mqttTree').jstree(true).get_json(null,{"flat":true});
    }
    count=count+1
  }

}

$('#mqttTree').jstree({ 'core' : {
  'data' : mqttTopics,
  'check_callback': true
} });

$('#projectTree').jstree({ 'core' : {
  'data' : projectsTree,
  'check_callback': true
} });
