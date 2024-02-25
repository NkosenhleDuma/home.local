var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var _this = this;
var express = require('express');
var axios = require('axios');
var app = express();
var fs = require('fs');
var path = require('path');
var https = require('https');
require("dotenv").config();
app.use(express.json());
var CACHE_FILE = path.join(__dirname, 'cache.json'); // Path to the cache file
// Function to read cache from file
var readCache = function () {
    if (fs.existsSync(CACHE_FILE)) {
        var fileContent = fs.readFileSync(CACHE_FILE, 'utf8');
        return JSON.parse(fileContent);
    }
    return {};
};
// Function to write cache to file
var writeCache = function (cache) {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
};
app.use(express.json()); // Middleware to parse JSON bodies
app.use('/proxy/rms', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var url, headers, response, _a, url_1, bodyContent, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                url = req.method === 'POST' ? req.body.url : req.query.url;
                headers = req.headers;
                // Basic validation of the URL
                if (!url || !url.startsWith('http')) {
                    return [2 /*return*/, res.status(400).send('Invalid URL')];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 6, , 7]);
                response = void 0;
                if (!(req.method === 'POST')) return [3 /*break*/, 3];
                _a = req.body, url_1 = _a.url, bodyContent = __rest(_a.data, []);
                return [4 /*yield*/, axios.post(decodeURIComponent(url_1), bodyContent, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) })];
            case 2:
                response = _b.sent();
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, axios.get(url, { headers: headers, httpsAgent: new https.Agent({ rejectUnauthorized: false }) })];
            case 4:
                // For GET, directly forward the request
                response = _b.sent();
                _b.label = 5;
            case 5:
                // Send back the response from the external server
                res.send(response.data);
                return [3 /*break*/, 7];
            case 6:
                error_1 = _b.sent();
                console.error(error_1);
                res.status(500).send('Error fetching data');
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
var cache = {}; // Simple in-memory cache
var CACHE_DURATION = 3600 * 1000; // 1 hour cache duration
app.use('/proxy/loadshedding', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var url, cache, now, timeElapsed, timestamp, response, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = req.query.url;
                cache = readCache();
                now = new Date();
                timeElapsed = Number.MAX_VALUE;
                if (cache[url]) {
                    timestamp = new Date(cache[url].timestamp);
                    timeElapsed = now.getTime() - timestamp.getTime();
                }
                if (!(cache[url] && timeElapsed < CACHE_DURATION)) return [3 /*break*/, 1];
                // Serve data from cache if it's still valid
                console.log("Loading cached data...");
                res.send(cache[url].data);
                return [3 /*break*/, 5];
            case 1:
                // Fetch from API and update cache
                console.log("Fetching data using the API key: ", process.env['ESP_API_KEY']);
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, axios.get(url, {
                        headers: {
                            token: process.env['ESP_API_KEY']
                        }
                    })];
            case 3:
                response = _a.sent();
                cache[url] = { data: response.data, timestamp: now.getTime() };
                writeCache(cache);
                res.send(response.data);
                return [3 /*break*/, 5];
            case 4:
                error_2 = _a.sent();
                console.error(error_2);
                res.status(500).send('Error fetching data');
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.listen(3001, function () { return console.log('Proxy server running on port 3001'); });
