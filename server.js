require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
var dns=require('dns');
var URL = require("url").URL;
var bodyParser=require('body-parser');
app.set('view engine', 'ejs')
app.set('views','./views')

var mongoose=require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });


 const { Schema } = mongoose;
 const urlSchema = new Schema({
    original_url : {type:String,required:true},
    short_url : String
  });

const Url = mongoose.model('Url', urlSchema);
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
 res.render('index',{'appname':'slimm','error':''});
});


function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

app.get('/istaken/:short_url',function(req,res){
  
  Url.findOne({short_url: (req.params.short_url)},function(err,data){
      if(data!=null){
        //means custom path is taken 
        res.json({status:"y"});
      }
      else{
        //means custom path is not taken
        res.json({status:"n"});
      }

  });

});

app.post('/new',function(req,res){
	  var randomId=""
	  if(req.body.custompath=="" || (req.body.custompath).length<4){
	      randomId=makeid(4);
	  }
	  else{
	      randomId=req.body.custompath;
	  } 
	   const url=new Url({original_url:req.body.url,short_url:randomId});
	//saving stuff below
	   url.save(function(err, data) {
	    if(err){
	      console.log(err);
	    }
	    console.log(data);
	  });    
	  res.render('success',{'appname':'slimm', 'shorturl':randomId,'error':''});

});


app.get('/:short_url', function(req, res) {
    Url.findOne({short_url: (req.params.short_url)},function(err,data){
    if(err){
     console.log("an error has occured");
    }
     console.log(data);
    if(data!=null){
      if(/^(http|https):\/\//g.test(data.original_url)==true){
          res.status(301).redirect(data.original_url);
      }
      else{
          res.status(301).redirect("https://"+data.original_url);
      }

    }
    else{
        res.json({error:"invalid url"});
    }
  });
});


app.get('/api/deleteurl', function(req, res) {

  Url.deleteMany({}, function(err,data){
    console.log(err);
    console.log(data);
  })
  res.json({ greeting: 'all deleted' });
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

