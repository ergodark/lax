#!/usr/bin/env node
/*jshint esnext:true */
/*global process:false */

/*
 * @author Xunnamius
 */

"use strict";
const reuse = (strings) => (...vars) => strings.map((v, i) => `${v}${vars[i] || ''}`).join('');

/////////////////////////
// Customizable Region //
/////////////////////////

const LAX_PREVIEW_CHANNEL_ID        = '316789032447377423';
const PUBLIC_WARNING_SLEEP          = 5000;
const TYPING_RESPONSE_SLEEP         = 2000;
const CMD_PREFIX                    = '!';
const TYPING_RESPONSE_DELAY         = 2000;
const TYPING_RESPONSE_DELAY_DECAY   = 3;
const TYPING_RESPONSE_DELAY_MIN     = 500;

///////////////////
// Bootstrapping //
///////////////////

require('pkginfo')(module);
const util      = require('util');
const shell     = require('shelljs');
const rejoinder = require('rejoinder');

const Promise       = require('bluebird');
const Discord       = require('discord.js');
const Permissions   = Discord.Permissions;
const Invite        = Discord.Invite;

const globals  = require(`${__dirname}/config/globals`);
const responses = require(`${__dirname}/models/responses`);
const errors = require(`${__dirname}/models/errors`);
const secrets  = require(`${__dirname}/config/secrets.json`);

const ResponseQueue = require(`${__dirname}/models/ResponseQueue`);

const client  = new Discord.Client();
const execute = rejoinder.execute;
const echo    = rejoinder.echo;
const pkg     = module.exports;

globals.IS_RUNNING_WINDOWS = process.platform == 'win32';
globals.DEBUG_MODE = parseInt(process.env.APP_DEBUG_LEVEL || 0);
globals.SUPER_DEBUG_MODE = DEBUG_MODE > 1;
globals.APP_ENV = process.env.APP_ENV;

let context = null;
let startTime = ;
let givePublicWarning = true;
let previewChannel = null;
let previewMembers = null;
let responseQueues = new Map();

const inspect = obj =>
{
    return util.inspect(obj, false, DEBUG_MODE || 1, true);
};

const echoEventDebugIfSDM = (eventName, data) =>
{
    if(SUPER_DEBUG_MODE)
        echo.withPrefix(`{event:${eventName}}`, () => { echo.withPostfix.debug(inspect(data)); });
};

const implementMessageExtras = (message) =>
{
    message.forUs = false;
    message.mentions.byName   = false;
    message.mentions.byPrefix = false;

    message.sender = message.member ? message.member.displayName : `${message.author.tag} (member not on server)`;

    if(message.isMentioned(client.user.id) && message.cleanContent.indexOf('@') == message.cleanContent.lastIndexOf('@'))
        message.mentions.byName = true;

    if(message.cleanContent.startsWith(CMD_PREFIX))
        message.mentions.byPrefix = true;

    message.forUs = message.member
        && client.user.id != message.member.id
        && (message.mentions.byName || message.mentions.byPrefix);

    message.text = message.cleanContent.replace(`@${client.nickname}`, '')
                                       .replace(`@${client.user.username}`, '')
                                       .replace(`@${client.user.tag}`, '')
                                       .replace('  ', ' ')
                                       .trim();

    if(message.mentions.byPrefix)
        message.text = message.cleanContent.substring(CMD_PREFIX.length).trim();
};

const implementChannelExtras = (channel) =>
{
    channel.typeAndSend = (...msg) => responseQueues.get(channel.id).add(...msg);
};

////////////////////
// Initialization //
////////////////////

