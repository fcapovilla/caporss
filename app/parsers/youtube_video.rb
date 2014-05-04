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
			element :content
			element :"media:description", :as => :media_description
			element :"media:thumbnail", :as => :thumbnail, :value => :url, :with => {:width => "320"}
			element :"yt:duration", :as => :duration, :value => :seconds

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

			def formatted_duration
				return "00:00" unless @duration

				time = @duration.to_i
				hours = time/3600.to_i
				minutes = (time/60 - hours * 60).to_i
				seconds = (time - (minutes * 60 + hours * 3600))
				"%02d:%02d:%02d" % [hours, minutes, seconds]
			end

			def content
				return @cached_content if @cached_content
				if @media_description
					@cached_content = '<img src="' + @thumbnail + '" /><br>(' + self.formatted_duration + ')<br>' + @media_description.gsub("\n", '<br>')
				else
					@cached_content = @content
				end
			end
		end
	end
end
