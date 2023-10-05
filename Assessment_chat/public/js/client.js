//required for front end communication between client and server

const socket = io();

const inboxPeople = document.querySelector(".inbox__people");

let storedUserID;
document.addEventListener("DOMContentLoaded", function() {
   storedUserID = localStorage.getItem("userID");
    if (storedUserID) {
        document.getElementById("userID").textContent = storedUserID;
        newUserConnected(storedUserID)
    }
});

let userName = "linciwei";
let id;

//创建一个新的用户名
const newUserConnected = function (data) {
    

   
    
    userName = 'user-' +storedUserID;
      
    

    //emit an event with the user id
    socket.emit("new user", userName);
    //call
    addToUsersBox(userName);
     displayEnterChatNotification(userName);
};

const displayEnterChatNotification = function (userName) {
    // 使用浏览器的弹窗或者 toast 通知库来显示通知
    alert(userName + " 进入了聊天室");
};

const addToUsersBox = function (userName) {
   
    if (!!document.querySelector(`.${userName}-userlist`)) {
        return;
    
    }
    
    //setup the divs for displaying the connected users
    //id is set to a string including the username
    const userBox = `
    <div class="chat_id ${userName}-userlist">
    <div class="thread">
     <div class="details">
      <div class="user-name">${userName}</div>
    </div>
    </div>
     </div>
  `;
    //set the inboxPeople div with the value of userbox
    inboxPeople.innerHTML += userBox;
};

//call 
if(storedUserID){
  newUserConnected();
  
  }


//when a new user event is detected
socket.on("new user", function (data) {
  data.map(function (user) {
          return addToUsersBox(user);
      });
});

//when a user leaves
socket.on("user disconnected", function (userName) {
  document.querySelector(`.${userName}-userlist`).remove();
});


const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");
const typingStatus = document.querySelector(".typing-status");


inputField.addEventListener("input", () => {
  const message = inputField.value;
  if (message.trim() !== "") {
    socket.emit("typing", userName);
  } else {
    socket.emit("stop typing", userName);
  }
});



const addNewMessage = ({ user, message }) => {
  const time = new Date();
  const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });

  const receivedMsg = `
  <div class="incoming__message">
    <div class="received__message">
        <span class="time_date">${formattedTime}</span>
      
        <span class="message__author">${user}</span>
        
        
        <div class="message">
        <div class="content">${message}</div>
        </div>

    </div>
  </div>`;

  const myMsg = `
  <div class="outgoing__message">
    <div class="sent__message">
      <div style = " margin-left: 77%;width: 200px;">
        <span class="time_date">${formattedTime}</span>
          <span class="time_date">${storedUserID}</span>
      </div>
      <div class="message fromme">
      <div class="content" >${message}</div>
      </div>
    </div>
  </div>`;

  //is the message sent or received
  messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
};

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!inputField.value) {
    return;
  }

  socket.emit("chat message", {
    message: inputField.value,
    nick: userName,
  });

  inputField.value = "";
});

socket.on("chat message", function (data) {
  addNewMessage({ user: data.nick, message: data.message });
});

socket.on("user entered", function (data) {
    // 使用浏览器的弹窗或者 toast 通知库来显示通知
     displayEnterChatNotification(data);;
});

socket.on("user disconnected", function (userName) {
    alert(`用户 ${userName} 退出了聊天室`);
});
socket.on("user typing", function (userName) {
  typingStatus.textContent = `${userName} is typing...`;
});

socket.on("user stop typing", function (userName) {
  typingStatus.textContent = "";
});