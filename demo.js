var $ = actuate.common.web.$; //assign jQuery to standard $ variable.

$(document).ready(function(){
	var DEV_MODE = isDevMode();
	var url = DEV_MODE ? "http://localhost:8700/iportal" : "/iportal";
	var user = DEV_MODE ? "Administrator" : null;
	var pass = DEV_MODE ? "" : null;

	actuate.load("dashboard");
	var reqOps = new actuate.RequestOptions( );
	reqOps.setRepositoryType(actuate.RequestOptions.REPOSITORY_ENCYCLOPEDIA);
	
	actuate.initialize(url ,reqOps, user, pass, function() {
		var dashboard = new actuate.Dashboard("dashboardDiv");
		dashboard.setDashboardName(demoProps.dashboardName);			
		dashboard.setHeight($(document).height() - 4);
		dashboard.setIsDesigner(true);
		dashboard.submit();			
	});		
});

function isDevMode() {
	return DEV_MODE;
	//TODO: Do actual checks to see if we are developing or not. Set DEV_MODE accordingly. Tell tale sign is __repositoryFolder URL parameter
}
