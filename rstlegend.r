dyRSTLegend <-function(dygraph,divId,buttonDivId,data) {
  dyPlugin(
    dygraph = dygraph,
    name = "RSTLegend",
    path = "BCH_dygraph_plugins/rstlegend.js",
    options = list (divId = divId,
                    buttonDivId = buttonDivId,
                    data = toJSON(data)
                    )
  )
}
