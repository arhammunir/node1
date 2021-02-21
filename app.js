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
var {streamdata, streamData_image}= require("./data.js");

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
		var movie_data= await streamData_image.find({choose: "movie"}).limit(20).sort({date: -1});
		var web_series= await streamData_image.find({choose: "web-series"}).limit(20).sort({date: -1});
		var tv_show= await streamData_image.find({choose: "tv-show"}).limit(20).sort({date: -1});
		res.render("index", {
			movie: movie_data,
			web: web_series,
			tv: tv_show
			})
	};
	main();
});


app.get("/upload", (req, res)=>{
	res.render("upload")
})


var Storage_video= multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, "./public/video/")
	},
	filename:(req, file, cb)=>{
		cb(null, file.originalname)
	}
})

var upload_video= multer({storage: Storage_video}).single("file")

app.post("/uploadfile", upload_video ,(req, res)=>{
 var u_video= async function(){
 	try{
	var video_stream_data= new streamdata({
		video: req.file.filename
	})
	var data = await video_stream_data.save();
	res.render("detail", {id: data._id})
 	}catch{
 		(e)=>{console.log(`THE UPLOAD ERROR IS ${e}`)}
 	}
 };
 u_video();
})

try{

var Storage_image= multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, "./public/poster/")
	},
	filename:(req, file, cb)=>{
		cb(null, file.orirginalname)
	}
})
var upload_image= multer({storage: Storage_image}).single("file")
}
catch{
	(e)=>{console.log(`THE IMAGE UPLOAD ERROR IS ${e}`)}
}

var Storage_image= multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, "./public/poster/")
	},
	filename:(req, file, cb)=>{
		cb(null, file.originalname)
	}
})

var upload_image= multer({storage: Storage_image}).single("file")

app.post("/upload_details",upload_image,((req, res)=>{
	var u_details = async function(){
		try{
		var stream_details= new streamData_image({
		_id: req.body.id,
		image: req.file.filename,
		title: req.body.title,
		choose: req.body.choose,
		cate: req.body.categories,
		language: req.body.language,
		des: req.body.description
	})

	var s_details= await stream_details.save();
	res.end();

		}catch{
			(e)=>{console.log("THE DETAILS UPLOAD ERROR IS "+ e)}
		}
	};
	u_details();
}))





app.listen(port, ()=>{console.log(`CONNECTION IS CONNECTED AT PORT NO: ${port}`)})