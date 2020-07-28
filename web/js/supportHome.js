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
var selectedElement = [];
var isAdmin;

var app=angular.module("myApp", [])
    .controller("mainController", function($scope, $http) {
        http = $http;
        scope = $scope;
        userId = getCookie("user_id");
        checkUser(getCookie("user_session"));
        getChatRoom();
        $scope.sortChat = function (columnName) {
            $scope.gcColumnName = columnName;
        };
        $scope.setCurrentChat = function (chat_id) {
            chatId = chat_id;
            setChat();
        };
        $scope.highlight = function (id) {
            if (selectedElement.includes(id)) {
                let index = selectedElement.indexOf(id);
                if (index > -1) {
                    selectedElement.splice(index , 1);
                }
                $(`#${id}`).removeClass("selected");
            } else {
                selectedElement.push(id);
                $(`#${id}`).addClass("selected");
            }
        }
        getBroadcastUser();
        getNormalUser();
    });

setInterval(function refreshChat() {
    getNewMsg();
    setTimeout(scrollToBottom, 10);
}, 1000);

function checkUser(session) {
    http({
        method : "GET",
        url : `../../socket/checkUser.php?user_id=${userId}&session=${session}&time=${Date.now()}`
    }).then(function mySuccess(response) {
        if (response.data != null && response.data.data.length === 1) {
            isAdmin = response.data.data[0].display_homepage == 0;
            scope.admin = isAdmin;
            console.log(scope.admin);
        }
    }, function myError(response) {
        console.log(response.statusText);
    });
}

function getChatRoom() {
    http({
        method : "GET",
        url : `../../socket/getAllRoom.php?user_id=${userId}&time=${Date.now()}`
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

function getNormalUser() {
    http({
        method : "GET",
        url : `../../socket/getNormalUser.php?time=${Date.now()}`
    }).then(function getBUser(response) {
        scope.normalUsers = response.data.data;
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
        url : `../../socket/getMember.php?chat_id=${chatListResp.chat_id}&time=${Date.now()}`
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

function createRoom() {
    var newChatId;
    if (selectedElement.length < 2) {
        alert("Not enough users!");
        return;
    }
    if (selectedElement.length === 2) {
        let leader_id = $("#leaderId").val();
        if (leader_id == null || !selectedElement.includes(leader_id)) {
            leader_id = selectedElement.shift();
        } else {
            leader_id = selectedElement.slice(selectedElement.indexOf(leader_id), 1);
        }
        http({
            method : "GET",
            url : `../../socket/createChat.php?leader_id=${leader_id}&attender_id=${selectedElement.shift()}`
        }).then(function success(response) {
            if (response.data.success === "success") {
                alert("creat room successful");
                getChatRoom();
                newChatId = response.data.data[0].chat_id;
                chatId = response.data.data[0].chat_id;
                setChat();
                $("#txtInput").val("");
            }

        }, function error(rsaHashedImportParams) {
            console.log(rsaHashedImportParams.statusText);
        });
    } else if (selectedElement.length > 2) {
        while (selectedElement.length !== 0) {
            http({
                method : "GET",
                url : `../../socket/addMember.php?user_id=${selectedElement.shift()}&chat_id=${newChatId}`
            }).then(function success(response) {

            }, function error(rsaHashedImportParams) {
                console.log(rsaHashedImportParams.statusText);
            });
        }
    }
}

function clearHighLight() {
    for (let id of selectedElement) {
        $(`#${id}`).removeClass("selected");
    }
    selectedElement = [];
}

function scrollToBottom() {
    $("#tblChat").animate({ scrollTop: $("#tblChat").prop("scrollHeight")}, 0);
    // let scrollableObj = document.getElementById("lblChat");
    // scrollableObj.scrollTop = scrollableObj.scrollHeight;
}