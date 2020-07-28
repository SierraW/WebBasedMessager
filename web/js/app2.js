var onoff = true; //根据此布尔值判断当前为注册状态还是登录状态
var confirm = document.getElementsByClassName("confirm")[0];
// var em = document.getElementsByClassName("email")[0];
// var disName = document.getElementsByClassName("disName")[0];
// var user = document.getElementById("user")
// var passwd = document.getElementById("passwd")
// var con_pass = document.getElementById("confirm-passwd")

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
//回调函数
/*function submit(callback) {
    //if (passwd.value == con_pass.value) {
    let request = new XMLHttpRequest()
    let url = ""
    request.open("post", url, true)
    let data = new FormData()
    data.append("user", user.value)
    data.append("passwd", passwd.value)
    request.onreadystatechange = function() {
        if (this.readyState == 4) {
            callback.call(this, this.response)
            //console.log(this.responseText)
        }
    }
    request.send(data)
}*/
/*else {
           hit.innerHTML = "两次密码不同"
           hitting()
       }
   }*/
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
  console.log("signup done");
}
//登录按钮
//模版的login
// let request = new XMLHttpRequest()
// let url = ""
// request.open("post", url, true)
// let data = new FormData()
// data.append("user", user.value)
// data.append("passwd", passwd.value)
// request.onreadystatechange = function() {
//     if (this.readyState == 4) {
//         if (this.responseText == false)
//             hint()
//         else
//             window.location.href = this.responseText;
//     }
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
        $("#lblMsg").html(`Log in ${data.message}`);
    } else {
        // setCookie("user_id" , data.data.id);
        // setCookie("user_session", data.data.user_session);
        setStorage("user_id", data.data.id);
        setStorage("user_session", data.data.user_session);
        setStorage("user_name", data.data.display_name);
        console.log("successfully login!");
        window.location.replace("pages/home.html");
        // window.location.replace("pages/home.html");
    }
}

function setStorage(cname,cvalue) {
  localStorage.setItem(cname, cvalue);
}
// function setCookie(cname, cvalue) {
    // var d = new Date();
    // d.setTime(d.getTime() + (exdays*24*60*60*1000));
    // var expires = "expires="+ d.toUTCString();
    // document.cookie = cname + "=" + cvalue + ";";
    // Cookies.set(cname, cvalue);
    // + expires + ";path=/" , exdays
// }

function emailIsValid (email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
