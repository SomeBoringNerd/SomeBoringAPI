const express = require('express')
const needle = require('needle')
const mysql = require('mysql');

const { Webhook, Embed } = require('simple-discord-wh');

const bodyParser = require('body-parser')

const crypto = require('crypto');
const exec = require('child_process');

var config=require('./config.json')

var GithubWebHook = require('express-github-webhook');

var secret = config.github_secret;
var webhook = config.webhook;
var webhook_api = config.webhook_api;
var webhook_loader = config.webhook_loader;
var domain = config.domain;

var con = mysql.createConnection({
    host: config.db_host,
    user: config.db_user,
    password: config.db_password,
    database: config.db_database
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

var webhookHandler = GithubWebHook({ path: '/api/hook/ttd', secret: secret });
const hook_game = new Webhook(webhook)
const hook_modding = new Webhook(webhook_api)
const hook_loader = new Webhook(webhook_loader)

const api = express();

const ip = domain;
const port = 1234

let sub = "/api"

webhookHandler.on('*', function (event, repo, data) {

    let title_and_message;

    try
    {
        title_and_message = data['head_commit']['message']
    }
    catch
    {
        title_and_message = "No title given \n\n No description given"
    }

    let splited = title_and_message.split('\n\n')
    let title = splited[0]
    splited[0] = '';
    let msg = splited.join("");

    switch(data['repository']['full_name']){
        case "SomeBoringNerd/throughthedark":
            const hook_1 = new Embed()
                .setTitle('New commit on ' + data['repository']['full_name'])
                .setAuthor('SomeBoringAPI', 'https://cdn.discordapp.com/avatars/283205890474115072/6c7f9f422b07832ea61721dd8f5627db.webp', 'https://someboringnerd.xyz/api')
                .addField('Title', title , true)
                .addField('Description', msg , true)
                .setColor('#00b0f4')
                .setTimestamp();

                hook_1.send(hook_game);
            break;
        case "UnityModdingGroup/ModTemplate":
            const hook_2 = new Embed()
                .setTitle('New commit on ' + data['repository']['full_name'])
                .setAuthor('SomeBoringAPI', 'https://cdn.discordapp.com/avatars/283205890474115072/6c7f9f422b07832ea61721dd8f5627db.webp', 'https://someboringnerd.xyz/api')
                .addField('Title', title , true)
                .addField('Description', msg , true)
                .setColor('#00b0f4')
                .setTimestamp();

                hook_2.send(hook_modding);
            break;
        case "UnityModdingGroup/UnityModLoader":
            const hook_3 = new Embed()
                .setTitle('New commit on ' + data['repository']['full_name'])
                .setAuthor('SomeBoringAPI', 'https://cdn.discordapp.com/avatars/283205890474115072/6c7f9f422b07832ea61721dd8f5627db.webp', 'https://someboringnerd.xyz/api')
                .addField('Title', title , true)
                .addField('Description', msg , true)
                .setColor('#00b0f4')
                .setTimestamp();

                hook_3.send(hook_loader);
            break;
    }

});

api.listen(port, () => {
    console.log("loaded api on http://" + ip + ":" + port + "/api")
})

api.use(bodyParser.json()); // must use bodyParser in express

// in latest body-parser use like below.
api.use(bodyParser.urlencoded({ extended: true }));

api.use(webhookHandler);

api.get(sub, (req, res) => {

    let txt = "";
    txt += "<html>\n<head>\n<title>" + ip + "/api" + "</title>\n</head>\n"
    txt += '<h1>list of valid endpoints</h1>\n';
    
    txt += '<a href="/api/ttd/student?id=1">https://' + ip + '/api/ttd/student?id=1</a>\n<br><br>\n'
    txt += '<a href="/api/status?ip=4b4f.org">https://' + ip + '/api/status?ip=4b4f.org</a>\n<br><br>\n'
    txt += '<a href="/api/ttd/download/win">https://' + ip + '/api/ttd/download/win</a>\n<br><br>\n'
    txt += '<a href="/api/ttd/download/mac">https://' + ip + '/api/ttd/download/mac</a>\n<br><br>\n'
    txt += '<a href="/api/ttd/download/nix">https://' + ip + '/api/ttd/download/nix</a>\n<br><br>\n'

    res.send(txt)
})

api.get(sub + '/status', (req, res) => 
{

    if(req.query.ip == undefined)
    {
        res.send('please enter an ip like this : <a href="/api/status?ip=4b4f.org">/api/status?ip=4b4f.org<a>')
    }
    else
    {
        let minecraft_status = "";
        needle('get', "https://api.mcsrvstat.us/2/" + req.query.ip).then(r => {
            minecraft_status += "<html>\n<head>\n<title>Minecraft Lookup</title>\n</head>\n"
            minecraft_status += "<h1>info about the server " + req.query.ip + "</h1>\n<body>\n"

            minecraft_status += "ip : " + r.body['ip'] + '\n'
            minecraft_status += "<br>port : " + r.body['port'] + '\n'
            minecraft_status += "<br>motd : " + r.body['motd']['clean'][0] + '\n'
            minecraft_status += "<br>motd² : " + r.body['motd']['clean'][1] + '\n'
            minecraft_status += "<br>player count : " + r.body['players']['online'] + '\n'

            if(req.query.ip == "2b2t.org")
            {
                minecraft_status += "<br><h1>2b2t specific stuff</h1>\n"
                minecraft_status += "<h3>queue</h3>\n"
                minecraft_status += r.body['info']['clean'][1] + "<br>\n"
                minecraft_status += r.body['info']['clean'][0] + "\n"
            }

            minecraft_status += '<h3> values fetched from <a href="https://api.mcsrvstat.us">api.mcsrvstat.us</a></h3>\n</body>\n</html>'

            res.send(minecraft_status)
        })

    }
})

api.get(sub + '/ttd/student', (req, res) =>
{
    let id_select = parseInt(req.query.id) + 1;

    var sql = "SELECT * FROM character_list WHERE chr_id = " + id_select + ";";
    console.log(id_select)
    con.query(sql, function (err, result, field) {
        if (err) throw console.log(err);
        
        
        var sql2 = "SELECT * FROM character_list;";
        con.query(sql2, function (err, results, field)
        {
            _max = results.length;
                                    
            if(id_select - 1 > _max || id_select <= 1)
            {
                
                let json_obj = {
                    max: results.length
                }
                res.json(json_obj)
                
            }else{
                let json_student_obj = {
                    name: result[0].name,
                    gender: result[0].gender,
                    description: result[0].description,
                    personality: result[0].personality,
                    opinion: result[0].opinion,
                    romance: result[0].romance,
                    location: result[0].location
                }

                res.json(json_student_obj)
            }
        })
    });
});

api.get(sub + '/ttd/download/win', (req, res) => {
    res.send('<html><head><meta http-equiv="refresh" content="0; url=https://someboringnerd.xyz/download/latest_win.zip"/></html></head>')
})

api.get(sub + '/ttd/download/mac', (req, res) => {
    res.send('<html><head><meta http-equiv="refresh" content="0; url=https://someboringnerd.xyz/download/latest_mac.zip"/></html></head>')
})

api.get(sub + '/ttd/download/nix', (req, res) => {
    res.send('<html><head><meta http-equiv="refresh" content="0; url=https://someboringnerd.xyz/download/latest_nix.zip"/></html></head>')
})


api.get(sub + '/ttd/add/pre', (req, res) => {
    let add_pre = "<style>textarea {resize: none;}</style>\n";

    add_pre += '<form method="POST" action="/api/ttd/add/post">\n'
    add_pre += '<p>name</p>\n<input name="name" maxlength="254" size="32" autocomplete="off" required/>\n'
    add_pre += '<p>gender</p>\n<input name="gender" maxlength="254" size="32" autocomplete="off" required/>\n'
    add_pre += '<p>description</p>\n<textarea name="desc" maxlength="254" size="64" rows="5" cols="60" autocomplete="off" resize="none" required></textarea>\n'
    add_pre += '<p>opinion</p>\n<input name="opinion" maxlength="254" size="128" autocomplete="off" required/>\n'
    add_pre += '<p>romance</p>\n<input name="romance" maxlength="254" size="32" autocomplete="off" required/>\n'
    add_pre += '<p>personality</p>\n<input name="personality" maxlength="254" size="32" autocomplete="off" required/>\n'
    add_pre += '<p>location</p>\n<input name="location" maxlength="254" size="64" autocomplete="off" required/>\n'
    add_pre += '<p>token</p>\n<input type="password" name="token" maxlength="32" required/>\n<br>\n<input type="submit"/>\n'
    add_pre += '</form>'

    res.send(add_pre)
})

api.post(sub + '/ttd/add/post', (req, res) => 
{
    let char_add = ""

    if(req.body.token != config.chr_add_token)
    {
        char_add = "wrong password"   
    }else
    {
        
        var sql = "INSERT INTO character_list (name, gender, description, opinion, romance, personality, location) VALUES ?";
        var values = [
            [req.body.name,req.body.gender,req.body.desc,req.body.opinion,req.body.romance,req.body.personality,req.body.location]
        ];
        con.query(sql, [values], function (err, result) {
            if (err) throw char_add = err;
        });
    }

    res.send(char_add)
})