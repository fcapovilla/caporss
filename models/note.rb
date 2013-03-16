class Note
    include DataMapper::Resource
    property :id, Serial
    property :title, String,
        :length => 1..30
    property :body, Text,
        :length => 0..500
    property :created_at, DateTime
end
