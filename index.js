const express = require('express')
const needle = require('needle')

const { Webhook, Embed } = require('simple-discord-wh');

const bodyParser = require('body-parser')

const crypto = require('crypto');
const exec = require('child_process');

var config=require('./config.json')

var GithubWebHook = require('express-github-webhook');

var secret = config.github_secret;
var webhook = config.webhook;
var domain = config.domain;

var webhookHandler = GithubWebHook({ path: '/api/hook/ttd', secret: secret });
const hook = new Webhook(webhook)

const api = express();

const ip = domain;
const port = 1234

let sub = "/api"

webhookHandler.on('*', function (event, repo, data) {

    let title_and_message = data['head_commit']['message'];
    let splited = title_and_message.split('\n\n')
    let title = splited[0]
    splited[0] = '';
    let msg = splited.join("");
    
    const embed = new Embed()
    .setTitle('New commit on ' + data['repository']['full_name'])
    .setAuthor('SomeBoringAPI', 'https://cdn.discordapp.com/avatars/283205890474115072/6c7f9f422b07832ea61721dd8f5627db.webp', 'https://someboringnerd.xyz/api')
    .addField('Title', title , true)
    .addField('Description', msg , true)
    .setColor('#00b0f4')
    .setTimestamp();

    hook.send(embed);


});

api.listen(port, () => {
    console.log("loaded api on http://" + ip + ":" + port + "/api")
})

api.use(bodyParser.json()); // must use bodyParser in express
api.use(webhookHandler);


api.get(sub, (req, res) => {

    let txt = "";
    txt += "<html>\n<head>\n<title>" + ip + "/api" + "</title>\n</head>\n"
    txt += '<h1>list of valid endpoints</h1>\n';
    
    txt += '<a href="/api/through_the_dark/student?id=0">https://' + ip + '/api/through_the_dark/student?id=0</a>\n<br><br>\n'
    txt += '<a href="/api/status?ip=4b4f.org">https://' + ip + '/api/status?ip=4b4f.org</a>\n<br><br>\n'

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

            minecraft_status += '<h3> values fetched from <a href="api.mcsrvstat.us">api.mcsrvstat.us</a></h3>\n</body>\n</html>'

            res.send(minecraft_status)
        })

    }
})

api.get(sub + '/through_the_dark/student', (req, res) =>
{
    if(character_name[req.query.id] != undefined)
    {
        
        
        let json_student_obj = {
            name: character_name[req.query.id],
            gender: gender[req.query.id],
            description: short_description[req.query.id],
            opinion: opinion[req.query.id],
            romance: romance[req.query.id],
            location: location[req.query.id]
        } 

        res.json(json_student_obj)
        
    }else{
        let max_id = character_name.length - 1;
        res.send("the id entered (" + req.query.id + ") is bigger than the allowed value (" + max_id + ")")
    }
});


let character_name = [
    "Diana",
    "Muzuniji",
    "Jukka",
    "\"Max\"",
    "Gabriel",
    "???",
    "??????",
    "\"looking-for-the-truth\"",
    "\"light-that-shine-upon-everything\"",
    "\"the-spy-from-france\"",
    "Giyomu",
    "Charlotte",
    "Himiko",
]

let gender = [
    "woman",
    "woman",
    "man",
    "man",
    "Unknown",
    "Unknown",
    "woman",
    "Unknown",
    "probably a man",
    "probably a woman",
    "man",
    "woman",
    "woman",
]

let short_description = [
    "oh wait, that's me!",
    "A kind trans-woman. Came from Japan to live her transition in a more tolerant society",
    "Your average buddy, quite laid-back but otherwise trustworthy and he's a bit nerdy",
    "Look like a hippie, but surprisingly he's not.",
    "they have around the same age as Diana, but they are not registered at school. The only reason they are allowed on school ground is because they personally know the principal and most teacher, meaning they are allowed to follow class if they want despite not being a registered student. They are not related to a teacher or the principal, they are just a friend of him.",
    "???",
    "???",
    "the person behind the pseudonyme \"looking-for-the-truth\" is a person that contacted Diana in order to collaborate and find answer about the disappearences. They don't want to meet you for some reasons.",
    "the person behind the pseudonyme \"light-that-shine-upon-everything\" is someone that take order from \"looking-for-the-truth\", and is kind of a spy. But for now, they don't have a lot of intel about the culprits.",
    "the person behind the pseudonyme \"the-spy-from-france\" is someone that take order from \"looking-for-the-truth\", and is have the task to analyse any clue they can find. For now, they didn't find a lot.",
    "Giyomu is the librarian of the school. He's a quiet, calm, collected man that can read people's feeling just by the look of their face, how they act, etc... He's also very cultured, and really nerdy.",
    "Charlotte is the wife of Giyomu. She work at the police station as a field agent.",
    "Himiko is the dead sister of Giyomu. She was investigating on dissapearences that occured in that exact town 18 years ago, and died seven days before Diana's birth. She would have been 36 this year"
]

let opinion = [
    "Well, I'm the best !",
    "\"i think that girl need a hug, she look sad\"",
    "He's one of her neighbors so he really like to spend time with her",
    "didn't meet before yet, new classmates to eachother but he trusts her",
    "a fellow comrade that have the same goal",
    "???",
    "???",
    "The answer to our questions",
    "A cool girl with lots of brain power",
    "She has yet to prove her worth.",
    "\"That Diana girl is very smart. I'm sure she can help around\"",
    "\"Diana is smart, but I'm sure she's not as smart as people like to say\" \n ||Fuck you Charlotte ?||",
    "Giyomu discribe her as a smart and cool girl.",
]

let romance = [
    "What do you think I am ? a narcissist ?",
    "yes",
    "yes",
    "maybe",
    "no",
    "no",
    "She's not yours.",
    "no",
    "no",
    "no",
    "He's 32, married, with two kids. That's not happening.",
    "She's 30, married, with two kids. That's not happening.",
    "NO.",
]

let personality = [
    "\"Cool smart and lonely\" ||and a huge weeb||",
    "\"Onee-san\"",
    "Nerd.",
    "Energetic",
    "Mysterious, almost weird. Also, very friendly",
    "Brutally honest",
    "Cute",
    "Mysterious and creepy at time, but otherwise really helpfull and trust-worthy",
    "Smart, and don't talk a lot. They are good at analysing informations and notice patterns.",
    "She's VERY arrogant, but otherwise cooperative",
    "Smart, calm, and a giant nerd",
    "A real bitch. At least she stand to her words.",
    "cool and smart, according to Giyomu",
]

let location = [
    "anywhere you are",
    "school",
    "school",
    "school",
    "School, city",
    "??????????",
    "??????????",
    "Unknown",
    "\"A man on a mission is only where we need him to be\"",
    "Mostly where we need her. Often on the field looking for clues.",
    "Mostly in the library, can sometime be seen with his wife outside of the school",
    "Mostly at the police station, can sometime be seen with her husband outside of the school",
    "6 feet deep inside the town's graveyard. She's next to the entrance, on your left when you enter. There is flowers on her grave, but according to Gimoyu, he's not the one who replace them every week.",
]