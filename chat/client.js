const chatEl = document.querySelector("#chat");
const formEl = document.querySelector("#messageForm");
const ws = new WebSocket("ws://192.168.1.102:8000");
ws.onmessage = (message) => {
  const messages = JSON.parse(message.data);
  messages.forEach((val) => {
    const messageEl = document.createElement("div");
    messageEl.appendChild(document.createTextNode(`${val.name}: ${val.message}`));
    chat.appendChild(messageEl);
  });
};

const send = (e) => {
  e.preventDefault();
  const name = document.querySelector("#name").value;
  const message = document.querySelector("#message").value;

  ws.send(JSON.stringify({ name, message }));
};

formEl.addEventListener("submit", send);
