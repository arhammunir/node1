"use strict"


var express= require("express");
var app= express();
var bodyParser= require("body-parser");
var hbs= require("hbs");
var path= require("path");
var fs= require("fs");
var multer=  require("multer");
var {streamdata, streamData_image}= require("./data.js");
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
app.use(bodyParser.urlencoded({extended: true}));
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



app.get("/movie", (req, res)=>{
	var find= async function(){
		try{
			var data= await streamData_image.find({choose: "movie"})
			res.render("specific", {details: data})	
		}
		catch{
			(e)=>{console.log(e)}
		}
	};
	find();
})



app.get("/tv-show", (req, res)=>{
	var find= async function(){
		try{
			var data= await streamData_image.find({choose: "tv-show"})
			res.render("specific", {details: data})
		}
		catch{
			(e)=>{console.log(e)}
		}
	};
	find();
})



app.get("/web-series", (req, res)=>{
	var find= async function(){
		try{
			var data= await streamData_image.find({choose: "web-series"})
			res.render("specific", {details: data})
		}
		catch{
			(e)=>{console.log(e)}
		}
	};
	find();
})


app.get("/upload", (req, res)=>{
	res.render("upload")
})



app.get("/about", (req, res)=>{
	res.render("about")
})



app.get("/contact/:message", (req, res)=>{
	res.render("contact", {sub: req.params.message})
})


app.post("/contact", (req, res)=>{
	var transporter= mailer.createTransport({
		service: "gmail",
		auth: {
			user:process.env.EMAIL,
			pass:process.env.PASS
		}
	});
	var body={
		from:req.body.email,
		to:process.env.EMAIL,
		subject: req.body.message,
		html: `<p>req.body.input_message</p>`
	}
	transporter.sendMail(body, (err, result)=>{
		if(err){
			return(err)
		}
		else{
			console.log("MESSAGE SENT SUCCESSFULLY");
		}
	})
	res.render("contact")
})



app.get("/search", (req, res)=>{
	var f= async function(){
		try{
		var query= req.query.search;
		var q= query.toLowerCase();
		var data_title= await streamData_image.find({title: {$regex: q}})
		res.render("search", {search: data_title})

		}catch{
			(e)=>{console.log(e)}
			res.send("SOME ERROR IS OCCURED")
		}
		
	};
	f();
})



app.get("/autocomplete", (req, res)=>{
	var regex = new RegExp(req.query["term"], 'i');
	var db_data = streamData_image.find({title: {$regex: regex}}).limit(6);
	console.log("DB DATA IS"  +  db_data)
	db_data.exec(function(err, data){
		console.log("RESULT DATA IS" + data)
		var result = [];
		if(!err){
			if(data && data.length && data.length>0){
				data.forEach(user=>{
					var obj={
						id: user._id,
						label: user.title
					};
					result.push(obj);
				})
			}
			res.jsonp(result);
		}
		else{
			(e)=>{console.log(e)}
		}
	});
})


app.get("/watch/:id", (req, res)=>{
	var id =req.params.id;
	var find_all_data= async function(){
		try{
			var vidoe_data= await streamdata.findById({_id: id});
			var details= await streamData_image.findById({_id: id});
			var src= vidoe_data.video
			var title= details.title
			var des= details.des;
			var poster= details.image;
			var ext_name =path.extname(src);
			var e= ext_name.split(".")
			var ext= e[1]

			res.render("video", {src: src, title: title,
			 des: des, ext: ext, poster: poster});

			var videopath= __dirname+"/public/video/"+src

			server.on("request", (req, res)=>{
				var stream= fs.createReadStream(videopath);
				res.pipe(stream);
			})
		}
		catch{
			(e)=>{console.log("THE STREAM ERROR IS"+ e)}
		}

	};

	find_all_data();
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

app.post("/uploadfile", upload_video , (req, res)=>{
 var u_video= async function(){
 	try{
	var video_stream_data= new streamdata({
		video: req.file.filename
	})
	var id= video_stream_data._id;
	var data = await video_stream_data.save();
	if(e){
		res.send("EROORR" + e)
	}
	else{
		res.redirect("/")
	}

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

app.get("/details/:id", (req, res)=>{
	console.log(req.params.id)
	res.redirect("/")
})

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
	});
	res.redirect("/");
	var s_details= await stream_details.save();
	res.redirect("/").headers("200");

		}catch{
			(e)=>{console.log("THE DETAILS UPLOAD ERROR IS "+ e)}
		}
	};
	u_details();
}));



app.listen(port, ()=>{console.log(`CONNECTION IS CONNECTED AT PORT NO: ${port}`)})