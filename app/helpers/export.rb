# encoding: utf-8

def export_opml(user)
	Nokogiri::XML::Builder.new(:encoding => 'UTF-8') { |xml|
		xml.opml(:version => '1.0') {
			xml.head {
				xml.title "OPML Export"
			}
			xml.body {
				Folder.all(:user => user).each { |folder|
					xml.__send__ :insert, folder.to_opml
				}
			}
		}
	}.to_xml
end

def export_favorites_html(user)
	output = '<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
'

	Item.all(:user => user, :favorite => true).each do |item|
		output += "<DT><A HREF=\"#{item.url}\" ADD_DATE=\"#{item.date.to_time.to_i}\">#{item.title}</A>\n"
	end

	output += '</DL><p>'
end

def export_favorites_json(user)
	JSON.pretty_generate({
		:direction => 'ltr',
		:title => 'Favorites',
		:items => get_greader_items(user, :favorite => true, :user => user)
	})
end
