# CapoRSS

## Description

CapoRSS is a simple self-hosted RSS aggregator written in Ruby.

## Dependencies

CapoRSS is built on top of these great projects :

* Ruby 1.9.3
* Sinatra
* Datamapper
* Feedzirra
* Nokogiri
* Bootstrap
* Font awesome
* Backbone.js
* Underscore.js
* JQuery
* Haml
* Sass
* Thin
* rack-ssl-enforcer

Most dependencies are already included in the Gemfile and in the application's public directory.

## Installation

### localhost (development)

This procedure will run CapoRSS in development mode using an SQLite database

1. Install Ruby 1.9.3
2. Install the "bundler" Ruby gem using this command : "gem install bundler"
3. Run "bundle install --without=production" in the application's root directory. Note that some dependencies are native extensions and will need a compiler and development packages.
4. Start CapoRSS using this command : "ruby app.rb"
5. Open a web browser and go to "http://localhost:4567"
6. The default username/password is "admin"/"admin"

### localhost (production)

CapoRSS can be run in production mode with Thin and PostgresQL. Other database backends can be used by replacing the "dm-postgres-adapter" with the correct Datamapper adapter for your database.

1. Install Ruby 1.9.3
2. Install the "bundler" Ruby gem using this command : "gem install bundler"
3. Run "bundle install --without=development" in the application's root directory. Note that some dependencies are native extensions and will need a compiler and development packages.
4. Set the "DATABASE\_URL" environment variable with your database connection informations. ex: "export DATABASE\_URL="postgres://username:password@hostname/database"
5. Run CapoRSS using Thin : "thin start -R config.ru"

### Heroku

CapoRSS is Heroku-ready, so you can push it like any other Sinatra-based application. See this page for more informations : [Getting started with ruby on Heroku](https://devcenter.heroku.com/articles/ruby)

## TODO

* Correct client-side memory leaks
* Performance optimisations
* Mobile view
* Use sprockets to organise and minify assets
* Drap-and-drop feed reordering
* Recursive folders (more than one folder level)
* Per-folder OPML export
* Translation support
* Automatic sync (cron or client-side timeouts)
* Custom scrollbar styles
