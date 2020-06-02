"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Verbinden = void 0;
var Verbinden = /** @class */ (function () {
    function Verbinden(url) {
        this.members = [];
        this.observables = {};
        this.id = Math.random().toString(32).substring(2);
        this.client = new WebSocket(url + "?id=" + this.id);
        this.client.addEventListener("message", this.receiveMessage.bind(this));
    }
    Verbinden.prototype.receiveMessage = function (e) {
        var _this = this;
        var message = JSON.parse(e.data);
        switch (message.type) {
            case "list":
                this.members = message.data;
                this.observables.__member_changed__.forEach(function (cb) { return cb("__server__", _this.members); });
                return;
            default:
                this.observables[message.channel].forEach(function (cb) { return cb(message.id, message.data); });
                return;
        }
    };
    Verbinden.prototype.on = function (channel, cb) {
        this.observables[channel] = this.observables[channel] || [];
        this.observables[channel].push(cb);
    };
    Verbinden.prototype.onMemberChanged = function (cb) {
        this.observables["__member_changed__"].push(cb);
    };
    Verbinden.prototype.channel = function (channel) {
        var _this = this;
        return {
            target: function (id) {
                return {
                    send: function (data) { return _this._send({ type: "target", channel: channel, id: id, data: data }); }
                };
            },
            broadcast: function (data) {
                _this._send({ type: "broadcast", channel: channel, data: data });
            }
        };
    };
    Verbinden.prototype.send = function (channel, target, data) {
        this._send({ type: "target", channel: channel, id: target, data: data });
    };
    Verbinden.prototype._send = function (message) {
        this.client.send(JSON.stringify(message));
    };
    return Verbinden;
}());
exports.Verbinden = Verbinden;
//# sourceMappingURL=index.js.map