# CapoRSS

Version 0.6.0

## Description

CapoRSS is a simple self-hosted RSS aggregator written in Ruby.

## Dependencies

CapoRSS is built on top of these great projects :

* [Ruby 1.9.3](http://www.ruby-lang.org/)
* [Sinatra](http://www.sinatrarb.com/)
* [Datamapper](http://datamapper.org/)
* [Feedzirra](https://github.com/pauldix/feedzirra)
* [Nokogiri](http://nokogiri.org/)
* [R18n](https://github.com/ai/r18n)
* [Bootstrap](http://twitter.github.com/bootstrap/)
* [Font awesome](http://fortawesome.github.com/Font-Awesome/)
* [Pines notify](http://pinesframework.org/pnotify/)
* [Backbone.js](http://backbonejs.org/)
* [Marionette.js](http://marionettejs.com/)
* [Underscore.js](http://underscorejs.org/)
* [JQuery](http://jquery.com/)
* [JQuery-cookie](https://github.com/carhartl/jquery-cookie)
* [Haml](http://haml.info/)
* [Sass](http://sass-lang.com/)
* [Thin](http://code.macournoyer.com/thin/)
* [rack-ssl-enforcer](https://github.com/tobmatth/rack-ssl-enforcer)
* [sinatra-flash](https://github.com/SFEley/sinatra-flash)

Also, CapoRSS's favicon is from the [RRZE Icon Set](http://rrze-icon-set.berlios.de/)

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

    export DATABASE\_URL="postgres://username:password@hostname/database"

5. Set the SESSION\_SECRET environment variable to secure your sessions:

	export SESSION\_SECRET="My session secret..."

6. Run CapoRSS using Thin:

    thin start -R config.ru

7. Open a web browser and go to "http://localhost:3000"
8. The default username/password is "admin"/"admin"

Notes:
* For security reasons, a SSL certificate is required for running CapoRSS in production mode.
* The Postgres adapter is used in the production configuration by default. If you want to use MySQL, comment the "dm-postgres-adapter" gem and uncomment the "dm-mysql-adapter" gem in the Gemfile.

### Heroku and AppFog

CapoRSS is Heroku-ready and AppFog-ready, so you can push it on these services like any other Sinatra-based application.
See these pages for more informations :
* [Getting started with Ruby on Heroku](https://devcenter.heroku.com/articles/ruby)
* [AppFog CLI Tool Overview](https://docs.appfog.com/getting-started/af-cli)

## Keyboard shortcuts

Here is a list of keyboard shortcuts currently supported by CapoRSS :

* 'A' : Show the feed subscription dialog.
* 'R' : Sync feeds
* 'H' : Hide/Unhide read items
* 'J' : Move down one item in the item list
* 'K' : Move up one item in the item list
* 'SHIFT+J' : Select the next feed/folder in the sidebar
* 'SHIFT+K' : Select the previous feed/folder in the sidebar
* 'SPACE' : Go down one page in the item list, changing the selected item if needed
* 'SHIFT+SPACE' : Go up one page in the item list, changing the selected item if needed

## TODO

* Optimisations, performance improvements and bugfixes
* In-app documentation
* Add unit tests

## Release notes
* 0.5.0 : This version brings a lots of modifications to the database structure to add multi-user support. Automatic migrations are included to move all single-user configurations to the 'admin/admin' user, but starting from a clean database is recommended.
