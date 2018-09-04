dyRSTLegend <-function(dygraph,div,data) {
  dyPlugin(
    dygraph = dygraph,
    name = "RSTLegend",
    path = "BCH_dygraph_plugins/rstlegend.js",
    options = list (div = div,
                    data = toJSON(data)
                    )
  )
}
