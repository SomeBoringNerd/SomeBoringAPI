# SomeBoringAPI

just an average backend api that have nothing special, outside of stuff for my own use

# endpoints : 

/api/through_the_dark/student?id=[number] : return a json array with the infos of a character of my game

/api/status?ip=[ip] : give infos of the minecraft server given (with additional info for specifics servers)

/api/ttd/download/win : download the windows build of the game

/api/ttd/download/mac : download the windows build of the game

/api/ttd/download/nix : download the windows build of the game

# how to install

Download and install Node, npm, and git

clone the repo : 
`git clone https://github.com/SomeBoringNerd/SomeBoringAPI`

go into the folder
`cd SomeBoringAPI`

install the dependancies :
`npm run install`

now, edit the config file :
`nano config.json`

if needed, place a discord webhook, and the github secret password of your choosen repo 
(more info here : https://docs.github.com/en/developers/webhooks-and-events/webhooks/about-webhooks)

if needed, place data base information

at last, run 
`node index.js`

and you are good to go ! go to http://localhost:1234/api and do whatever you want from that.

## note for nginx user

the instructions to put in your config is that : 
```
location /api
{
    proxy_pass http://localhost:1234;
}
```

if you want to change / need the subfolder, you'll need to change the variable sub in index.js, as well as the port
