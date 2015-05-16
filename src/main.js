var app = require('app');
var BrowserWindow = require('browser-window');

var mainWindow;

app.on('ready', function () {

    var atomScreen = require('screen');
    var size = atomScreen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
        width: size.width,
        height: size.height,
        resizable: true
    });

    mainWindow.openDevTools();

    mainWindow.loadUrl('file://' + __dirname + '/../index.html');
});
