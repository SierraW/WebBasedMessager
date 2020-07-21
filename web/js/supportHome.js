$(document).ready(function() {
    console.log("in doc ready");

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
        $http({
            method : "GET",
            url : `../../socket/getAllRoom.php?user_id=${userId}`
        }).then(function mySuccess(response) {
            for (let i = 0 ; i < response.data.data.length; i++) {
                if (i === 0) {
                    chatId = response.data.data[0].chat_id;
                    setChat();
                }
                if (response.data.data[i].name == null) {
                    setNameInto($http,response.data.data[i]);
                }
            }
            $scope.groupChats = response.data.data;
        }, function myError(response) {
            console.log(response.statusText);
        });
        $scope.sortChat = function (columnName) {
            $scope.gcColumnName = columnName;
        }
    });

setInterval(function refreshChat() {
    setChat();
    setTimeout(scrollToBottom, 10);
}, 1000);

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
    let url = `../../socket/getAllMsg.php?chat_id=${chatId}&time=${Date.now()}`;
    console.log(url);
    http({
        method : "GET",
        url : url
    }).then(function success(response) {
        console.log(chatId);
        console.log(response.data);
        scope.chatMessages = response.data.data;
        save(chatId, response.data.data)
        $(document.getElementsByClassName(`user${userId}`)).addClass("alignLeft");
    }, function error(rsaHashedImportParams) {
        console.log(rsaHashedImportParams.statusText);
    });
}

function save(chatId, data) {
    localStorage.setItem(chatId, JSON.stringify(data));
}

function sendMessage() {
    console.log("send");
    http({
        method : "GET",
        url : `../../socket/sendMsg.php?user_id=${userId}&chat_id=${chatId}&msg=${encodeURI($("#txtInput").val())}&msg_type=1`
    }).then(function success(response) {
        if (response.data.success === "success") {
            setChat();
            $("#txtInput").val("");
        }

    }, function error(rsaHashedImportParams) {
        console.log(rsaHashedImportParams.statusText);
    });
}

function scrollToBottom() {
    console.log("scrolled");
    $("#tblChat").animate({ scrollTop: $("#tblChat").prop("scrollHeight")}, 0);
    // let scrollableObj = document.getElementById("lblChat");
    // scrollableObj.scrollTop = scrollableObj.scrollHeight;
}