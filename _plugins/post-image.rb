module Jekyll
  module DefaultImage
    def default_image(image_path, default_path)
      source_path = File.join(Dir.pwd , image_path)
      if File.exist?(source_path)
        image_path
      else
        default_path
      end
    end
  end
end

Liquid::Template.register_filter(Jekyll::DefaultImage)
