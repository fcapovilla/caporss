# encoding: utf-8

module Feedjira
	module Parser
		class YoutubeVideo
			include SAXMachine
			include FeedEntryUtilities

			element :title
			element :link, :as => :url, :value => :href, :with => {:type => "text/html", :rel => "alternate"}
			element :name, :as => :author
			element :summary
			element :"media:description", :as => :content
			element :"media:thumbnail", :as => :thumbnail, :value => :url, :with => {:width => "320"}

			element :enclosure, :as => :image, :value => :href

			element :published
			element :id, :as => :entry_id
			element :created, :as => :published
			element :issued, :as => :published
			element :updated
			element :modified, :as => :updated
			elements :category, :as => :categories, :value => :term
			elements :link, :as => :links, :value => :href
			elements :"media:content", :as => :medias, :value => :url
			elements :"media:content", :as => :media_types, :value => :type

			def url
				@url ||= links.first
			end

			def content
				return @cached_content if @cached_content
				@cached_content = '<img src="' + @thumbnail + '" /><br>' + @content.gsub("\n", '<br>')
			end
		end
	end
end
