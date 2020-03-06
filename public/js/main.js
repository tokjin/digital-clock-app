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
    ipcRenderer.send('wetherCheck', 130010);
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