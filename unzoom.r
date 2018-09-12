dyUnzoom <-function(dygraph,divId) {
  dyPlugin(
    dygraph = dygraph,
    name = "Unzoom",
    path = "BCH_dygraph_plugins/unzoom.js",
    options = list(divId = divId)
  )
}
