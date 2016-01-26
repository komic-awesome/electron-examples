var fs = require('fs')
  , temp = require('temp')
  , unzip = require('unzip')
  , glob = require('glob')
  , path = require('path')
  , $ = require('jquery')

temp.track()

function openFirstImageFromZip(zipPath) {
  var fileSourcePath = zipPath
    , fileDestPath = temp.mkdirSync(new Buffer(fileSourcePath).toString('base64'))
    , imageContainer = $('.image-container')

  fs.createReadStream(fileSourcePath)
    .pipe(unzip.Extract({ path: fileDestPath }))
    .on('close', function() {
      var images = glob.sync(path.join(fileDestPath, '**/*'))
      imageContainer.html(
        $('<img>', { css: { height: '240px' }, src: images[0] })
      )
    })
}

openFirstImageFromZip('./resource/test.zip')

function FileSelectHandler(e) {
  var files = e.target.files || e.dataTransfer.files;
  for (var i = 0, file; file = files[i]; i++) {
    openFirstImageFromZip(file.path)
  }
}

$('.zip-uploader-form input[name=zip-uploader]')
  .on('change', FileSelectHandler)
  .on('drop', FileSelectHandler)
