$( document ).ready(function()
{
    $("#sendButton").click(function(event)
    {
        event.preventDefault();
        data = {
            'recepients':$("input#channelID").val().split(","),
            'messagetitle':$("input#title").val(),
            'messageBody':$("textarea#message").val()
        }

        $.ajax({
          url: "/publish",
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(data),
          error: function(result) {
            alert("error");
          },
          success: function()
          {
            alert("Message broadcasted successfully");
         }
        });
    });


    socket = io.connect('http://localhost:3000');

    socket.on('alfred', function(message) {
        console.log(message);
        notifyMe(message);
        socket.emit("server", "i got it");
    });

    socket.on('public', function(message) {
        console.log(message);
        notifyMe(message);
        socket.emit("server", "i got it");
    });


    function notifyMe(content) 
    {

      if (!("Notification" in window)) {
        alert(content);
      }
      else if (Notification.permission === "granted") {
            var options = {
                    body: content["message"],
                    icon: "/static/img/icon.gif",
                    dir : "ltr",
                    requireInteraction: true
                 };
              var notification = new Notification(content["title"],options);
      }
      else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
          if (!('permission' in Notification)) {
            Notification.permission = permission;
          }

          if (permission === "granted") {
            var options = {
                  body: content["message"],
                  icon: "/static/img/icon.gif",
                  dir : "ltr",
                  requireInteraction: true
              };
            var notification = new Notification(content["title"],options);
          }
        });
      }
    }


});
