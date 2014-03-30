# CapoRSS 

Version 0.18.0

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

1. Install Ruby 2.1.0
2. Install the "bundler" Ruby gem using this command:

 	gem install bundler

3. Run a "bundle install" in the application's root directory. Note that some dependencies are native extensions and will need a compiler and development packages:

 	bundle install --without production test travis

4. Start CapoRSS using this command:

 	bundle exec ruby app.rb

5. Open a web browser and go to "http://localhost:4567"
6. The default username/password is "admin"/"admin"

### localhost (production)

CapoRSS can be run in production mode with Thin and PostgreSQL. Other database backends can be used by replacing the "dm-postgres-adapter" gem in the Gemfile with the correct Datamapper adapter for your database.

1. Install Ruby 2.1.0
2. Install the "bundler" Ruby gem using this command:

 	gem install bundler

3. Run "bundle install" in the application's root directory. Note that some dependencies are native extensions and will need a compiler and development packages:

 	bundle install --without development test travis

4. Set the "DATABASE\_URL" environment variable with your database connection informations. ex:

 	export DATABASE\_URL="postgres://username:password@hostname/database"

5. Run CapoRSS using Thin:

 	bundle exec thin -R config.ru -e production

6. Open a web browser and go to "http://localhost:3000"
7. The default username/password is "admin"/"admin"

Notes:
* For security reasons, a SSL certificate is required for running CapoRSS in production mode.
* The Postgres adapter is used in the production configuration by default. If you want to use MySQL, comment the "dm-postgres-adapter" gem and uncomment the "dm-mysql-adapter" gem in the Gemfile.

### Heroku and AppFog

CapoRSS is Heroku-ready and AppFog-ready, so you can push it on these services like any other Sinatra-based applications.
See these pages for more informations :
* [Getting started with Ruby on Heroku](https://devcenter.heroku.com/articles/ruby)
* [AppFog CLI Tool Overview](https://docs.appfog.com/getting-started/af-cli)

### Openshift

CapoRSS can also be deloyed on Openshift using the diy-0.1 and mysql-5.5 cartridges. The cron cartridge is also required if you want automatic feed updates.

	rhc create-app caporss diy-0.1 mysql-5.5 cron-1.4 --from-code=https://github.com/fcapovilla/caporss.git --timeout=9999

If the first installation method fails, you can try to deploy it in multiple steps :

	rhc create-app caporss diy-0.1 mysql-5.5 cron-1.4
	cd caporss
	git rm -rf diy misc .openshift
	git remote add upstream -m master https://github.com/fcapovilla/caporss.git
	git pull -s recursive -X theirs upstream master
	git push

Please note that the deployment can take a long time because Ruby and some gems need to be compiled on the server during the first deployment.

## Tests

To run tests locally :

1. Install required packages with bundle:

 	bundle install --without production development travis

2. Run Ruby tests :

 	DATABASE_URL="sqlite::memory:" bundle exec rspec spec

3. Run Javascript tests :

 	rake jasmine:ci

## Javascript libraries management

This procedure is not required to use CapoRSS. It is only necessary if you want to manage or update the Javascript dependencies of CapoRSS.
To update Javascript libraries :

1. Install Node and npm

2. Install Grunt and Bower :

 	npm install

3. Install Javascript dependencies with Bower :

 	bower install

4. Concatenate and minify dependencies using grunt :

 	grunt

## Documentation

* [English version](doc/en.textile)
* [French version](doc/fr.textile)

## Dependencies

CapoRSS is built on top of these great projects :

* [Ruby](http://www.ruby-lang.org/)
* [Sinatra](http://www.sinatrarb.com/)
* [Datamapper](http://datamapper.org/)
* [Feedjira](http://feedjira.com/)
* [Nokogiri](http://nokogiri.org/)
* [R18n](https://github.com/ai/r18n)
* [Bootstrap](http://twitter.github.com/bootstrap/)
* [bootstrap3-typeahead](https://github.com/bassjobsen/Bootstrap-3-Typeahead)
* [Font awesome](http://fortawesome.github.com/Font-Awesome/)
* [Pines notify](http://pinesframework.org/pnotify/)
* [Backbone.js](http://backbonejs.org/)
* [Marionette.js](http://marionettejs.com/)
* [Lo-Dash](http://lodash.com/)
* [JQuery](http://jquery.com/)
* [JQuery-cookie](https://github.com/carhartl/jquery-cookie)
* [Haml](http://haml.info/)
* [Sass](http://sass-lang.com/)
* [Thin](http://code.macournoyer.com/thin/)
* [rack-ssl-enforcer](https://github.com/tobmatth/rack-ssl-enforcer)
* [sinatra-flash](https://github.com/SFEley/sinatra-flash)
* [Bower](http://bower.io/)
* [Grunt](http://gruntjs.com/)

Also, CapoRSS's favicon is from the [RRZE Icon Set](http://rrze-icon-set.berlios.de/)

Most dependencies are already included in the Gemfile and in the application's public directory.

## TODO

* Optimisations, performance improvements and bugfixes
* Improve SSE support
* Add other automatic sync methods (cron, worker)

## Release notes
* 0.5.0 : This version brings a lots of modifications to the database structure to add multi-user support. Automatic migrations are included to move all single-user configurations to the 'admin/admin' user, but starting from a clean database is recommended.
* 0.9.0 : This version adds GUID and item update support. A migration was added to add GUIDs to existing items by using their title, url and publication date. Please note that some duplicate items may be created on the next feed synchronisation if :
 * The title, url or publication date of an item was modified since the item was first added to the local database.
 * There was a problem fetching the feed during the migration.
* 0.11.0 : This version adds support for Pubsubhubbub feeds. A migration will check existing feeds for PSHB hub definitions, but you will have to manually activate PSHB for each of them using the feed edition dialog. Please note that some feeds might define a hub without actually pushing updates to it. That is the case for Youtube upload feeds.
