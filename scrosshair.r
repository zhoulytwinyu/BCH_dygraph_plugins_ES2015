dySCrosshair <- function(dygraph, group=NULL) {
  dyPlugin(
    dygraph = dygraph,
    name = "SCrosshair",
    path = "BCH_dygraph_plugins/scrosshair.js",
    options = list( group=group
                  )
  )
}
