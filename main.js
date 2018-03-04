const xs = require('xstream').default
const div = require('@cycle/dom').div


module.exports = function main (sources) {

  const list = JSON.parse(document.head.querySelector('[name=markers]').content)

  const markerid$ = sources.map.select('markers').events('mouseover').map(markerobj => markerobj.id)
  const listid$ = sources.DOM.select('div#list').select('div.listitem').events('mouseover')
   .map(evt => parseInt(evt.target.id.substr(1)))

  const vdom$ = xs.merge(markerid$, listid$)
    .map(id => div([
        div('#nav', 'nav'),
        div([
          div('#map', {hook:{skip:true}}),
          div(
            '#det',
            ((li) => li.id + ': ' + li.latlong)(list.find(item => item.id == id))
          )
        ]),
        div(
          '#list',
          list.map(markerobj =>
              div(
                '#_'+markerobj.id+'.listitem',
                {style: {fontWeight: markerobj.id === id? 'bold': 'normal'}},
                markerobj.id
              )
            )
        )
      ]))

  const markercmd$ = markerid$.map(id => { return {cmd: 'highlight', data: id}})
  const listcmd$ = listid$.map(id => {return {cmd: 'highlight', data: id}})
  const map$ = xs.merge(markercmd$, listcmd$)
  const log$ = xs.empty()

  return {
    DOM: vdom$,
    map: map$,
    log: log$
  }
}
