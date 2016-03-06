begin
	require 'jasmine'
	load 'jasmine/tasks/jasmine.rake'
rescue LoadError
	task :jasmine do
		abort "Jasmine is not available. In order to run jasmine, you must: (sudo) gem install jasmine"
	end
end

task :travis do
	if ENV['JS'] == 'true'
		system('bundle exec rake jasmine:ci')
	else
		system('bundle exec rspec spec')
	end
	raise "Test failed!" unless $?.exitstatus == 0
end

task :export, :username do |t, args|
	require_relative 'app/models/init'
	require_relative 'app/helpers/greader'
	require_relative 'app/helpers/export'
	require 'json'
	require 'tmpdir'

	user = User.first(username: args[:username])

	Dir.mktmpdir do |dir|
		open("#{dir}/items.json", "w") do |f|
			f.write '{"feeds":['

			count = Feed.count(user_id: user.id)
			index = 0
			Feed.all(user_id: user.id).each do |feed|
				f.write({
					url: feed.url,
					items: feed.items.map do |item|
						{
							title: item.title,
							url: item.url,
							guid: item.guid,
							content: item.content,
							read: item.read,
							date: item.date,
							attachment_url: item.attachment_url,
							medias: item.medias
						}
					end
				}.to_json)

				index+=1
				f.write(',') if index < count
			end

			f.write ']}'
		end

		open("#{dir}/favorites.json", "w") do |f|
			f.write export_favorites_json(user)
		end

		open("#{dir}/favorites.html", "w") do |f|
			f.write export_favorites_html(user)
		end

		open("#{dir}/export.opml", "w") do |f|
			f.write export_opml(user)
		end

		filename = "#{user.username}-#{Time.now.to_i}.tgz"

		`tar -czf #{filename} -C #{dir} items.json favorites.json favorites.html export.opml`

		puts "File #{filename}.tgz created."
	end

end
