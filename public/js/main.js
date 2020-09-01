$(document).ready( () => {
    changePosition();
    getWeather();
    
    setInterval(frame,500);
    setInterval(getWeather,1000*60*60*3);
});

$(window).resize( () => { changePosition() });

const {ipcRenderer} = require('electron');
const clockSizeHeight = 200;
const clockSizeWidth = 1036;
let colon = false;
let startDay;
/*
ipcRenderer.on('receiveWether', (event, arg) => {
    let tempMin, tempMax, weatherParam;
    let tempJson = arg.forecasts[0].temperature;
    let weatherTelop = arg.forecasts[0].telop;
    
    if(tempJson.min){
        tempMin = new Number(tempJson.min.celsius);
        $('#clock .info-temp.min').text(tempMin.toFixed(1));
        
    } else {
        $('#clock .info-temp.min').text('---');
    }
    
    if(tempJson.max){
        tempMax = new Number(tempJson.max.celsius);
        $('#clock .info-temp.max').text(tempMax.toFixed(1)+'℃');
        
    } else {
        $('#clock .info-temp.max').text('---℃');
    }
    
    if(weatherTelop.indexOf('雪') !== -1) {
        // 雪(5)
        $('#clock .info-weather').text(5);
        
    } else if(weatherTelop.indexOf('雷') !== -1) {
        if(weatherTelop.indexOf('雨') !== -1) {
            // 雷雨(7)
            $('#clock .info-weather').text(7);
            
        } else {
            // 雷(8)
            $('#clock .info-weather').text(8);
        }
    } else if(weatherTelop.indexOf('雨') !== -1) {
        if(weatherTelop.indexOf('曇') !== -1) {
            // 曇ときどき雨(3)
            $('#clock .info-weather').text(3);
        } else {
            // 雨(4)
            $('#clock .info-weather').text(4);
        }        
    } else if(weatherTelop.indexOf('晴') !== -1) {
        if(weatherTelop.indexOf('曇') !== -1) {
            // 晴ときどき曇(9)
            $('#clock .info-weather').text(9);
        } else {
            // 晴れ(1)
            $('#clock .info-weather').text(1);
        }     
    } else if(weatherTelop.indexOf('曇') !== -1) {
        // 曇(2)
        $('#clock .info-weather').text(2);
    }
    
    $('#clock .weather-telop').text(weatherTelop);
    
});
*/

// JSONに含まれる天気情報から最新のものだけを抽出する
let findJson = (json) => {
    let date = new Date();
    let jsUnixTime = date.getTime();
    let StUnixTime = Math.floor(jsUnixTime/1000);
    let outputJson;
    
    for(let i=0; i<json.list.length; i++){
        console.log(json.list[i].dt, StUnixTime)
        
        if(json.list[i].dt >= StUnixTime){
            outputJson = json.list[i];
            return outputJson;
        }
    }
    
}

// 数字を四捨五入
let orgRound =(value, base) => {
    return Math.round(value * base) / base;
}

ipcRenderer.on('receiveWether', (event, arg) => {
    let json = findJson(arg);
    
    let tempMin = orgRound(json.main.temp_min - 273.15, 10), // 最低気温
        tempMax = orgRound(json.main.temp_max - 273.15, 10), // 最大気温
        temp = orgRound(json.main.temp - 273.15, 10), // 現在の気温
        weatherMain = json.weather[0].main, // 天気英語
        weatherDesc = json.weather[0].description, // 天気日本語テキスト
        humidity = json.main.humidity; // 湿度
    
    let outputText = '現在: <b>'+temp+'℃</b><br>湿度: <b>'+humidity+'%</b><br>天気: <b>'+weatherDesc+'</b>';
    
    if(tempMin){
        $('#clock .info-temp.min').text(tempMin.toFixed(1));
        
    } else {
        $('#clock .info-temp.min').text('---');
    }
    
    if(tempMax){
        $('#clock .info-temp.max').text(tempMax.toFixed(1)+'℃');
        
    } else {
        $('#clock .info-temp.max').text('---℃');
    }
    
    if(weatherMain.indexOf('Snow') !== -1) {
        // 雪(5)
        $('#clock .info-weather').text(5);
        
    } else if(weatherMain.indexOf('Thunder') !== -1) {
        if(weatherMain.indexOf('Rain') !== -1) {
            // 雷雨(7)
            $('#clock .info-weather').text(7);
            
        } else {
            // 雷(8)
            $('#clock .info-weather').text(8);
        }
    } else if(weatherMain.indexOf('Rain') !== -1) {
        if(weatherMain.indexOf('Clouds') !== -1) {
            // 曇ときどき雨(3)
            $('#clock .info-weather').text(3);
        } else {
            // 雨(4)
            $('#clock .info-weather').text(4);
        }        
    } else if(weatherMain.indexOf('Clear') !== -1) {
        if(weatherMain.indexOf('Clouds') !== -1) {
            // 晴ときどき曇(9)
            $('#clock .info-weather').text(9);
        } else {
            // 晴れ(1)
            $('#clock .info-weather').text(1);
        }     
    } else if(weatherMain.indexOf('Clouds') !== -1) {
        // 曇(2)
        $('#clock .info-weather').text(2);
    }
    
    $('#clock .weather-telop').html(outputText);
    
});

let frame = () => {
    let t = new Date();
    let h = t.getHours();
    let m = t.getMinutes();
    let s = t.getSeconds();
    let month = t.getMonth()+1;
    let date = t.getDate();
    let week = t.getDay();
    let weekStr = [ "SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT" ][week];
    let textHm, textS, textMonth, textDay, textWeek;
    
    // 日付が変更されたら天気を再取得
    if(!startDay) startDay = date;
    else if(startDay != date){
        getWeather();
        startDay = date;
    }
    
    if(colon){
        textHm = zeroPadding(h, 2) + ' ' + zeroPadding(m, 2);
        colon = false;
        
    } else {
        textHm = zeroPadding(h, 2) + ':' + zeroPadding(m, 2);
        colon = true;
    }
    
    textS = zeroPadding(s,2);
    textMonth = zeroPadding(month, 2);
    textDay = zeroPadding(date, 2);
    
    $('#clock .time-hm').text(textHm);
    $('#clock .time-s').text(textS);
    $('#clock .info-days.month').text(textMonth);
    $('#clock .info-days.day').text(textDay);
    $('#clock .info-week').text(weekStr);
}

let getWeather = () => {
    if(!API_KEY) console.log('API_KEY Not Found!');
    ipcRenderer.send('wetherCheck', API_KEY);
}

let changePosition = () => {
    let height = $(window).height();
    let width = $(window).width();
    let resizeHeight = (height / 2) - (clockSizeHeight / 2);
    let resizeWidth = (width / 2) - (clockSizeWidth / 2);
    $("#content").css("top", resizeHeight + "px");
    $("#content").css("left", resizeWidth + "px");
    
    if(width <= clockSizeWidth){
        $("html").css({transform:'scale(0.5)'});
        
    } else if(width >= clockSizeWidth*1.5){
        $("html").css({transform:'scale(1.5)'});
        
    } else if(height <= clockSizeHeight){
        $("html").css({transform:'scale(0.5)'});
        
    } else if(width >= clockSizeWidth){
        $("html").css({transform:'scale(1.0)'});
        
    } else if(height >= clockSizeHeight){
        $("html").css({transform:'scale(1.0)'});
    }
}

let zeroPadding = (num, len) => {
	return ( Array(len).join('0') + num ).slice( -len );
}