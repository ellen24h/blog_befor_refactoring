var express = require('express');
//var ArticleProvider = require('./articleprovider-memory').ArticleProvider;
var ArticleProvider = require('./articleprovider-mongodb').ArticleProvider;
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// port setup
app.set('port', process.env.PORT || 3000);
module.exports = app;
var server = app.listen(app.get('port'), function() {
		console.log('Express server listening on port ' + 
			server.address().port);
		});
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

var articleProvider = new ArticleProvider('localhost', 27017);
//var articleProvider = new ArticleProvider();
       
app.get('/', function(req, res) {
   articleProvider.findAll(function(error, docs) {
       res.render('index.jade', {
           title: 'Blog',
           articles: docs
       });
   });
});

app.get('/blog/new', function (req, res){
  res.render('blog_new.jade', {title: 'New Post'});
});

app.post('/blog/new', function(req, res) {
    articleProvider.save({
        title: req.param('title'),
        body: req.param('body')
    }, function(error, docs) {
        res.redirect('/');
    });
});

app.get('/blog/:id', function(req, res) {
    console.log("req.params.id is " + req.params.id);
    articleProvider.findById(req.params.id, function(error, article) {
        res.render('blog_show.jade', {
            title: article.title,
            article: article
        });
    });
});

app.post('/blog/addComment', function (req, res) {
  articleProvider.addCommentToArticle(req.param('_id'), {
    person: req.param('person'),
    comment: req.param('comment'),
    created_at: new Date()
    }, function (error, docs) {
        res.redirect('/blog/' + req.param('_id'));
  });
});
// app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
