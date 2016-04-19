'use strict'

const $ = require('jquery')
const formUtils = require('m9js/lib/ui/form')
const AlbumCrawler = require('douban-album-dl/lib/crawler')
const electron = require('electron')
const dialog = electron.remote.dialog;
const shell = electron.shell;

var downloadAlbumForm = $('form.download-album')
  , resultSection = $('section.result')
  , openDestButton = resultSection.find('.open-dest')

function resumeAlbumForm() {
  formUtils.resumeForm(downloadAlbumForm)
}

function readonlyAlbumForm() {
  formUtils.readonlyForm(downloadAlbumForm)
}

function runCrawler(albumUrl, dest) {
  var crawler = new AlbumCrawler({
        home: albumUrl
      , workshop: dest
      })
    , bar = resultSection.find('.progress-bar')

  crawler.on('progress', (percent) => {
    var percentLabel = percent * 100 + '%'
    bar.css({ width: percentLabel })
    bar.text(percentLabel)
  })

  openDestButton.hide()
  crawler.run()
    .then(function() {
      openDestButton.show()
      //TODO(yangqing): crawler.getInfo()
      openDestButton.data('dest', crawler.workshop)
    })
    .then(resumeAlbumForm, resumeAlbumForm)
    .catch(function(message) {
      throw new Error(message)
    })
}

downloadAlbumForm.on('submit', function(e) {
  e.preventDefault()
  var data = formUtils.toDict(downloadAlbumForm)
  readonlyAlbumForm()

  dialog.showOpenDialog({
    properties: ['openDirectory']
  }, function(destArray) {
    if (!destArray.length) {
      resumeAlbumForm()
      return
    }

    resultSection.show()
    var dest = destArray[0]

    runCrawler(data.album_url, dest)
  })
})

resultSection.on('click .open-dest', function(e) {
  e.preventDefault()

  var dest = openDestButton.data('dest')

  if (!dest) { return }
  shell.showItemInFolder(dest)
})

resultSection.hide()
