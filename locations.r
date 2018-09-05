dyLocation <- function(dygraph,data,color_mapping) {
  dyPlugin(
    dygraph = dygraph,
    name = "Locations",
    path = "BCH_dygraph_plugins/locations.js",
    options=list( data=toJSON(data),
                  color_mapping = toJSON(color_mapping,
                                         auto_unbox=TRUE)
                  )
  )
}
