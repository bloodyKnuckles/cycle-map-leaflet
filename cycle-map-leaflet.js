const xs = require('xstream').default
const adapt = require('@cycle/run/lib/adapt').adapt
const L = require('leaflet')

function makeMapDriver (init) {

  var map = L.map(init.id).setView(init.center, init.zoom),
      markernormal  = L.icon({iconUrl: init.markerstateurls.normal}),
      markerfocused = L.icon({iconUrl: init.markerstateurls.focused})
  L.tileLayer(init.url, init.tlopts).addTo(map)
  init.markers = init.markers.map(markerobj => {
    markerobj.marker = L.marker(markerobj.latlong, {icon: markernormal}) //.addTo(map)
    return markerobj
  })
  var group = L.featureGroup(init.markers.map(markerobj => markerobj.marker)).addTo(map)
  map.fitBounds(group.getBounds(), {padding: [50,50]})

  function mapDriver (cmd$, name = 'map') {

    cmd$.addListener({
      next: cmd => {
        switch ( cmd.cmd ) {
          case 'zoom':
            map.zoomIn()
            break
          case 'highlight':
            init.markers.forEach(markerobj => {
              markerobj.marker.setIcon(cmd.data === markerobj.id? markerfocused: markernormal)
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
