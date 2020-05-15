#!/usr/bin/nodejs
/* jshint browser:true, mocha:true, node:true, devel:true  */
/* globals */

/*
 * @author Xunnamius
 */

"use strict";

/**
 * ResponseQueue (more comments here)
 */
class ResponseQueue
{
    /**
     * Constructor (more comments here)
     */
    constructor(client, channel, delay, delayDecay, minDelay)
    {
        this._client = client;
        this._channel = channel;
        this._queue = [];
        this._delay = delay;
        this._delaySummand = delay;
        this._delayDecay = delayDecay;
        this._minDelay = minDelay;
        this._thinking = false;
    }

    add(...msg)
    {
        if(this._thinking)
        {
            this._delaySummand = Math.max(this._delaySummand/this._delayDecay, this._minDelay);
            this._delaySummand = Math.ceil((Math.random() * this._delaySummand / 2) + (this._delaySummand / 1.5));
            this._queue.push({ delay: this._delaySummand, msg: msg });
        }

        else
        {
            this._delaySummand = Math.max(Math.ceil((Math.random() * this._delay / 2) + (this._delay / 1.5)), this._minDelay);
            this._queue.push({ delay: this._delaySummand, msg: msg });
            this._timeout();
        }
    }

    _next()
    {
        return this._queue.shift() || { noop: true };
    }

    _timeout()
    {
        let responseObj = this._next();

        if(responseObj.noop)
        {
            this._thinking = false;
            return;
        }

        this._channel.startTyping();
        this._thinking = true;

        this._client.setTimeout(() =>
        {
            this._channel.send(...responseObj.msg);
            this._channel.stopTyping();
            this._timeout();
        }, responseObj.delay);
    }
}

module.exports = ResponseQueue;
