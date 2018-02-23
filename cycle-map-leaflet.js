const xs = require('xstream').default
const adapt = require('@cycle/run/lib/adapt').adapt
const L = require('leaflet')

function makeMapDriver (init) {

  var map = L.map(init.id).setView(init.center, init.zoom),
      ic1 = L.icon({iconUrl: 'https://cdn.mapmarker.io/api/v1/pin?text=&size=30&background=CCCCFF&color=FFF&hoffset=-1'}),
      ic2 = L.icon({iconUrl: 'https://cdn.mapmarker.io/api/v1/pin?text=&size=30&background=FF3333&color=FFF&hoffset=-1'})
  L.tileLayer(init.url, init.tlopts).addTo(map);
  init.markers = init.markers.map((markerobj) => {
    markerobj.marker = L.marker(markerobj.latlong, {icon: ic1}).addTo(map)
     return markerobj
  })

  function mapDriver (cmd$, name = 'map') {

    cmd$.addListener({
      next: cmd => {
        switch ( cmd.cmd ) {
          case 'zoom':
            map.zoomIn()
            break
          case 'highlight':
            init.markers.forEach(markerobj => {
              markerobj.marker.setIcon(cmd.data === markerobj.id? ic2: ic1)
            })
            break
        }
      },
      error: () => {},
      complete: () => {}
    })

    const source = {
      select: function select (selector) {
        return { events: eventsMaker(selector) }
      },
      events: eventsMaker(map)
    }
    return adapt(source)
  }

  function eventsMaker (selector) {
    return function events (eventtype) {
      switch ( eventtype ) {
        case 'click':
        case 'mouseover':
          return xs.create({
            next: null,
            start: listener => {
              switch ( selector ) {
                case 'markers':
                  init.markers.forEach(markerobj => {
                    markerobj.marker.on(eventtype, function (evt) {
                      listener.next(markerobj)
                    })
                  })
                  break
                case 'map':
                case map:
                  map.on(eventtype, function (evt) {
                    listener.next(evt)
                  })
                  break
              }
            },
            stop: () => {}
          })
          break
      }
    }
  }

  return mapDriver
}

exports.makeMapDriver = makeMapDriver
