const http = require("http");
const { gzipSync, gunzipSync } = require("zlib");

const HOSTNAME = "174.138.116.133";
const PORT = 8443;

function doUnverifiedRequest(url, body) {
    return new Promise((resolve, reject) => {
        const dataString = JSON.stringify(body);
        const dataGziped = gzipSync(dataString);
        const data64 = dataGziped.toString("base64");
        const options = {
            hostname: HOSTNAME,
            port: PORT,
            path: url,
            method: "PUT"
        };
        const req = http
            .request(options, (res) => {
                let chunks = "";
                res.on("data", function (res) {
                    chunks += res;
                });
                res.on("end", function () {
                    const un64ed = Buffer.from(chunks, "base64");
                    const decoded = gunzipSync(un64ed);
                    const payloadObject = JSON.parse(decoded.toString());
                    console.log(
                        "Request",
                        url,
                        body,
                        "received response",
                        res.statusCode
                    );
                    resolve({ response: res, payload: payloadObject });
                });
            })
            .on("error", function (e) {
                console.log("Request", url, body, "got error", e.message);
                reject(e);
            });
        req.write(data64);
        req.end();
    });
}

async function fetchPlayerLeaderboard() {
    const { payload } = await doUnverifiedRequest("/api/leaderboard", {
        global: {},
        purpose: "get",
        count: 15,
        position: 0,
    });
    return payload;
}

fetchPlayerLeaderboard().then((payload) =>
    console.log("Player #1 rank", payload.users[0])
);
