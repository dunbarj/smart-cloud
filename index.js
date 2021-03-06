var express = require('express'),
	exphbs = require('express-handlebars'),
	bodyParser = require('body-parser'),
	request = require('request');

//var exec = require('child_process');

var key = '&APPID=cbfc62062e0959c6da8eb13c6e979d28';

var app = express();

var hbs = exphbs.create({
	defaultLayout: 'main',
});

var child;

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'));

//===== VARIABLES =====//
var ledOn = false;
var name;
var currentTemp;
var maxTemp;
var minTemp;
var wind;
var clouds;

var childmade = false;
var currentmode = 'fading';
var active = 0;
var filepath = "ledscripts/"

//===== ROUTES =====//
//Routes will be used to get the status of the server variables and the leds
app.get('/ledstatus', function(request, response) {
	response.write('ledOn: ' + ledOn + '\n');
	response.write('location: ' + name + '\n');
	response.write('current temperature: ' + currentTemp + ' degrees F\n');
	response.write('max temp: ' + maxTemp + ' degrees F\n');
	response.write('min temp: ' + minTemp + ' degrees F\n');
	response.write('wind: ' + wind.speed + ' mph at ' + wind.deg + ' degrees\n');
	response.write('cloud coverage: ' + clouds + '%\n');
	response.end();
});

app.get('/led', function(request, response) {
	var mode = request.query.mode;
	//console.log(mode);
	
	if (childmade && mode != 'on') {
		child.kill();
		childmade = false;
	}

	if (mode != null) {
		if (mode == 'off' && active == 1) {
			child = require('child_process').spawn('python', [filepath + 'off.py']);
			childmade = false;
			active = 0;
		}
		if (mode == 'on' && active == 0) {
			child = require('child_process').spawn('python', [filepath + 'fading.py']);
			childmade = true;
			active = 1;
		}
		else if (mode == 'fading') {
			child = require('child_process').spawn('python', [filepath + 'fading.py']);
			childmade = true;
			active = 1;
		}
		else if (mode == 'fadeslow') {
			child = require('child_process').spawn('python', [filepath + 'fadingslow.py']);
			childmade = true;
			active = 1;
		}
		else if (mode == 'rgb') {
			child = require('child_process').spawn('python', [filepath + 'rgb.py']);
			childmade = true;
			active = 1;
		}
		else if (mode == 'wtf') {
			child = require('child_process').spawn('python', [filepath + 'wtf.py']);
			childmade = true;
			active = 1;
		}
		else if (mode == 'weather') {
			child = require('child_process').spawn('python', [filepath + 'weather.py']);
			childmade = true;
			active = 1;
		}
	}
	response.sendFile(__dirname + '/views/index.html');	
});

//===== PORT =====//
var port = process.env.PORT || 5000;
app.listen(port);
console.log("Magic happens at " + port);

function checkWeather() {
	console.log("Checking updated weather information...");
	request('http://api.openweathermap.org/data/2.5/weather?id=4928096&units=imperial' + key, function (error, response, body) {
		if (error) {
			console.log(error);
			return;
        }
		
		var obj = JSON.parse(body);
		name = obj.name;
		currentTemp = obj.main.temp;
		maxTemp = obj.main.temp_max;
		minTemp = obj.main.temp_min;
		wind = obj.wind;
		clouds = obj.clouds.all;
	});		
}
checkWeather();
setInterval(checkWeather, 30000); //Check weather once per minute
