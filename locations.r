dyLocation <- function(dygraph,data) {
  dyPlugin(
    dygraph = dygraph,
    name = "Locations",
    path = "BCH_dygraph_plugins/locations.js",
    options=list( data=toJSON(data)
                  )
  )
}
