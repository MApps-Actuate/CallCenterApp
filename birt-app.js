/** BIRT Application - Demo Framework
 * author: Pierre Tessier
 * version 1.0.2
 * updated: document.body.clientHeight changed to window.innerHeight (cwong 02-11-2016)
 */

var $ = actuate.common.web.$; //assign jQuery to standard $ variable.

$(document).ready(function(){
	
	setAppName();
	arrangeLayout();	
	$(window).resize(function() {arrangeLayout("resize")});
	
	if (birtApp.dashboardName)
		actuate.load("dashboard");
	if (birtApp.reportName)
		actuate.load("viewer");
	
	var reqOps = new actuate.RequestOptions();
	var customParams = {};
	
	if (isDevMode()) {
		reqOps.setRepositoryType(actuate.RequestOptions.REPOSITORY_STANDALONE);
		customParams.__resourceFolder = getURLParameter("__repositoryFolder") + "/" + birtApp.appName;
	} else {
		reqOps.setRepositoryType(actuate.RequestOptions.REPOSITORY_ENCYCLOPEDIA);
	}
	
	customParams.__masterpage = "false";
	reqOps.setCustomParameters(customParams);
	
	actuate.initialize("/iportal" ,reqOps, null, null, renderApp); // Assumes user is already authenticated to the system
			
});

function renderApp() {
		
	if (birtApp.dashboardName) {
		var dashboardName;
		if (isDevMode())
			dashboardName = "/" + birtApp.appName + "/Dashboards/" + birtApp.dashboardName;
		else
			dashboardName = "/Applications/" + birtApp.appName + "/Dashboards/" + birtApp.dashboardName;
		
		renderDashboard(dashboardName, birtApp.submitCallback);
		
	} else if (birtApp.reportName) {
		var reportName;
		if (isDevMode())
			reportName = "/" + birtApp.appName + "/Report Designs/" + birtApp.reportName;
		else
			reportName = "/Applications/" + birtApp.appName + "/Report Designs/" + birtApp.reportName;
		
		renderReport(reportName, birtApp.parameters, birtApp.submitCallback);
	}
	
}

function renderDashboard(dashboardName) {
	
	if (birtApp.dashboard) {
		birtApp.dashboard.onUnload();
		birtApp.dashboard = null;
	}
	
    // the DOM element id "dashboardContainer" is actually hard coded inside of dashboard.js.  
    // If you don't have it set to this, you can't hide->show->hide the toolbar in edit mode	
	birtApp.dashboard = new actuate.Dashboard("dashboardContainer", true);
	birtApp.dashboard.setDashboardName(dashboardName);
					
	if (birtApp.editMode) 
		birtApp.dashboard.setIsDesigner(true);	
	
	birtApp.dashboard.submit(function () {
		// do this to remove horizontal scrolling when a vertical scroll bar is needed for dashboard 
		$(".actuate-widget-panel-body .actuate-widget-panel-body-noheader .actuate-widget-panel-body-noborder").css({overflowX: "hidden"});

		if (birtApp.submitCallback)
			if (birtApp.hideNav) $("button:contains('Hide')").click();  // Hide the dashboard edit mode toolbar
	});
}

function renderReport(reportName, reportParameters) {

	var width = $("#viewerContainer").width();
	var height = $("#viewerContainer").height();
	
	var browserPanel = new actuate.viewer.BrowserPanel();
	var config = new actuate.viewer.UIConfig();
	config.setContentPanel(browserPanel);
	
	birtApp.viewer = new actuate.Viewer("viewerContainer", config);
	birtApp.viewer.setReportName(reportName);
	birtApp.viewer.setParameters(reportParameters);
	
	if (birtApp.hideNav) {
		var uiOptions = new actuate.viewer.UIOptions();
		uiOptions.enableToolBar(false);
		birtApp.viewer.setUIOptions(uiOptions);
	}
	
	if (birtApp.hideNav && !birtApp.editMode)
		birtApp.viewer.setContentMargin(0);	
	
	birtApp.viewer.setWidth(width);
	birtApp.viewer.setHeight(height);
	
	birtApp.viewer.submit(function() {
		if (birtApp.editMode)
			birtApp.viewer.enableIV();

		if (birtApp.submitCallback)
			birtApp.submitCallback();
	});
}



// Utility Functions

function setAppName() {
	var start = location.href.indexOf("/apps/") + 6;
	var end = location.href.indexOf("/", start);
	birtApp.appName = decodeURIComponent(location.href.substring(start, end));;

	if (!document.title) {
		if (birtApp.title)
			document.title = birtApp.title;
		else
			document.title = birtApp.appName;
	}
}

function arrangeLayout(event) {
    var height;
    //var offset = birtApp.dashboardName && birtApp.editMode ? 100 : 0;
	var offset = 0;
    
    if (event == "resize" && birtApp.dashboard) {
        if (birtApp.dashboard.isToolbarVisible())
            height = window.innerHeight - offset;
        else {
            height = window.innerHeight - 56;
        }
    } else {
        height = window.innerHeight - offset;
    }
    
    height = height - $("#banner").height();
    
    if (birtApp.dashboardName)
    	$("#dashboardContainer").height(height);
    else if (birtApp.reportName)
    	$("#viewerContainer").height(height);
}


function isDevMode() {
	// when in BIRT Designer, a __repositoryFolder is set on the URL.  Use this to detect dev mode.
	return getURLParameter("__repositoryFolder");
}

function getURLParameter(name) {
	var val = (location.search.match(RegExp("[?&]"+name+"=([^&]*)"))||[,null])[1];
	return val === null ? null : decodeURIComponent(val); 
}