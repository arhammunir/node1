var mongoose= require("mongoose")
mongoose.connect("mongodb://localhost:27017/streamdata", {
	useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
}).then(console.log("DATABASE CONNECTED SUCCESSFULLY"))
.catch( (e)=>{console.log("DATABASE ERROR IS" + e)})

var streamData= new mongoose.Schema({
	video:{type:String},
	date: {type:Date, default:Date.now()}
})

var streamData_image= new mongoose.Schema({
	_id: {type:String, required: true},
	image: {type:String, required: true},
	title: {type:String, required: true},
	des: {type:String, required: true},
	choose: {type:String, required: true},
	language: {type:String, required: true},
	date: {type:Date, default: Date.now()}
})

var streamdata= new mongoose.model("streamdata", streamData)
var streamData_image= mongoose.model("streamdata_image", streamData_image)
module.exports= {streamdata, streamData_image};