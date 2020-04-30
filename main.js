// メインプロセス

const { app, BrowserWindow, ipcMain } = require('electron');
const request = require('request');

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1060,
        height: 240,
        frame: false, 
        skipTaskbar: true,
        webPreferences: { nodeIntegration: true }
    });
    mainWindow.loadFile('public/index.html');
    mainWindow.on('closed', () => { mainWindow = null; });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (mainWindow === null) createWindow();
});

ipcMain.on('wetherCheck', (e, city) => {
    if(!city) city = 130010; // Tokyo(130010)
    let data = wetherCheck(city);
});

let wetherCheck = (city) => {
    try {
        let options = {
            url: 'http://weather.livedoor.com/forecast/webservice/json/v1?city='+city,
            method: 'GET',
        }

        request.get(options, function (err, res, body) {
            mainWindow.webContents.send('receiveWether', JSON.parse(body));
            console.log('access wether api');
        });

    } catch (e) {
        console.log('wetherCheck error: ' + e);
    }
}