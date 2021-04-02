const express = require('express');
const axios = require('axios');
const ejs = require("ejs");
const bodyParser = require("body-parser");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

let statewise_data = [];
let stats = {
	name: "Choose State",
	active: 0,
	confirmed: 0,
	deaths: 0,
	recovered: 0,
	newConfirmed: 0,
	newDeaths: 0,
	newRecovered: 0,
}

let cases = [];

axios.get('https://api.covid19india.org/data.json')
  .then(response => {
    statewise_data = response.data.statewise;
    cases = response.data.cases_time_series;
  })
  .catch(error => {
    console.log(error);
  });

app.get("/",function(req,res){
	var confirm_cases = [];
	var state_names = [];
	var death_cases = [];
	var last_30days_cases = [];
	var last_30days_dates = [];
	var cases_timeline = [];

	statewise_data.forEach(s => {
		if(s.state !== 'Total'){
			confirm_cases.push(Number(s.confirmed));
			state_names.push(s.state);
			death_cases.push(Number(s.deaths));
		}
	});

	cases_timeline = cases.slice(-31,-1);
	cases_timeline.push(cases[cases.length - 1]);
	cases_timeline.forEach(item => {
		last_30days_cases.push(Number(item.dailyconfirmed));
		last_30days_dates.push(item.dateymd);
	});

	console.log(cases_timeline);

	res.render("index",{statewise_data:statewise_data,stats:stats,confirm_cases:confirm_cases,state_names:state_names,death_cases:death_cases,last_30days_cases:last_30days_cases,last_30days_dates:last_30days_dates});
});

app.post("/",function(req,res){
	let chosen_state = req.body.selected_state;
	statewise_data.forEach(s => {
		if(s.state === chosen_state){
			console.log(s.state);
			stats.name = s.state;
			stats.active = s.active;
			stats.confirmed = s.confirmed;
			stats.death = s.deaths;
			stats.recovered = s.recovered;
			stats.newRecovered = s.deltarecovered;
			stats.newDeaths = s.deltadeaths;
			stats.newConfirmed = s.deltaconfirmed;
		}
	});
	res.redirect("/");
});


app.listen(process.env.PORT || 3000,function(){
	console.log("Server started on port 3000");
})

