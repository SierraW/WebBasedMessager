$(document).ready(function() {
    console.log("in doc ready");


});

var onoff = true; //根据此布尔值判断当前为注册状态还是登录状态
var confirm = document.getElementsByClassName("confirm")[0];

//自动居中title
var name_c = document.getElementById("title")
name = name_c.innerHTML.split("")
name_c.innerHTML = ""
for (i = 0; i < name.length; i++)
  if (name[i] != ",")
    name_c.innerHTML += "<i>" + name[i] + "</i>"
//引用hint()在最上方弹出提示
function hint() {
  var hit = document.getElementById("hint");
  hit.style.display = "block";
  setTimeout(function(){hit.style.opacity=1},0);
  setTimeout(function(){hit.style.opacity = 0},2000);
  setTimeout(function(){hit.style.display = "none"},3000);
}

var app=angular.module("myApp", [])
.controller("mainController", function($scope) {

});

// function login() {
//     var id = $("#userId").val();
//     var pass = $("#pass").val();
//     if (inputNotContainsSpecialChars(id + pass)) {
//         $.ajax({
//             type: "GET",
//             url: `http://47.253.3.214/socket/user/login.php?id=${id}&password=${pass}`,
//             dataType: "json",
//             success: accountSetUp
//         });
//     } else {
//         $("#lblMsg").html("Special characters are not allow in username/email and password.");
//     }
// }

function login() {
  var confirm = document.getElementsByClassName("confirm")[0];
  var em = document.getElementsByClassName("email")[0];
  var disName = document.getElementsByClassName("disName")[0];
  if (onoff) {

    var id = $("#user").val();
    var pass = $("#passwd").val();
    if (inputNotContainsSpecialChars(id + pass)) {
      $.ajax({
          type: "GET",
          url: `http://47.253.3.214/socket/user/login.php?id=${id}&password=${pass}`,
          dataType: "json",
          success: accountSetUp
        });
      }else {
          $("#lblMsg").html("Special characters are not allow in username/email and password.");
        }
      }


  else {
    let status = document.getElementById("status").getElementsByTagName("i");
    confirm.style.height = 0;
    em.style.height = 0;
    disName.style.height = 0;
    status[0].style.top = 0;
    status[1].style.top = 35 + "px";
    onoff = !onoff;
    console.log("password not correct!");
  }
}


function inputNotContainsSpecialChars($input) {
    let specialRegex = /[A-Z@.a-z0-9]/;
    return specialRegex.test($input)
}

function accountSetUp(data) {

    if (data.success !== "success") {
        // $("#lblMsg").html(`Log in ${data.message}`);
        fal();
    } else {
        // setCookie("user_id" , data.data.id, 30);
        // setCookie("user_session", data.data.user_session, 30);
        setCookie("user_id", data.data.id);
        setCookie("user_session", data.data.user_session);
        setCookie("user_name", data.data.display_name);
        console.log(data.data.id);
        console.log(data.data.user_session);
        window.location.replace("pages/home.html");
    }
}

function setStorage(cname,cvalue) {
  localStorage.setItem(cname, cvalue);
}
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}


//注册按钮
function signin() {
  var confirm = document.getElementsByClassName("confirm")[0];
  var em = document.getElementsByClassName("email")[0];
  var disName = document.getElementsByClassName("disName")[0];

  var user = document.getElementById("user");
  var passwd = document.getElementById("passwd");
  var con_pass = document.getElementById("confirm-passwd");
  var email = document.getElementById("eml");
  var name = document.getElementById("display_name");

  var status = document.getElementById("status").getElementsByTagName("i");
  var hitMess = document.getElementById("hint").getElementsByTagName("p")[0];
  if (onoff) {
    confirm.style.height = 51 + "px"
    em.style.height = 51 + "px"
    disName.style.height = 51 + "px"
    status[0].style.top = 35 + "px"
    status[1].style.top = 0
    console.log(onoff);
    onoff = !onoff
    console.log(onoff);
  } else {
    if (!/^[A-Za-z0-9]+$/.test(user.value)){
      hitMess.innerHTML = "Username can only contain letters or numbers.";
      hint();
    }
    else if (user.value.length < 6){
      hitMess.innerHTML = "Username length must be greater than 6 digits.";
      hint();
    }
    else if (passwd.value.length < 6){
      hitMess.innerHTML = "Password length must be greater than 6 digits.";
      hint();
    }
    else if (passwd.value != con_pass.value){
      hitMess.innerHTML = "Password incorrect.";
      hint();
    }
    else if (emailIsValid(eml.value) != true){
      hitMess.innerHTML = "Invalid Email";
      hint();
    }
    else if (passwd.value = con_pass.value && emailIsValid(eml.value)){
        $.ajax({
            type: "GET",
            url: `http://47.253.3.214/socket/user/signup.php?username=${user.value}&password=${passwd.value}&email=${eml.value}&display_name=${name.value}`,
            dataType: "json",
            success: signinSuc
          });
    }
  }
}

function signinSuc(){
  window.location.replace("pages/home.html");
}


function emailIsValid (email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function fal() {
  console.log("something is not right.");
  Swal.fire({
    icon: 'error',
    title: 'Oops...',
    text: 'Wrong Password Or Email',
    footer: 'Please Try Again.'
  });
}
