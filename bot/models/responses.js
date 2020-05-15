#!/usr/bin/nodejs
/* jshint browser:true, mocha:true, node:true, devel:true  */
/* globals */

/*
 * @author Xunnamius
 */

"use strict";

const globals = require(`${__dirname}/../config/globals`);

/**
 * Boilerplate responses that can be given by Lax in various situations. Each
 * string key is mapped to a template function that accepts as a parameter an
 * array of variables and returns a valid string with those variables
 * interpolated.
 *
 * You can invoke responses in the following ways:
 *
 * @example RESPOND.edgeInteractionNotAllowedWarning(...responseVars);
 * @example RESPOND.edgeInteractionNotAllowedWarning(message.user.displayName);
 *
 * The required parameters of each response are detailed below:
 *
 * edgeInteractionNotAllowedWarning(username)
 * inMaintenanceMode(username, code)
 *
 * @type {Object<Function>}
 */
module.exports = {
    edgeInteractionNotAllowedWarning:
        globals.reuse`Sorry, ${0}. I am the beta version of Lax and so only accept commands from certain members.`,
    inMaintenanceMode:
        globals.reuse`Sorry, ${0}. I'm not accepting any commands at the moment (code: ${1}).`,
};
