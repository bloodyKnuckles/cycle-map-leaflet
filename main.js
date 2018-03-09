const xs = require('xstream').default
const div = require('@cycle/dom').div
const img = require('@cycle/dom').img
const table = require('@cycle/dom').table
const tbody = require('@cycle/dom').tbody
const tr = require('@cycle/dom').tr
const td = require('@cycle/dom').td


module.exports = function main (sources) {

  const list = JSON.parse(document.head.querySelector('[name=markers]').content)

  const markerid$ = sources.map.select('markers').events('mouseover').map(markerobj => markerobj.id)
  const listid$ = sources.DOM.select('div#list').select('div.listitem').events('mouseover')
   .map(evt => parseInt(evt.currentTarget.id.substr(1)))

  const vdom$ = xs.merge(markerid$, listid$)
    .map(id => div('#container', [
        div('#header', 'header'),
        div('#content', [
          div(
            '#list',
            list.map(markerobj =>
              div('#_' + markerobj.id + '.listitem',
                {class: {focused: markerobj.id === id? true: false}}, [
                img({attrs: {src: 'http://cobbrealty.com/pics/' + markerobj.id + '_0_2.JPG'}}),
                div('.info', '$' + markerobj.asking_price)
              ])
            )
          ),
          div('#mapbox', [
            table([tbody([
              tr([td([div('#map', {hook:{skip:true}})])]),
              tr([td([
                div(
                  '#det',
                  ((li) => li.id + ': ' + li.latlong)(list.find(item => item.id == id))
                )
              ])])
            ])])
          ])
        ]),
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
