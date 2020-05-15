#!/usr/bin/nodejs
/* jshint browser:true, mocha:true, node:true, devel:true  */
/* globals */

/*
 * @author Xunnamius
 */

"use strict";

/**
 * All of the various errors that Lax can throw. To reference these errors, you
 * must use the `ERR` constant.
 *
 * For example, to reference the "badContext" error you would do the following:
 *
 * @example ERR.badContext
 *
 * @type {Array<String>}
 */
const ERRORS = [
    'platformMismatch',
    'badContext',
    'noContext',
    'badInvite',
    'maintenanceMode',
];

ERRORS.forEach((item, index) => module.exports[item] = Math.pow(2, index));
