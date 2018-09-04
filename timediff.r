dyTimediff <-function(dygraph,data,color_selected=NULL,color_normal=NULL) {
  dyPlugin(
    dygraph = dygraph,
    name = "Timediff",
    path = "BCH_dygraph_plugins/timediff.js",
    options = list (data = toJSON(data),
                    color_selected = color_selected,
                    color_normal = color_normal
                    )
  )
}
