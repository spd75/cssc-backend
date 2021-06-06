"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenType = exports.UserNotFound = exports.UserAuthenticationFailed = exports.PromiseSeriesFailed = exports.InvalidTokenError = void 0;
/* Errors */
exports.InvalidTokenError = new Error('Invalid token provided.');
exports.InvalidTokenError.name = 'InvalidTokenError';
exports.PromiseSeriesFailed = new Error('A series of promises failed.');
exports.PromiseSeriesFailed.name = 'PromiseSeriesFailed';
exports.UserAuthenticationFailed = new Error('User authentication failed.');
exports.UserAuthenticationFailed.name = 'UserAuthenticationFailed';
exports.UserNotFound = new Error('User not found.');
exports.UserNotFound.name = 'UserNotFound';
var TokenType;
(function (TokenType) {
    TokenType[TokenType["Auth"] = 0] = "Auth";
    TokenType[TokenType["Refresh"] = 1] = "Refresh";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
