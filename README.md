# CapoRSS

Version 0.1.3

## Description

CapoRSS is a simple self-hosted RSS aggregator written in Ruby.

## Dependencies

CapoRSS is built on top of these great projects :

* [Ruby 1.9.3](http://www.ruby-lang.org/)
* [Sinatra](http://www.sinatrarb.com/)
* [Datamapper](http://datamapper.org/)
* [Feedzirra](https://github.com/pauldix/feedzirra)
* [Nokogiri](http://nokogiri.org/)
* [Bootstrap](http://twitter.github.com/bootstrap/)
* [Font awesome](http://fortawesome.github.com/Font-Awesome/)
* [Pines notify](http://pinesframework.org/pnotify/)
* [Backbone.js](http://backbonejs.org/)
* [Underscore.js](http://underscorejs.org/)
* [JQuery](http://jquery.com/)
* [Haml](http://haml.info/)
* [Sass](http://sass-lang.com/)
* [Thin](http://code.macournoyer.com/thin/)
* [rack-ssl-enforcer](https://github.com/tobmatth/rack-ssl-enforcer)

Most dependencies are already included in the Gemfile and in the application's public directory.

## Installation

### localhost (development)

This procedure will run CapoRSS in development mode using an SQLite database

1. Install Ruby 1.9.3
2. Install the "bundler" Ruby gem using this command:

    gem install bundler

3. Run a "bundle install" in the application's root directory. Note that some dependencies are native extensions and will need a compiler and development packages:

    bundle install --without=production

4. Start CapoRSS using this command:

    ruby app.rb

5. Open a web browser and go to "http://localhost:4567"
6. The default username/password is "admin"/"admin"

### localhost (production)

CapoRSS can be run in production mode with Thin and PostgreSQL. Other database backends can be used by replacing the "dm-postgres-adapter" gem in the Gemfile with the correct Datamapper adapter for your database.

1. Install Ruby 1.9.3
2. Install the "bundler" Ruby gem using this command:

    gem install bundler

3. Run "bundle install" in the application's root directory. Note that some dependencies are native extensions and will need a compiler and development packages:

    bundle install --without=development

4. Set the "DATABASE\_URL" environment variable with your database connection informations. ex:

    export DATABASE\_URL="postgres://username:password@hostname/database

5. Run CapoRSS using Thin:

    thin start -R config.ru

Note: For security reasons, a SSL certificate is required for running CapoRSS in production mode.

### Heroku

CapoRSS is Heroku-ready, so you can push it like any other Sinatra-based application. See this page for more informations : [Getting started with Ruby on Heroku](https://devcenter.heroku.com/articles/ruby)

## TODO

* Correct client-side memory leaks
* Performance optimisations
* Drap-and-drop feed reordering
* Recursive folders (more than one folder level)
* Per-folder OPML export
* Translation support
* Automatic sync (cron or client-side timeouts)
* Custom scrollbar styles
