$(document).ready(function() {
    console.log("in doc ready");


});

var app=angular.module("myApp", [])
.controller("mainController", function($scope) {

});

function login() {
    var id = $("#userId").val();
    var pass = $("#pass").val();
    if (inputNotContainsSpecialChars(id + pass)) {
        $.ajax({
            type: "GET",
            url: `../socket/user/login.php?id=${id}&password=${pass}`,
            dataType: "json",
            success: accountSetUp
        });
    } else {
        $("#lblMsg").html("Special characters are not allow in username/email and password.");
    }
}

function inputNotContainsSpecialChars($input) {
    let specialRegex = /[A-Z@.a-z0-9]/;
    return specialRegex.test($input)
}

function accountSetUp(data) {

    if (data.success !== "success") {
        $("#lblMsg").html(`Log in ${data.message}`);
    } else {
        setCookie("user_id" , data.data.id);
        setCookie("user_session", data.data.user_session);

        window.location.replace("pages/home.html");
    }
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}