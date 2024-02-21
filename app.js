//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/blogDB", {useNewUrlParser: true});

const postSchema = {
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);

app.get("/", function(req, res){

  Post.find({}, function(err, posts){
    res.render("home", {
      posts: posts
      });
  });
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });


  post.save(function(err){
    if (!err){
        res.redirect("/");
    }
  });
});

app.post("/delete", async function(req, res) {
  const requestedPostId = req.body.postId;
  try {
    await Post.findByIdAndRemove(requestedPostId);
    console.log("Successfully deleted selected post.");
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/posts/:postId/edit", function(req, res){
  const postId = req.params.postId;
  const updatedTitle = req.body.title;
  const updatedContent = req.body.content;

  Post.findByIdAndUpdate(postId, { title: updatedTitle, content: updatedContent }, function(err, updatedPost){
    if (err) {
      console.error("Error updating post:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.redirect("/posts/" + postId);
  });
});

app.get("/posts/:postId/edit", function(req, res){
  const postId = req.params.postId;
  Post.findById(postId, function(err, post){
    if (err) {
      console.error("Error fetching post for editing:", err);
      return res.status(500).send("Internal Server Error");
    }
    if (!post) {
      return res.status(404).send("Post not found");
    }
    res.render("edit", { post: post });
  });
});


app.get("/posts/:postId", function(req, res){

const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){
    console.log("Post:", post);
    res.render("post", {
      title: post.title,
      content: post.content,
      post: post
    });
  });

});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/contact", function(req, res){
  res.render("contact");
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});