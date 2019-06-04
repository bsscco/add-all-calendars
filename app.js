process.env.TZ = 'GMT-9';
console.log(new Date().toTimeString());

const fs = require('fs');
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const {google} = require('googleapis');

const {client_secret, client_id, redirect_uris} = JSON.parse(fs.readFileSync(__dirname +  '/google-oauth-client-id.json')).web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const config = JSON.parse(fs.readFileSync(__dirname +  '/config.json'));

google.options({auth: oAuth2Client});

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(morgan());

app.get('/', (req, res) => {
    // res.sendStatus(200);

    if (req.query.code) {
        res.send('30초~2분 사이에 서서히 추가됩니다. <a href="http://calendar.google.com">구글 캘린더에서 확인하기</a>');

        let calendarAccessToken;
        oAuth2Client.getToken(req.query.code)
            .then(res => {
                calendarAccessToken = res.tokens.access_token;

                return axios.get('https://slack.com/api/users.list', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + config.slack_bot_access_token
                    }
                });
            })
            .then(res => {
                const liveMembers = res.data.members.filter(member => {
                    return !member.deleted && !member.is_bot && member.id !== 'USLACKBOT' && !member.is_restricted;
                });

                addCalendar(liveMembers, 0, calendarAccessToken);
// addCalendar(calendarAccessToken, 'jony@bucketplace.net')
            })
            .catch(err => {
                console.log(err.message);
            })
    } else {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/calendar']
        });

        res.send('<a href="' + authUrl + '">내 캘린더 대시보드에 전사 개인캘린더를 추가하기</a>');
    }
});

function addCalendar(liveMembers, idx, accessToken) {
    if (idx >= liveMembers.length) {
        return;
    }

    axios.post(
        'https://www.googleapis.com/calendar/v3/users/me/calendarList',
        JSON.stringify({
            id: liveMembers[idx].profile.email,
            summaryOverride: liveMembers[idx].profile.display_name + '(' + liveMembers[idx].profile.real_name + ')'
        }), {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + accessToken
            }
        })
        .then(res => {
            addCalendar(liveMembers, idx + 1, accessToken);
        })
        .catch(err => {
            console.log(err.message); // 자기 자신의 이메일은 403 Forbidden으로 에러나니까 이건 무시
            addCalendar(liveMembers, idx + 1, accessToken);
        });
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});