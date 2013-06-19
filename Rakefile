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
