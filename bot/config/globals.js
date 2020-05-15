#!/usr/bin/nodejs
/* jshint browser:true, mocha:true, node:true, devel:true  */
/* globals */

/*
 * @author Xunnamius
 */

"use strict";

const globals = {};

globals.reuse = (strings) => (...vars) => strings.map((v, i) => `${v}${vars[i] || ''}`).join('');

globals.LAX_PREVIEW_CHANNEL_ID      = '316789032447377423';
globals.PUBLIC_WARNING_SLEEP        = 5000;
globals.TYPING_RESPONSE_SLEEP       = 2000;
globals.CMD_PREFIX                  = '!';
globals.TYPING_RESPONSE_DELAY       = 2000;
globals.TYPING_RESPONSE_DELAY_DECAY = 3;
globals.TYPING_RESPONSE_DELAY_MIN   = 500;

globals.IS_RUNNING_WINDOWS          = process.platform == 'win32';
globals.DEBUG_MODE                  = parseInt(process.env.APP_DEBUG_LEVEL || 0);
globals.SUPER_DEBUG_MODE            = DEBUG_MODE > 1;
globals.APP_ENV                     = process.env.APP_ENV;

globals.inspect = obj =>
{
    return util.inspect(obj, false, DEBUG_MODE || 1, true);
};

globals.implementMessageExtras = (message) =>
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

globals.implementChannelExtras = (channel) =>
{
    channel.typeAndSend = (...msg) => responseQueues.get(channel.id).add(...msg);
};

module.exports = globals;
