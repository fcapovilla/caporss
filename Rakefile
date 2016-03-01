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
    require 'json'

    user = User.first(username: args[:username])

    puts '{"feeds":['

	Feed.all(user_id: user.id).each do |feed|
        puts({
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
        }.to_json + ',')
    end

    puts ']}'
end
