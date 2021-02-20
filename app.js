var express= require("express");
var app= express();
var bodyParser= require("body-parser");
var hbs= require("hbs");
var path= require("path");
var fs= require("fs");
var multer=  require("multer");
var port= process.env.PORT || 2000;
var t_dir= path.join(__dirname, "./public/views");
var static_path= path.join(__dirname, "./public/");
var partials_path= path.join(__dirname, "./public/partials");
var http=require("http");
var server= http.createServer();
var mailer= require("nodemailer");
var autocomplete= require("autocompleter");

try{
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}));
}catch{
	(e)=>{console.log(`READ ERROR IS ${e}`)}
}

app.use(express.static(__dirname+"/public/"));
app.set("view engine", "hbs")
app.set("views", t_dir);
hbs.registerPartials(partials_path);


app.get("/", (req, res)=>{
	var main= async function(){
		res.render("index")
	};
	main();
});




app.listen(port, ()=>{console.log(`CONNECTION IS CONNECTED AT PORT NO: ${port}`)})