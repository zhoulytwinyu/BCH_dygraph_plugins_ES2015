dyUtilDiv <-function( dygraph,
                      upper_left=NULL,upper_right=NULL,
                      lower_left=NULL,lower_right=NULL,
                      hover=NULL) {
  dyPlugin(
    dygraph = dygraph,
    name = "UtilDiv",
    path = "BCH_dygraph_plugins/utildiv.js"
  )
}
