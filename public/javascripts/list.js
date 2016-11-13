
app.controller('khoaCtrl', ['$scope', function($scope){

	 var s = '<%-data%>';
	 var data = JSON.parse(s);
	 console.log(data);
	 $scope.data = data;
}]);