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

var data = [
    {
      label: '1',
      children: [
        { label: '1.1' },
        { label: '1.2',
         children: [
           { label: "1.2.1",
              children: [
                { label: "1.2.1.1",
                  children: [
                    { label : "1.2.1.1.1"}
                  ]
                }
              ]
           }
         ]
        }
      ]
    },
    {
      label: '2',
      children: [
        { label: '2.1',
          children: [
            {
              label: "2.1.1",
              children: [
                { label: "2.1.1.1",
                  children: [
                    { label: "2.1.1.1.1" }
                  ]
                },
                {
                  label: "2.1.1.2"
                }
              ]
            },
            {
              label: "2.1.2"
            }
          ]
        },
        { label: "2.2",
          children: [
            { label: "2.2.1",
               children: [
                 { label: "2.2.1.1" ,
                  children: [
                    { label: "2.2.1.1.1",
                     children: [
                       { label: "2.2.1.1.1.1" }
                     ]
                    }
                  ]
                 }
               ]
            },
            { label: "2.1.4" }
          ]
        },
        {
          label: "2.3"
        }
      ]
    },
    {
      label: "3"        
    }
  ];
  
  //
  // jqtree HTML constants
  //
  JQTREE_TREE = "jqtree-tree";
  ROLE_GROUP = "group";
  
  CHILD_HEIGHT_BUFFER_FACTOR = 1;
  
  // jqTree root
  projectContainer = $('#projectTree');
  MQTTContainer = $('#MQTTTree');
  
  //
  // -> Load tree data & options, & bind tree
  //
  projectContainer.tree({
    data: data,
    autoOpen: false,
    dragAndDrop: true
  });

  MQTTContainer.tree({
    data: data,
    autoOpen: false,
    dragAndDrop: true
  });
  
  projectTREE_ROOT = $("#projectTree ." + JQTREE_TREE );
  MQTTTREE_ROOT = $("#MQTTTree ." + JQTREE_TREE );
  
  // Get padding-top value for group nodes from CSS.  
  // *Must be done before first call to heightenDescendants 
  ATTRROLE_VALGROUP_PADDINGTOP = parseInt($("[role='"+ ROLE_GROUP +"']").css("padding-top").replace("px",""));
  heightenDescendants( JQTREE_ROOT );
  
  //
  // custom event handling
  //
  // Shorten closed descendants
  projectContainer.on( "tree.close", function( closeEvent ){ changeAncestorHeightRecursively( closeEvent.node, false ); } );
  MQTTContainer.on( "tree.close", function( closeEvent ){ changeAncestorHeightRecursively( closeEvent.node, false ); } );
  // Heighten opened descendants
  // Override JqTreeWidget.prototype.openNode from tree.jquery.js
  // (see http://stackoverflow.com/questions/35513988/access-variable-from-1-js-source-file-jqtree-from-within-different-js-file)
  JQTREEWIDGET_OPENNNODE_METHOD = $.fn.tree("get_widget_class").prototype.openNode;
  $.fn.tree("get_widget_class").prototype.openNode = function( node, slide ) {
    // this happening first is what requires this override.
    // Registering it instead as a handler of "tree.open" event results in it being called last,
    //  causing nodes it will heighten to blink behind opened node before the heighteining happens.
    // This is because opening apparently happens before the event is fired
    changeAncestorHeightRecursively( node, true );
    // Call with JqTreeWidget preserved as 'this' (called method depends on that being correct)
    JQTREEWIDGET_OPENNNODE_METHOD.call( this, node, slide );
  }
  // Heighten descendants on refresh, so they are correct after drag and drop's default height adjustment is then fixed
  projectContainer.on( "tree.refresh", function( refreshEvent ){ heightenDescendants( JQTREE_ROOT ); } );
  MQTTContainer.on( "tree.refresh", function( refreshEvent ){ heightenDescendants( JQTREE_ROOT ); } );
  
  //
  //@param {jQuery} jQuery - jQueryObject
  //@returns {boolean} - true if jQuery has an attribute "role" with value "group",
  //                     false otherwise
  function isRole_Group( jQuery ) {
    return jQuery.attr( "role" ) == ROLE_GROUP;
  }
  
  // Buffers parent height by buffer factor (1px) for each visible descendant.
  // DFS recurs on children to buffer them, as well as to get their heights to buffer paren by.
  //
  // Main purpose is to give descendant borders staggered heights for separation.
  //
  // @param {string} parent - parent jQuery object to stagger height from
  // @returns {Number} - new height of parent (height of its visible descendants)
  function heightenDescendants( parent ){
    var childrenHeight = 0;
  
    // Recursively increment childrenHeight by heights of all descendents of element
    parent.children().each( function(){
      var curChild = $(this);
      if( curChild.hasClass("jqtree-folder") || isRole_Group( curChild ) ){
        // Recur
        childrenHeight += heightenDescendants( curChild );
        
        if( isRole_Group( curChild ) ){
          childrenHeight += ATTRROLE_VALGROUP_PADDINGTOP;
        }
      } else {      // Base Case
        childrenHeight += parseInt( curChild.height() );
      }
  
      childrenHeight += CHILD_HEIGHT_BUFFER_FACTOR;
    });
  
    parent.height(childrenHeight + "px");
  
    return childrenHeight;
  }
          
  //
  // Recursively walks up ancestor child-groups from node,
  // adding (if shouldAddHeight true) or subtracting (if shouldAddHeight false)
  // height of node children.
  //
  // @param {Node} node - tree.close event
  // @param {boolean} shouldAddHeight - true to add height, false to subtract
  function changeAncestorHeightRecursively( node, shouldAddHeight ) {
    curParent = $(node.element);  // starts off as the node with class "jqtree-folder" that fired event
    // Get height of the child container node with attribute "role" as "group"
    nodeGroupHeight = curParent.children().last().height();
    if( ! shouldAddHeight ){
      nodeGroupHeight *= -1;
    }
    // Recur on parent, until parent is jqtree root (base case)
    while( ! curParent.hasClass( JQTREE_TREE ) ){
      // -> Change height
      curParent.height( curParent.height() + nodeGroupHeight );
      // Update for recursion
      curParent = curParent.parent();
    }
    
  }
