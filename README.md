# Lax

## The bot Discord deserves, but one it doesn't think it needs right now

### What is Lax?

Lax. It has some Slack-like features, but a whole lot more powerful. Oh, and it's for Discord and may eventually be accessible from Messenger (Facebook), accept commands via SMS/text and email, etc.

### Features

* (list to be populated eventually)
* [and many more...](#)

### For The Devs: Get Started Now!

Deving this bot is pretty easy. For this project, like any other semi-professional and professional project, commit flow control is strictly enforced. Each developer should have their own publically accessible branch named `yourname-develop`. You should test and develop your version of the bot locally to your satisfaction. When you have a feature that you believe is ready for life, pretty your history up a bit with a `git squash` and submit a merge request against the develop branch. The lead devs will then accept/reject merge requests into develop. If after testing your feature in the live staging environment it is deemed worthy, submit a new merge request from develop into master (ensure that you've bumped the version appropriately in develop's `package.json` but **only at this point**). @Xunnamius will then accept/reject merge requests into master.

When you first clone the project to begin developing, **don't forget to modify `.pm2-process.yml` and `secrets.json`** and add a context for your environment. `.pm2-process.yml` is **not** ignored by version control, so you should not put sensitive configuration variables inside of it. If you're thinking of adding new potentially sensitive configuration variables that must exist in upstream configurations and not just locally, please discuss first. `.secrets.yml` **is ignored by version control**, so you **should** put sensitive configuration variables inside of it and only it.

Relevant Discord stuff that you should take a look at:

* https://discordapp.com/developers/docs/intro
* https://discord.js.org/
* https://luis.ai
* https://github.com/Microsoft/Cognitive-LUIS-Node.js
* http://pm2.keymetrics.io/docs/usage/application-declaration/
* https://github.com/tj/commander.js

### Add Bot to Server

To add the production bot to a Discord server, use this URL: https://discordapp.com/oauth2/authorize?client_id=316786432306053121&permissions=8&scope=bot

To add the staging bot to a Discord server, use this URL: https://discordapp.com/oauth2/authorize?client_id=316788662283272192&permissions=8&scope=bot

Note that there are restrictions on which servers the bot will work properly on.

### In-depth API Documentation

(todo)
