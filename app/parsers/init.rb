# encoding: utf-8

require 'feedjira'

require_relative 'youtube_video'
require_relative 'youtube'


Feedjira::Feed.add_feed_class Feedjira::Parser::Youtube


# Force enclosure parsing on all Feedjira feed entries
Feedjira::Feed.add_common_feed_entry_element(:enclosure, :value => :url, :as => :enclosure_url)

# Add Pubsubhubbub hub parsing to all Feedjira feed entries (hub + topic)
Feedjira::Feed.add_common_feed_element(:'atom:link', :value => :href, :as => :hub, :with => {:rel => 'hub'})
Feedjira::Feed.add_common_feed_element(:'atom10:link', :value => :href, :as => :hub, :with => {:rel => 'hub'})
Feedjira::Feed.add_common_feed_element(:'link', :value => :href, :as => :hub, :with => {:rel => 'hub'})
Feedjira::Feed.add_common_feed_element(:'atom:link', :value => :href, :as => :topic, :with => {:rel => 'self'})
Feedjira::Feed.add_common_feed_element(:'atom10:link', :value => :href, :as => :topic, :with => {:rel => 'self'})
Feedjira::Feed.add_common_feed_element(:'link', :value => :href, :as => :topic, :with => {:rel => 'self'})
