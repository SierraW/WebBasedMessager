var selectedElement = [];
var selectedGroupName = null;
var itemDict = {};
var loginSuccess = false;

$(document).ready(function() {
  console.log("in doc ready");

  let epoch = localStorage.getItem('epoch');
  var d = new Date(0);
  d.setUTCSeconds(epoch);
  $("#dateTime").html(`<h3>Record: ${d}</h3>`)

  $.ajax({
    type: "GET",
    url: `https://www.duotuan.ca/data/dgDataOut.php?epoch=${epoch}`,
    dataType: "json",
    success: loadData
  });

  $.ajax({
    type: "GET",
    url: `https://www.duotuan.ca/data/dgGroupDataOut.php?epoch=${epoch}`,
    dataType: "json",
    success: loadGroupData
  });

});

function checkLogIn() {
  let name = getCookie("login");
  let pass = getCookie("pass");
  $.ajax({
    type: "GET",
    url: `https://www.duotuan.ca/login/checkLogin.php?login=${name}&pass=${pass}`,
    dataType: "json",
    success: checkResult
  });
  if (loginSuccess) {
    return;
  } else {
    window.location.href = "https://www.duotuan.ca/login";
  }
}

function checkResult(data) {
  if (data.success === "success") {
    loginSuccess = true;
  } else {
    loginSuccess = false;
  }
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
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

function removeGroup() {
  if (selectedGroupName == null) {
    alert("No group selected!");
    return;
  }
  $.ajax({
    type: "GET",
    url: `https://www.duotuan.ca/data/dgGroupDel.php?groupName=${encodeURI(selectedGroupName)}`,
    dataType: "json",
  });
  alert("success");
  location.reload();
}

function selectGroup(groupName) {
  if (selectedGroupName == null) {
    selectedGroupName = groupName;
    $(document.getElementById(groupName)).addClass("groupSelected");
  } else {
    $(document.getElementById(selectedGroupName)).removeClass("groupSelected");
    if (selectedGroupName === groupName) {
      selectedGroupName = null;
    } else {
      selectedGroupName = groupName;
      $(document.getElementById(groupName)).addClass("groupSelected");
    }
  }
}

function highLight(id) {
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

function clearHighLight() {
  for (let id of selectedElement) {
    $(`#${id}`).removeClass("selected");
  }
  selectedElement = [];
}

function submitGroup() {
  if (selectedElement.length === 0) {
    alert("No item selected!");
    return;
  }
  for (let id of selectedElement) {
    $.ajax({
      type: "GET",
      url: `https://www.duotuan.ca/data/dgGroupIn.php?name=${encodeURI(itemDict[id])}&groupName=${encodeURI($("#groupName").val())}`,
      dataType: "json",
    });
  }
  alert("submited!");
  location.reload();
}

function loadGroupData(data) {
  let groupItems = {};
  let counter = 0;
  for (let item of data.data) {
    if (groupItems[item.groupName] == null) {
      groupItems[item.groupName] = 1;
      $("#groupData").append(
          `
          <div id="${item.groupName}" class="flexContainer ${counter++ % 2 === 1 ? "greyed" : ""}"><h3>${item.groupName}</h3></div>
          <hr class="groupBorder">
          `
      );
      $(document.getElementById(item.groupName)).click(function () {
        selectGroup(item.groupName);
      });
    }

    let style1;
    let store;
    let store1;

    if(item.primaryURL.includes("duotuan")){
      style1 = 'duotuanB';
      store = "多团生鲜";
      store1 = "duotuanC";
    }
    else if (item.primaryURL.includes("hellotomato")) {
      console.log("tomato");
      style1 = 'tomatoB';
      store = "番茄生鲜";
      store1 = "tomatoC";
    }
    else if (item.primaryURL.includes("dapengge")) {
      console.log("dapeng");
      style1 = 'dapenggeB'
      store = "大鹏哥生鲜 ";
      store1 = "dapenggeC";
    }

    $(document.getElementById(item.groupName)).append(
        `
        <div id="groupedCell" class="card-body ${style1}">
          <p class="${store1}">${store}</p>
          <h4 class="item-text">${item.name}</h2>
          <p>价格：${item.price}</p>
          <p>销量：${item.salesRecord}</p>
        </div>

        `
    );

  }
}



function loadData(data) {
  let sessions = [];
  for (let item of data.data) {
    itemDict[item.id] = item.name;
    if (!sessions.includes(item.session)) {
      let name = item.primaryURL;
      if (name.includes("duotuan")) {
        sessions.push(item.session);
        $("#itemContent").append(`
              <div id="${item.session}" class="item-column col-lg-4 col-md-6">

                  <div class="card-header">
                  <h3 class:"duotuanC">多团生鲜</h3>
                  </div>

              </div>
              `);

      } else if (name.includes("hellotomato")) {
        sessions.push(item.session);
        $("#itemContent").append(`
              <div id="${item.session}" class="item-column col-lg-4 col-md-6">

                  <div class="card-header">
                  <h3>番茄生鲜</h3>
                  </div>

              </div>
              `);

      } else if (name.includes("dapengge")) {
        sessions.push(item.session);
        $("#itemContent").append(`
              <div id="${item.session}" class="item-column col-lg-4 col-md-6">

                  <div class="card-header">
                  <h3>大鹏哥</h3>
                  </div>

              </div>
              `);
      }

    }
    $(`#${item.session}`).append(
      `
        <div id="${item.id}" class="card-body" onclick="highLight(${item.id})">
          <h4 class="item-text">${item.name}</h2>
          <p>价格：${item.price}</p>
          <p>销量：${item.salesRecord}</p>
        </div>
        <hr>
        `
    );

  };
}


function openForm() {
  document.getElementById("myForm").style.display = "block";
}

function closeForm() {
  document.getElementById("myForm").style.display = "none";
}
