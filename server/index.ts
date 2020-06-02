import * as WebSocket from "ws";
const { Server } = WebSocket;

function parseQuery(url: string): { [key: string]: string } {
  return (url.split("?")[1] || "")
    .split("&")
    .map(it => it.split("="))
    .reduce((prev, [key, value]) => ({ ...prev, [key]: value }), {});
}
type MessageType = "target" | "broadcast" | "list";

interface MessageBase {
  type: MessageType;
  channel: string;
  data: any;
}

interface TargetMessage extends MessageBase {
  type: "target";
  id: string;
}

interface BroadcastMessage extends MessageBase {
  type: "broadcast";
}

interface ListingMessage extends MessageBase {
  type: "list";
  data: string[];
}

type Message = TargetMessage | BroadcastMessage | ListingMessage;

export function listen(port: number = 8000) {
  const server = new Server({ port });

  const connections: { [key: string]: WebSocket } = {};
  server.on("connection", (connection, request) => {
    const query = parseQuery(request.url || "");
    const ID = query.id;
    connections[ID] = connection as any;
    setTimeout(sendList, 500);

    function broadcast(channel: string, data: any) {
      Object.keys(connections)
        .filter(id => id !== ID)
        .forEach(id => sendTo("broadcast", id, channel, data));
    }

    function sendTo(type: MessageType, id: string, channel: string, data: any) {
      const message: Message = { type, id: ID, data, channel };
      connections[id]?.send(JSON.stringify(message));
    }

    function sendList() {
      sendTo("list", ID, "", Object.keys(connections));
    }

    connection.on("message", e => {
      const message = JSON.parse(e.toString("utf-8")) as Message;
      switch (message.type) {
        case "broadcast":
          return broadcast(message.channel, message.data);
        case "target":
          return sendTo("target", message.id, message.channel, message.data);
        case "list":
          return sendList();
        default:
          return;
      }
    });
    connection.on("close", () => {
      delete connections[ID];
      connection.removeAllListeners();
    });
  });
}
