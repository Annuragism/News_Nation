//importing modules
const express = require('express')
//const hbs = require('hbs');
const path = require('path');
const bodyparser = require('body-parser');
const mysql = require('mysql')
const hbs = require('express-handlebars');
const session = require('express-session');
const jwt =require('jsonwebtoken')
//-------------------------------------------------
//----------------------------------------------------
//creation app of express js
var app = express();
//configure view engine as hbs
app.set('views', path.join(__dirname, 'views')) //location
app.set('view engine', 'hbs') // set path (view engine,'ext-name')
//configure layouts in mainlayout as it imports in all of the pages

//----------------------------------------------------------------
app.use(express.static('upload'))
//---------------------------------------------------------------
//start session----------
app.use(session({
  secret: 'asdfdfss'
}))
//---------------------------------------------------------------
//server configuration
//server creation and start server  ---listen(port no,function)------
app.listen(4000, () => {
  console.log("Server started on port :4000");
})

//configure body parser
app.use(bodyparser.json()) //enables to transfer data in Jason format
app.use(bodyparser.urlencoded({
  extended: true //upto the data length
}))
//-----------------------------------------
//creating connection in mysql
const con = mysql.createConnection({
  user: 'root',
  password: 'root',
  port: 3306,
  host: 'localhost',
  database: 'news'

})
//-------------------------------------------------
app.get('/',(req,res)=>{
  res.render('home');
})
//-------------------------------------------------------------
//customer_login_form
app.get('/userhome',(request,response)=>{
        var user=request.session.user;
        var sql="select * from user where email=? "
        var values=[user]
        sql=mysql.format(sql,values)
        con.query(sql,(err,result)=>{
          if (err) throw err;
          else if(result.length>0)
          {
          response.render('userhome',{uid:request.session.user})

          }
          else
          response.render('home',{err:'Session Expired,Try again'})
           })
})
//-------------------------------------------------------------
//customer_login_form
app.post('/customer_login_form',(request,response)=>{
        var cemail=request.body.customer_email;
        var password=request.body.password;
        var sql="select * from user where email=? and password=?"
        var values=[cemail,password]
        sql=mysql.format(sql,values)
        con.query(sql,(err,result)=>{
          if (err) throw err;
          else if(result.length>0)
          {
          request.session.user=cemail;
          response.render('userhome',{msg:'Login Success',uid:request.session.user})

          }
          else
          response.render('home',{err:'login Fail,Try again'})
           })
})
//-------------------------------------------------------------------------
//upload files
const upload=require('express-fileupload');
app.use(upload())
//------------------
app.post('/post_news',(request,response)=>{
  console.log(request.files);
  if(request.files)
  {
  var news=request.body.news;
  var user=request.session.user;
  var file=request.files.imgname;
  var imgname=file.name;
  var newimgname=Math.floor(Math.random()*1000)+imgname;
  file.mv('./upload/'+newimgname,(err,result)=>{
    if(err) throw err;
    else {
      var sql="insert into news (news,user,imgname) values(?,?,?)"
      var values=[news,user,newimgname]
      sql=mysql.format(sql,values)
      con.query(sql,(err)=>{
        if (err) throw err;
        else
        response.render('userhome',{msg:'News posted Succesfully',uid:request.session.user})
         })
    }
  })
  //console.log(news);

  }
})
//-----------------------------------------------------
app.get('/get_news',(request,response)=>{
  // var user=request.session.user;
  var sql="select * from news  "
  // var values=[user]
  sql=mysql.format(sql)
  con.query(sql,(err,result)=>{
    //console.log(result);
    if (err) throw err;
    else
    response.json({data:result})
     })
})
//----------------------------------------------------------------
app.get('/view_all_news',(request,response)=>{
  var sql="select news.news,news.imgname,news.user,comments.comment,comments.comment_by from news left join comments on comments.news=news.news "
  // var values=[user]
  sql=mysql.format(sql)
  con.query(sql,(err,news_data)=>{
    console.log(news_data);
    if (err) throw err;
    else
    response.render('view_all_news',{news_data:news_data,uid:request.session.user})
     })
})

//----------------------------------------------------------------
app.post('/post_comment',(request,response)=>{
   var comment=request.body.comment;
   var user=request.session.user;
   var imgname=request.body.imgname;
   var news=request.body.news;
// console.log(comment);
// console.log(user);
// console.log(imgname);
// console.log(news);
   var sql="insert into comments(news,imgname,comment,comment_by) values(?,?,?,?)"
   var values=[news,imgname,comment,user]
   sql=mysql.format(sql,values)
   con.query(sql,(err,data)=>{
     console.log(data);
     if (err) throw err;
     else{
       var sql="select news.news,news.imgname,news.user,comments.comment,comments.comment_by from news left join comments on comments.news=news.news "
       // var values=[user]
       sql=mysql.format(sql)
       con.query(sql,(err,news_data)=>{
         console.log(news_data);
         if (err) throw err;
         else
         {
           response.render('view_all_news',{news_data:news_data,uid:request.session.user})

         }
          })
     }
      })
})
//---------------------------------------------------------------
app.get('/edit_delete_post',(request,response)=>{
   var user=request.session.user;
  var sql="select * from news where user=?  "
   var values=[user]
  sql=mysql.format(sql,values)
  con.query(sql,(err,result)=>{
    //console.log(result);
    if (err) throw err;
    else
    response.render('edit_delete_post',{news_data:result,uid:request.session.user})

     })
})
//-----------------------------------------------------------------
app.get('/update_news',(request,response)=>{
  var news=request.query.news;
  console.log(news);
  var user=request.session.user;
  console.log(user);
  var sql="update news set news=? where user=?"
   var values=[news,user]
  sql=mysql.format(sql,values)
  con.query(sql,(err,result)=>{
    console.log(result);
    if (err) throw err;
    else if(result.changedRows>0)
    {
      response.json({data:result})

    }
    else
    response.json({msg:'news not updated'})
     })
})
//-----------------------------------------------------------------
app.get('/delete_news',(request,response)=>{
  var news=request.query.news;
  console.log(news);
  var user=request.session.user;
  console.log(user);
  var sql="delete from news  where user=? and news=?"
   var values=[user,news]
  sql=mysql.format(sql,values)
  con.query(sql,(err,result)=>{
    console.log(result);
    if (err) throw err;
    else if(result.changedRows>0)
    {
      response.json({data:result})

    }
    else
    response.json({msg:'news not deleted'})
     })
})
//------------------------------------------------------------------
app.get('/customer_logout',(request,response)=>{
  if(request.session.customer==0){response.render('home')}
request.session.destroy();
response.render('home',{msg:'Customer Logout successfully'})
})
//-------------------------------------------------------
