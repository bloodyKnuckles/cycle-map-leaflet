const run = require('@cycle/run').run
const xs = require('xstream').default
const makeDOMDriver = require('@cycle/dom').makeDOMDriver
const makeMapDriver = require('./cycle-map-leaflet').makeMapDriver

const main = require('./main')

const mapopts = {
  id: 'map', center: [37.4109, -94.7050], zoom: 12,
  url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  tlopts: {
    minZoom: 8, maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
  },
  markers: JSON.parse(document.head.querySelector('[name=markers]').content),
  markerstateurls: {
    normal:  'https://cdn.mapmarker.io/api/v1/pin?text=&size=30&background=CCCCFF&color=FFF&hoffset=-1',
    focused: 'https://cdn.mapmarker.io/api/v1/pin?text=&size=30&background=FF3333&color=FFF&hoffset=-1',
    pressed: '', disabled: ''
  }
}

run(main, {
  DOM: makeDOMDriver('#app'),
  map: makeMapDriver(mapopts),
  log: msg$ => { msg$.addListener({next: msg => console.log(msg)}) }
})
