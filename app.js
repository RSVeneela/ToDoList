//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app= express();
const date=require(__dirname+"/date.js");
app.use(bodyParser.urlencoded({extended:true}));


app.set('view engine','ejs');
mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});
const itemSchema={
  name:String
};

const listSchema={
  name:String,
  items:[itemSchema]

}

const List=mongoose.model("List",listSchema);

const Item=mongoose.model("Item",itemSchema);

const defaultItems=[];


app.use(express.static("public"));
app.get("/",function (req, res){
  let day=date.getDate();
  

  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err)
        {
          console.log(err);
        }
        else {
          console.log("successfully inserted");
        }
      })
    
    }
    res.render("list",{listTitle:day,newitems:foundItems});

  });
  

});

app.get("/:customListName",function (req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,results){
    if(!err){
      if(!results){
        const list=new List({
          name:customListName
        });
        list.save();
        res.redirect("/"+customListName);

      }
      else{
        res.render("list",{listTitle:results.name,newitems:results.items});
      }
    }

    
  })
 
  
});


app.post("/", function(req, res){
   const itemName=req.body.nextitem;
   const listName=req.body.list;
   const item=new Item({
     name:itemName
   })
   
   if(listName===date.getDate())
   {
    item.save();
    res.redirect("/");
   }
   else {
     List.findOne({name:listName},function(err,result){
       if(!err)
       {
         result.items.push(item);
         result.save();
         res.redirect("/"+listName);
       }
     });

   }
   
   
});
app.post("/delete",function (req, res){
  const deletedItem=req.body.checkbox;
  const listName=req.body.listName;
  if(listName===date.getDate())
  {
    Item.findByIdAndRemove(deletedItem,function(err){
      if(!err){
        console.log("Deleted");
        res.redirect("/");
      }
  
    });
   

  }
  else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:deletedItem}}},function(err,result){
      if(!err)
      {
        res.redirect("/"+listName);
      }
    });

  }
  

});


app.listen(3000,function (){
  console.log("you are  on port 3000");
});
