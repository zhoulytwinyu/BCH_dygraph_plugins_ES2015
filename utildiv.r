dyUtilDiv <-function( dygraph,
                      upper=NULL,right=NULL,hover=NULL) {
  dyPlugin(
    dygraph = dygraph,
    name = "UtilDiv",
    path = "BCH_dygraph_plugins/utildiv.js",
    options = list(upper = upper, right = right, hover = hover)
  )
}