const init = () =>
{
    echo.withPrefix('{initialization}', () =>
    {
        echo.beVerbose = !!DEBUG_MODE;

        echo.ifDebug(`DEBUG_MODE <- level ${inspect(DEBUG_MODE)}`);
        echo.ifDebug(`!!! SUPER_DEBUG_MODE <- ${inspect(SUPER_DEBUG_MODE)} (passwords become visible)`);

        if(!contexts)
            echo.thenBadExit(ERR.noContext, `failed to load "contexts.json" file`);

        contexts.currentContext = process.env.APP_CONTEXT || APP_ENV;

        echo.ifDebug(`resolved context to "${contexts.currentContext}"`);

        context = contexts[contexts.currentContext];

        if(!context)
            echo.thenBadExit(ERR.badContext, `context "${contexts.currentContext}" cannot be resolved`);

        echo.logFilePath = `${context.logDirPath}${contexts.currentContext}.log`;

        echo.ifDebug(`log path <- ${echo.logFilePath}`);
        echo.ifDebug(`IS_RUNNING_WINDOWS <- ${IS_RUNNING_WINDOWS}`);
        echo.ifDebug(`"${contexts.currentContext}" full context object: ${inspect(context)}`);

        if(!context.worksWithWindows && IS_RUNNING_WINDOWS)
            echo.thenBadExit(ERR.platformMismatch, `${context.serverOptions.name} cannot run on a Microsoft Windows OS in this context`);

        if(IS_RUNNING_WINDOWS)
        {
            shell.config.silent = true;
            if(context.logDirPath) shell.mkdir('-p', `${context.logDirPath}`);
            shell.rm(`${echo.logFilePath}`);
            shell.config.silent = false;

            shell.touch(`${echo.logFilePath}`);
            echo.toLog(`{WINDOWS} created ${echo.logFilePath}`);
        }

        else
        {
            if(context.logDirPath) execute.butIgnoreErrors(`mkdir -p ${context.logDirPath}`);
            execute.now(`: > ${echo.logFilePath}`);
        }

        echo.toLog((new Date()).toUTCString());
        context.discordToken = process.env.APP_TOKEN;

        echo.withPostfix.info(`${context.meta.serverName} version ${pkg.version}`);
        echo.withPostfix.info(`using discord.js version ${Discord.version}`);
        if(SUPER_DEBUG_MODE) echo.ifDebug(`APP_TOKEN <- ${context.discordToken}`);

        // Log our bot in
        client.login(context.discordToken);
    });
};

/////////////////////////
// Discord Interfacing //
/////////////////////////

client.on('ready', () =>
{
    echo.withPrefix('{ready}', () =>
    {
        echo.withPostfix.info(`connected with Discord remote API at ${(new Date()).toUTCString()}`);

        previewChannel = client.channels.get(LAX_PREVIEW_CHANNEL_ID);
        previewMembers = previewChannel.members;
        client.nickname = previewMembers.get(client.user.id).displayName;

        client.channels.forEach((channel, channelId) =>
        {
            responseQueues.set(channelId,
                new ResponseQueue(client, channel, TYPING_RESPONSE_DELAY, TYPING_RESPONSE_DELAY_DECAY, TYPING_RESPONSE_DELAY_MIN));
        });

        Promise.coroutine(function*()
        {
            echo.withPostfix.info(`generating administrator invitation...`);
            let invite = yield client.generateInvite(Permissions.FLAGS.ADMINISTRATOR);
            
            if(!invite)
                echo.thenBadExit(ERR.badInvite, `failed to generate invite URL`);

            echo.withPostfix.info(`bot is ready!`);
            echo.withPostfix.info(`add the bot to a server with URL ${invite}`);
        })();
    });
});

// Create an event listener for messages
client.on('message', message =>
{
    echo.withPrefix('{message}', () =>
    {
        implementMessageExtras(message);
        implementChannelExtras(message.channel);

        if(!message.forUs)
            return;

        if(APP_ENV == 'development')
        {
            if(message.mentions.byName)
            {
                if(message.channel.name == LAX_PREVIEW_CHANNEL_ID || previewMembers.has(message.member.id))
                    interpretMessageInPreviewContext(message);

                else if(givePublicWarning)
                {
                    givePublicWarning = false;
                    message.channel.typeAndSend(RESPOND.edgeInteractionNotAllowedWarning(message.sender));
                }
            }
        }

        else
            interpretMessageInRealContext(message);
    });
});

client.setInterval(() =>
{
    givePublicWarning = true;
}, PUBLIC_WARNING_SLEEP);

////////////////////////////
// Command Interpretation //
////////////////////////////

const interpretMessageInPreviewContext = (message) =>
{
    // determine if command or text for LUIS (commander)

    message.channel.typeAndSend(`I acknowledge your awesomeness, ${message.sender}`);
};

const interpretMessageInRealContext = (message) =>
{
    //if(message.mentions.byPrefix)
    //    interpret as command
    //else
    //    determine if command or text for LUIS (commander)
    message.channel.typeAndSend(RESPOND.inMaintenanceMode(message.sender, ERR.maintenanceMode));
};

////////////
// Start! //
////////////

init();
