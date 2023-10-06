require('dotenv').config();
const express = require('express');
const axios = require('axios');
const url = require('url');

const port = process.env.PORT || 1500;
const app = express();

app.get('/api/auth/discord/redirect', async (req, res) => {
    try {
        const { code } = req.query;

        if (code) {
            const formData = new url.URLSearchParams({
                client_id: process.env.CLIENTID,
                client_secret: process.env.CLIENTSECRET,
                grant_type: 'authorization_code',
                code: code.toString(),
                redirect_uri: 'http://localhost:1500/api/auth/discord/redirect',
            });

            const output = await axios.post('https://discord.com/api/v10/oauth2/token',
                formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            if (output.data) {
                const access = output.data.access_token;

                const userinfo = await axios.get('https://discord.com/api/v10/users/@me', {
                    headers: {
                        'Authorization': `Bearer ${access}`,
                    }
                })

                //refresh token

                const formData1 = new url.URLSearchParams({
                    client_id: process.env.CLIENTID,
                    client_secret: process.env.CLIENTSECRET,
                    grant_type: 'refresh_token',
                    refresh_token: output.data.refresh_token,
                });

                const refresh = await axios.post('https://discord.com/api/v10/oauth2/token',
                    formData1, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });

                console.log( output.data, userinfo.data, refresh.data);
            }
        }
    } catch (error) {
        console.error('Error during the authentication process:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => { console.log(`Running on port ${port}`) });
