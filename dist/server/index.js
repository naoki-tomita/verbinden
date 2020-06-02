"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listen = void 0;
var WebSocket = __importStar(require("ws"));
var Server = WebSocket.Server;
function parseQuery(url) {
    return (url.split("?")[1] || "")
        .split("&")
        .map(function (it) { return it.split("="); })
        .reduce(function (prev, _a) {
        var _b;
        var key = _a[0], value = _a[1];
        return (__assign(__assign({}, prev), (_b = {}, _b[key] = value, _b)));
    }, {});
}
function listen(port) {
    if (port === void 0) { port = 8000; }
    var server = new Server({ port: port });
    var connections = {};
    server.on("connection", function (connection, request) {
        var query = parseQuery(request.url || "");
        var ID = query.id;
        connections[ID] = connection;
        setTimeout(sendList, 500);
        function broadcast(channel, data) {
            Object.keys(connections)
                .filter(function (id) { return id !== ID; })
                .forEach(function (id) { return sendTo("broadcast", id, channel, data); });
        }
        function sendTo(type, id, channel, data) {
            var _a;
            var message = { type: type, id: ID, data: data, channel: channel };
            (_a = connections[id]) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(message));
        }
        function sendList() {
            sendTo("list", ID, "", Object.keys(connections));
        }
        connection.on("message", function (e) {
            var message = JSON.parse(e.toString("utf-8"));
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
        connection.on("close", function () {
            delete connections[ID];
            connection.removeAllListeners();
        });
    });
}
exports.listen = listen;
