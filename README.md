# CapoRSS 

Version 0.14.1

[![Build Status](https://travis-ci.org/fcapovilla/caporss.png?branch=master)](https://travis-ci.org/fcapovilla/caporss)
[![Coverage Status](https://coveralls.io/repos/fcapovilla/caporss/badge.png?branch=master)](https://coveralls.io/r/fcapovilla/caporss?branch=master)
[![Dependency Status](https://gemnasium.com/fcapovilla/caporss.png)](https://gemnasium.com/fcapovilla/caporss)

## Description

CapoRSS is a simple self-hosted RSS aggregator written in Ruby and Javascript.

## Screenshots

### Desktop View
![](doc/screenshots/screenshot.png)

### Mobile View
![](doc/screenshots/mobile.png)

## Installation

### localhost (development)

This procedure will run CapoRSS in development mode using an SQLite database

1. Install Ruby 1.9.3
2. Install the "bundler" Ruby gem using this command:

    gem install bundler

3. Run a "bundle install" in the application's root directory. Note that some dependencies are native extensions and will need a compiler and development packages:

    bundle install --without=production test

4. Start CapoRSS using this command:

    bundle exec ruby app.rb

5. Open a web browser and go to "http://localhost:4567"
6. The default username/password is "admin"/"admin"

### localhost (production)

CapoRSS can be run in production mode with Puma and PostgreSQL. Other database backends can be used by replacing the "dm-postgres-adapter" gem in the Gemfile with the correct Datamapper adapter for your database.

1. Install Ruby 1.9.3
2. Install the "bundler" Ruby gem using this command:

    gem install bundler

3. Run "bundle install" in the application's root directory. Note that some dependencies are native extensions and will need a compiler and development packages:

    bundle install --without=development test

4. Set the "DATABASE\_URL" environment variable with your database connection informations. ex:

    export DATABASE\_URL="postgres://username:password@hostname/database"

5. Set the SESSION\_SECRET environment variable to secure your sessions:

	export SESSION\_SECRET="My session secret..."

6. Run CapoRSS using Puma:

	bundle exec puma config.ru -e production

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

## Documentation

* [English version](doc/en.textile)
* [French version](doc/fr.textile)

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
* [Puma](http://puma.io/)
* [rack-ssl-enforcer](https://github.com/tobmatth/rack-ssl-enforcer)
* [sinatra-flash](https://github.com/SFEley/sinatra-flash)

Also, CapoRSS's favicon is from the [RRZE Icon Set](http://rrze-icon-set.berlios.de/)

Most dependencies are already included in the Gemfile and in the application's public directory.

## TODO

* Optimisations, performance improvements and bugfixes
* Add javascript tests

## Release notes
* 0.5.0 : This version brings a lots of modifications to the database structure to add multi-user support. Automatic migrations are included to move all single-user configurations to the 'admin/admin' user, but starting from a clean database is recommended.
* 0.9.0 : This version adds GUID and item update support. A migration was added to add GUIDs to existing items by using their title, url and publication date. Please note that some duplicate items may be created on the next feed synchronisation if :
 * The title, url or publication date of an item was modified since the item was first added to the local database.
 * There was a problem fetching the feed during the migration.
* 0.11.0 : This version adds support for Pubsubhubbub feeds. A migration will check existing feeds for PSHB hub definitions, but you will have to manually activate PSHB for each of them using the feed edition dialog. Please note that some feeds might define a hub without actually pushing updates to it. That is the case for Youtube upload feeds.
