const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const rateLimiter = require('express-rate-limit');
const compression = require('compression');

app.use(compression({
    level: 5,
    threshold: 0,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));
app.set('view engine', 'ejs');
app.set('trust proxy', 1);
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
    );
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url} - ${res.statusCode}`);
    next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(rateLimiter({ windowMs: 5 * 60 * 1000, max: 800, headers: true }));
app.all('/favicon.ico', function(req, res) {
    
});
app.all('/player/register', function(req, res) {
    res.send("Coming soon...");
});
app.all('/player/login/dashboard', function (req, res) {
    const tData = {};
    try {
        const uData = JSON.stringify(req.body).split('"')[1].split('\\n'); const uName = uData[0].split('|'); const uPass = uData[1].split('|');
        for (let i = 0; i < uData.length - 1; i++) { const d = uData[i].split('|'); tData[d[0]] = d[1]; }
        if (uName[1] && uPass[1]) { res.redirect('/player/growid/login/validate'); }
    } catch (why) { console.log(`Warning: ${why}`); }

    res.render(__dirname + '/public/dashboard.ejs', {data: tData});
});

app.all('/player/growid/login/validate', (req, res) => {
    const _token = req.body._token;
    const growId = req.body.growId;
    const password = req.body.password;

    const token = Buffer.from(
        `_token=${_token}&growId=${growId}&password=${password}`,
    ).toString('base64');
   
    res.send(
        `{"status":"success","message":"Account Validated.","token":"${token}","url":"","accountType":"growtopia", "accountAge": 2}`,
    );
});
app.all('/player/growid/checktoken', (req, res) => {
    const { refreshToken } = req.body;
    try {
    const decoded = Buffer.from(refreshToken, 'base64').toString('utf-8');
    if (typeof decoded !== 'string' && !decoded.startsWith('growId=') && !decoded.includes('passwords=')) return res.render(__dirname + '/public/html/dashboard.ejs');
    res.json({
        status: 'success',
        message: 'Account Validated.',
        token: refreshToken,
        url: '',
        accountType: 'growtopia',
        accountAge: 2
    });
    } catch (error) {
        console.log("Redirecting to player login dashboard");
        res.render(__dirname + '/public/dashboard.ejs');
    }
});
app.get('/', function (req, res) {
   res.send('Hello Memek');
});

app.listen(5000, function () {
    console.log('Listening on port 5000');
});
