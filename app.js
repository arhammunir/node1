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
	console.log(req.body);
	console.log(req.file);
	var u_details = async function(){
		try{
		var stream_details= new streamData_image({
		_id: req.body.id,
		image: req.file.filename,
		title: req.body.title,
		des: req.body.description,
		choose: req.body.choose,
		language: req.body.language
	})

	var s_details= await stream_details.save();
	res.render("upload")

		}catch{
			(e)=>{console.log("THE DETAILS UPLOAD ERROR IS "+ e)}
		}
	};
	u_details();
}))

app.get("/", (req, res)=>{

	var main= async function(){
		var find_data= await streamData_image.find({});
		var data= find_data;
		res.render("index", {details: data})
	};
	main();
});

app.get("/watch/:id", (req, res)=>{
	var find_all_data= async function(){
		var id= req.params.id;
		try{
			var vidoe_data= await streamdata.findOne({_id: id});
			var details= await streamData_image.findOne({_id: id});
			var src= vidoe_data.video
			var title= details.title
			var des= details.des;
			var poster= details.image;
			var ext_name =path.extname(src);
			var e= ext_name.split(".")
			var ext= e[1]

			res.render("video", {src: src, title: title,
			 des: des, ext: ext, poster: poster});

			//STREAM FUNCTION
			var range= req.headers.range
			// if(!range){
			// 	res.status(400).send("ERROR IN STREAMING")
			// }
			var videopath= src
			var videosize= fs.statSync(src).size

			//PARSE RANGE
			//Example: "bytes=32324-"

			var chunksize= 10**6;
			var start = Number(range.replace(/\D/g, ""))
			var end= Math.min(start + chunksize, videosize - 1)

			var contentlength= end - start + 1;
			var headers={
				"Content-Range": `bytes ${start}-${end}/${videosize}`,
				"Accept-Range": "bytes",
				"Content-Length": contentlength,
				"Content-Type": `video/${ext}`
			};

			res.writeHead(206, headers);

			var videoStream= fs.createReadStream(videopath, {start, end});

			videoStream.pipe(res);
		}catch{
			(e)=>{console.log("THE STREAM ERROR IS"+ e)}
		}

	};
	find_all_data();
})

app.get("/movie", (req, res)=>{
	var find= async function(){
		try{
			var data= await streamData_image.find({choose: "movie"})
			console.log(data)
			res.render("index", {details: data})
			
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
			console.log(data)
			res.render("index", {details: data})
			
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
			console.log(data)
			res.render("index", {details: data})
			
		}
		catch{
			(e)=>{console.log(e)}
		}
	};
	find();
})


app.get("/search", (req, res)=>{
	var f= async function(){
		try{
		var query= req.query.search;
		var q= query.toLowerCase();
		var data= await streamData_image.find({});
		var alldata= data.image;
		console.log(alldata);
		var data_title= await streamData_image.find({title: q})

		if(data_title!==""){
			res.render("index", {details: data_title})
		}

		}catch{
			res.send("SOME ERROR IS OCCURED")
		}
		
	};
	f();
})










app.listen(port, ()=>{console.log(`CONNECTION IS CONNECTED AT PORT NO: ${port}`)})