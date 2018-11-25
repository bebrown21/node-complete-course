exports.getPosts = (req, res, next) => {
  res.json({ 
    posts: [{
      title: 'First Post',
      content: 'First post content'
    }] 
  });
}

exports.createPost = (req, res, next) => {
  //create post in db
  res.status(201).json({
    message: 'Post created successfully',
    post: {
      id: new Date().toISOString(),
      title: req.body.title,
      content: req.body.content
    }
  })
}