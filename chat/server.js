import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuid } from "uuid";
import { writeFile, readFileSync, existsSync } from "fs";

const clients = {};
const log = existsSync("log") && readFileSync("log");
const messages = JSON.parse(log) || [];

const wss = new WebSocketServer({ port: 8000 });

wss.on("connection", (ws) => {
  const id = uuid();
  clients[id] = ws;

  console.log(`New client ${id}`);
  ws.send(JSON.stringify(messages));

  ws.on("message", (rawMessage) => {
    const msgStr = rawMessage.toString();
    const { name, message } = JSON.parse(msgStr);

    messages.push({ name, message });
    for (const id in clients) {
      clients[id].send(JSON.stringify([{ name, message }]));
    }
  });

  ws.on("close", () => {
    delete clients[id];
    console.log(`Client is closed ${id}`);
  });
});

process.on("SIGINT", () => {
  writeFile("log", JSON.stringify(messages), (err) => {
    if (err) {
      console.log(err);
    }
    wss.close();
    process.exit();
  });
});
