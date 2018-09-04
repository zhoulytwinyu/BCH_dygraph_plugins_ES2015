dyIntervals <-function(dygraph,data) {
  dyPlugin(
    dygraph = dygraph,
    name = "Intervals",
    path = "BCH_dygraph_plugins/intervals.js",
    options=list(data=toJSON(data))
  )
}
