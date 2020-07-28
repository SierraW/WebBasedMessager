$(document).ready(function() {
    $("#txtInput").keypress(function (e) {
        if(e.which == 13 && !e.shiftKey) {
            $(this).closest("form").submit();
            e.preventDefault();
        }
    });
});

var http;
var scope;
var userId;
var chatId;
var count = 0;

var app=angular.module("myApp", [])
    .controller("mainController", function($scope, $http) {
        http = $http;
        scope = $scope;
        userId = getCookie("user_id");
        getChatRoom();
        $scope.sortChat = function (columnName) {
            $scope.gcColumnName = columnName;
        };
        $scope.setCurrentChat = function (chat_id) {
            chatId = chat_id;
            setChat();
        };
        $scope.createChat = function (user_id) {
            createRoom(user_id);
            setChat();
        }
        getBroadcastUser();
    });

setInterval(function refreshChat() {
    getNewMsg();
    setTimeout(scrollToBottom, 10);
}, 1000);

function getChatRoom() {
    http({
        method : "GET",
        url : `../../socket/getAllRoom.php?user_id=${userId}`
    }).then(function mySuccess(response) {
        for (let i = 0 ; i < response.data.data.length; i++) {
            if (i === 0 && chatId == null) {
                chatId = response.data.data[0].chat_id;
                setChat();
            }
            if (response.data.data[i].name == null) {
                setNameInto(http, response.data.data[i]);
            }
        }
        scope.groupChats = response.data.data;
    }, function myError(response) {
        console.log(response.statusText);
    });
}

function getBroadcastUser() {
    http({
        method : "GET",
        url : `../../socket/getBroadcastUser.php`
    }).then(function getBUser(response) {
        scope.broadcastUsers = response.data.data;
    }, function error(rsaHashedImportParams) {
        console.log(rsaHashedImportParams.statusText);
    });
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setNameInto($http, chatListResp) {
    $http({
        method : "GET",
        url : `../../socket/getMember.php?chat_id=${chatListResp.chat_id}`
    }).then(function mySuccess(response) {
        chatListResp.name = "";
        let first = true;
        for (let j = 0 ; j < response.data.data.length; j++) {
            if (first) {
                first = false;
            } else {
                chatListResp.name += " and ";
            }
            chatListResp.name += response.data.data[j].display_name;
        }
    }, function error(rsaHashedImportParams) {
        console.log(rsaHashedImportParams.statusText);
    });
}

function setChat() {
    let url = `../../socket/getAllMsg.php?chat_id=${chatId}&user_id=${userId}&time=${Date.now()}`;
    http({
        method : "GET",
        url : url
    }).then(function success(response) {
        scope.chatMessages = response.data.data;
        save(chatId, response.data)
    }, function error(rsaHashedImportParams) {
        console.log(rsaHashedImportParams.statusText);
    });
}

function getNewMsg() {
    let data = load(chatId);
    if (data == null) {
        setChat();
        return;
    }

    let url = `../../socket/getNewMsg.php?chat_id=${chatId}&user_id=${userId}&last_read=${data.readId}&time=${Date.now()}`;
    http({
        method : "GET",
        url : url
    }).then(function success(response) {
        if (response.data.success === "success") {
            if (response.data.data.length === 0) {
                //do nothing
            } else {
                data.data = data.data.concat(response.data.data);
                scope.chatMessages = data.data;
                save(chatId, data);
            }
        }
    }, function error(rsaHashedImportParams) {
        console.log(rsaHashedImportParams.statusText);
    });
}

function save(chatId, data) {
    let myData = data;
    let max_id = 0;
    if (data != null) {
        for (let i = 0; i < data.data.length; i++) {
            if (data.data[i].msg_id > max_id) {
                max_id = data.data[i].msg_id;
            }
        }
    }
    myData.readId = max_id;
    console.log(myData);
    localStorage.setItem(chatId, JSON.stringify(myData));
}

function load(chatId) {
    return JSON.parse(localStorage.getItem(chatId));
}

function sendMessage() {
    console.log($("#txtInput").html());
    http({
        method : "GET",
        url : `../../socket/sendMsg.php?user_id=${userId}&chat_id=${chatId}&msg=${encodeURI($("#txtInput").val())}&msg_type=1`
    }).then(function success(response) {
        if (response.data.success === "success") {
            getNewMsg();
            $("#txtInput").val("");
        }

    }, function error(rsaHashedImportParams) {
        console.log(rsaHashedImportParams.statusText);
    });
}

function createRoom(attender_id) {
    http({
        method : "GET",
        url : `../../socket/createChat.php?leader_id=${userId}&attender_id=${attender_id}`
    }).then(function success(response) {
        if (response.data.success === "success") {
            chatId = response.data.data[0].chat_id;
            getChatRoom();
            setChat();
            $("#txtInput").val("");
        }

    }, function error(rsaHashedImportParams) {
        console.log(rsaHashedImportParams.statusText);
    });
}

function scrollToBottom() {
    $("#tblChat").animate({ scrollTop: $("#tblChat").prop("scrollHeight")}, 0);
    // let scrollableObj = document.getElementById("lblChat");
    // scrollableObj.scrollTop = scrollableObj.scrollHeight;
}