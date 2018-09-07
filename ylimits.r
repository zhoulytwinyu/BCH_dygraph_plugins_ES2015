dyYLimits <-function(dygraph,data) {
  dyPlugin(
    dygraph = dygraph,
    name = "Ylimits",
    path = "BCH_dygraph_plugins/ylimits.js",
    options = list(data = toJSON(data))
  )
}
