// native
var cp = require('child_process');
var path = require('path');
var readline = require('readline');

// external
var colors = require('colors/safe');

// internal
var CLI = require('cli');
var barter = require('barter-client');

var cli = new CLI({
    output: process.stdout,
    caseSensitive: false,
    prompt: function () {
        return colors.grey(path.basename(process.cwd()) + ': ')
    }
});

cli.commands({
    whoami: function() {
        return new Promise(function (resolve, reject) {

            if (!barter.getUser().token) {
                console.log('no user: must login first');
                resolve();
                return;
            }

            barter.whoami(function (err, user) {
                if (err) {
                    reject(err);
                    return;
                }
                console.log(user.username);
                resolve();
            });

        });
    },
    items: function() {
        return new Promise(function (resolve, reject) {

            resolve();

        });
    },
    login: function(username, password) {
        return new Promise(function (resolve, reject) {

            var user = barter.getUser();

            if (user.token) {
                console.log('already logged in: ' + user.username);
                resolve();
                return;
            }

            barter.login(username, password, function (err, user) {
                if (err) {
                    reject(err);
                    return;
                }
                console.log('successful login: ' + user.username);
                resolve();
            });

        });
    },
    logout: function() {
        return new Promise(function (resolve, reject) {

            barter.logout(function (err, res, body) {
                if (err) {
                    reject(err);
                    return;
                }
                console.log('successful logout');
                resolve();
            });

        });
    },
    clear: function() {
        readline.cursorTo(process.stdout, 0, 0);
    },
    exit: function() {
        return new Promise(function () {
            cli.close();
        });
    }
});

cli.onMissingCommand(function (command, args) {
    console.log(command + ': command not found');
});

cli.on('close', function () {

    if (barter.getUser().token) {
        barter.logout(function (err) {
            if (err) {
                console.log(err.stack);
                process.exit(1);
            }
            console.log('successful logout');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }

});

cli.prompt();