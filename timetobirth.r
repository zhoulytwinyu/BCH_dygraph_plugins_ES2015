dyTimeToBirth <-function(dygraph,divId,birth,buttonDivId=NULL) {
  dyPlugin(
    dygraph = dygraph,
    name = "TimeToBirth",
    path = "BCH_dygraph_plugins/timetobirth.js",
    options = list (divId = divId,
                    birth = birth,
                    buttonDivId = buttonDivId
                    )
  )
}
