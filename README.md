# CapoRSS

Version 0.19.3

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

This procedure will run CapoRSS in development mode using an SQLite database. Other installation methods can be found in the [installation](doc/install.textile) documentation file.

1. Install Ruby 2.1.0
2. Install the "bundler" Ruby gem using this command:

		gem install bundler

3. Run a "bundle install" in the application's root directory. Note that some dependencies are native extensions and will need a compiler and development packages:

		bundle install --without production test travis

4. Start CapoRSS using this command:

		bundle exec ruby app.rb

5. Open a web browser and go to "http://localhost:4567"
6. The default username/password is "admin"/"admin"

## Documentation

* [Installation](doc/install.textile)
* [Development](doc/development.textile)
* User documentation :
 * [English version](doc/en.textile)
 * [French version](doc/fr.textile)
* [Changelog / Release notes](CHANGELOG.textile)

## Acknowledgment

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
* [PNotify](https://github.com/sciactive/pnotify)
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

## TODO

* Optimisations, performance improvements and bugfixes
* Add other automatic sync methods (cron, worker)
