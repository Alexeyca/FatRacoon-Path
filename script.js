var clientMqtt;

//mqtt client settings
var hostname = "192.168.100.124";
var port = "9001";
var topics = "#";
var clientName;

var mqttTopics = [
  { "id": "mqtt", "parent": "#", "text": "mqtt" },
];

var projectsTree = [
  { "id": "projects", "parent": "#", "text": "projects" },
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
  var topicup=topic.replace("/","-")
  var node;
  var path="";
  //console.log(chain);
  var count = 0;
  if (!(node = $('#mqttTree').jstree(true).get_node(topicup))) {
    for (var segment of chain) {
      path=path+segment;
      if (!$('#mqttTree').jstree(true).get_node(path)) {
        if (count > 0) {
          //console.log(chain[count - 1]);
          if (chain.length == count + 1) {
            //console.log("data");
            $('#mqttTree').jstree().create_node(chain[count - 1], { "id": path, "data": { "value": message, "type": "string" }, "text": segment });
          } else {
            $('#mqttTree').jstree().create_node(chain[count - 1], { "id": path, "text": segment });
          }
        } else {
          if (chain.length == count) {
            $('#mqttTree').jstree().create_node("#", { "id": path, "data": { "value": message, "type": "string" }, "text": segment });
          } else {
            $('#mqttTree').jstree().create_node("#", { "id": path, "text": segment });
          }
        }
        mqttTopics = $('#mqttTree').jstree(true).get_json(null, { "flat": true });
      }
      count = count + 1
      path=path+"-"
    }
  } else {
    //console.log("value update");
    //var node = $('#mqttTree').jstree(true).get_node(topic);
    //console.log(node);
    node.data.value = message;
    //console.log(node);
    //$('#mqttTree').jstree(true).refresh_node(node);
    //$('#mqttTree').jstree(true).redraw(true);
    $('#mqttTree').jstree(true).redraw_node(node.parent);
    $('#mqttTree').jstree(true).redraw(true);
  }

}

$('#mqttTree').jstree({
  plugins: ["grid", "dnd", "contextmenu", "sort"],
  core: {
    data: mqttTopics,
    check_callback: true
  },
  grid: {
    columns: [
      { width: 'auto', header: "Topic" },
      { width: 'auto', value: "value", header: "value", cellClass: "aright" },
      { width: 'auto', value: "type", header: "type", cellClass: "aright" }
    ],
    resizable: true,

  }
});

$('#projectTree').jstree({
  'core': {
    'data': projectsTree,
    'check_callback': true
  }
});
