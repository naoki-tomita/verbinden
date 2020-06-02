type MessageType = "target" | "broadcast" | "list";

interface MessageBase {
  type: MessageType;
  channel: string;
  data: any;
}

interface Response {
  id: string;
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
type Callback =  (from: string, data: any) => void;

export class Verbinden {
  private _id: string;
  get id() { return this._id }

  private client: WebSocket;

  private _members: string[] = [];
  get members() { return this._members.filter(id => id !== this.id) }

  private observables: { [channel: string]: Callback[] } = {}
  constructor(url: string) {
    this._id = Math.random().toString(32).substring(2);
    this.client = new WebSocket(`${url}?id=${this._id}`);
    this.client.addEventListener("message", this.receiveMessage.bind(this));
  }

  private receiveMessage(e: MessageEvent) {
    const message = JSON.parse(e.data) as Message & Response;
    switch (message.type) {
      case "list":
        this._members = message.data;
        (this.observables.__member_changed__ || []).forEach(cb => cb("__server__", this._members));
        return;
      default:
        this.observables[message.channel].forEach(cb => cb(message.id, message.data));
        return;
    }
  }

  on(channel: string, cb: Callback) {
    this.observables[channel] = this.observables[channel] || [];
    this.observables[channel].push(cb);
  }

  onMemberChanged(cb: () => void) {
    this.observables["__member_changed__"].push(cb);
  }

  channel(channel: string) {
    return {
      target: (id: string) => {
        return {
          send: (data: any) => this._send({ type: "target", channel, id, data })
        };
      },
      broadcast: (data: any) => {
        this._send({ type: "broadcast", channel, data });
      }
    }
  }

  send(channel: string, target: string, data: any) {
    this._send({ type: "target", channel, id: target, data });
  }

  private _send(message: Message) {
    this.client.send(JSON.stringify(message));
  }
}
