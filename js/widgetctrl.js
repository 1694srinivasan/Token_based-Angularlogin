var app = angular.module('UIApp',['ngRoute' , 'ngMaterial' , 'datatables','ngAnimate','ngAria','ngMessages','ngCookies']);
    app.config(function($mdIconProvider , $mdThemingProvider , $mdAriaProvider){
        $mdThemingProvider.theme('default')
        .primaryPalette('green')
        .accentPalette('red');
        $mdAriaProvider.disableWarnings();
    })
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "views/login.html",
        controller: 'loginctrl',
        resolve:{
        "check":function($location ,$rootScope,$cookies){   
            if($cookies.get('token') && $cookies.get('currentuser')){ 
                $location.path('/dashboard');
            }else{
                $location.path('/');
            }
        }
    }       
    })
    .when("/dashboard", {
        templateUrl : "views/dashboard.html",
        controller: 'dashboardctrl',
        resolve:{
        "check":function($location ,$rootScope,$cookies){   
            if($cookies.get('token')){ 
                $location.path('/dashboard');
            }else{
                $location.path('/');
            }
        }
    }
    })
    .when("/logout",{
        templateUrl : "views/logout.html",
        controller: 'logoutctrl',
    })
    .otherwise({
        redirectTo : '/'
    });
});

app.run(function($rootScope,$cookies){
    if($cookies.get('token') && $cookies.get('currentuser')){
        $rootScope.token = $cookies.get('token');
        $rootScope.currentuser = $cookies.get('currentuser');
    }
});

app.controller('loginctrl', function($scope, $http , $location ,$rootScope ,$cookies) {
    $scope.SendData = function() {
    headers = {
       'Content-Type': 'application/x-www-form-urlencoded',
     },
    $http({method:'POST', url:'https://angapi.herokuapp.com/api-token-auth/', data:{'username': $scope.username , 'password': $scope.password}, header:headers}).
    then(function successCallback(response) {
        $cookies.put('token',response.data.token);
        $cookies.put('currentuser', $scope.username);
        $rootScope.currentuser = $scope.username;
        $rootScope.token = response.data.token;
        $location.path('/dashboard');
     },function errorCallback(response) { 
        if(response.data.non_field_errors[0] == "Unable to log in with provided credentials."){
            $scope.invalid = "Username or Password is wrong"
        }  
     });
    }   
});

app.controller('logoutctrl', function($scope, $http , $location ,$rootScope , $cookies) {
       $scope.log = function() {  
        $location.path('/');
        } 
});

app.controller('dashboardctrl' , function($scope, $http ,$location, $timeout, $mdSidenav , $rootScope ,DTOptionsBuilder ,$cookies , $route){
    if($cookies.get('token')){
    $scope.user = $rootScope.currentuser;
    $scope.tokenid = $rootScope.token;
    $scope.logout = function() {
        $cookies.remove("token");
        $cookies.remove("currentuser");
        $location.path('/logout');
    }

    $scope.dash = function() {
        $location.path('/dashboard');
    }

    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withDisplayLength(10)
        .withOption('bLengthChange', false);
        
    headers = {
       'Authorization': 'JWT ' + $scope.tokenid,
     },

    $http({method: 'GET',url: 'https://angapi.herokuapp.com/widgets/',headers:headers}).
    then(function successCallback(data) {
        $scope.widgetdata = []
        $scope.dropdown = []
        angular.forEach(data.data,function(data){
            $scope.dropdown.push(data)
            if(data.enable == true){
                $scope.widgetdata.push(data)
            }     
        })   
    },function errorCallback(data){
        $scope.error = data;
    });

    $scope.close = function(index,id) {
        $http({method: 'PUT',url: 'https://angapi.herokuapp.com/widgets/' + id + "/" , data : {'enable': 'false'},headers:headers}).
        then(function successCallback(data){
            $scope.widgetdata.splice(index, 1)
            var wn = data.data.widget_name
            angular.forEach($scope.dropdown,function(data){
                if (data.widget_name == wn){
                    var wn_id = data.id
                    $("#id_"+wn_id.toString()).attr("checked", false);
                }
            })
            $route.reload();
        },function errorCallback(data){
            $scope.error = data;
        });
    }

    $scope.closecheck = function(index,id, value) {
        console.log(index, id, value)
        if (value == true){
            var enable = false
        }else{
            var enable = true
        }
        $http({method: 'PUT',url: 'https://angapi.herokuapp.com/widgets/' + id + "/" , data : {'enable': enable},headers:headers}).
        then(function successCallback(data){
            if (enable == false){
                $scope.widgetdata.splice(index, 1)
            }else{
                $scope.widgetdata.push(data)
                console.log(data.data)
            }
        },function errorCallback(data){
            $scope.error = data;
        });
        $route.reload();
    }

    $http({method: 'GET',url: 'https://angapi.herokuapp.com/product/',headers:headers}).
    then(function successCallback(data) {
        $scope.chartdata = []
        angular.forEach(data.data,function(data){
            $scope.chartdata.push(data)
        })
        var piechart  = []
        angular.forEach($scope.chartdata , function(data){ 
            var product = data.product_name;
            var count = data.count;
            var datay = {'name':product, 'y':count}
            piechart.push(datay)
        })
        Highcharts.chart('pichart', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'Laptop Brands'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true
            }
        },
        series: [{
            name: 'Brands',
            colorByPoint: true,
            data: piechart
        }]
    });
    },function errorCallback(data){
        $scope.error = data;
    });

    $http({method: 'GET',url: 'https://angapi.herokuapp.com/product/',headers:headers}).
    then(function successCallback(data) {
        $scope.userdata = []
        angular.forEach(data.data,function(data){
            $scope.userdata.push(data);
        })
    }, function errorCallback(data) {
        $scope.error = data;
        
    });

    $http({method: 'GET',url: 'https://angapi.herokuapp.com/temprature/',headers:headers}).
    then(function successCallback(data){
        $scope.chartdata = []
        angular.forEach(data.data,function(data){
            $scope.chartdata.push(data)
        })
        // console.log($scope.chartdata)
        var barchart  = []
        angular.forEach($scope.chartdata , function(data){
            
            var city = data.city_name;
            var temp = parseFloat(data.temprature);
            var datay = {'name':city, 'y':temp}
            barchart.push(datay)

        })
        // console.log(barchart);
        Highcharts.chart('barchart', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Temperature Statistics'
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                type: 'category'
            },
            yAxis: {
                title: {
                    text: 'Temperature Celsius'
                }

            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:1f} Celsius'
                    }

                }
            },

            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:1f}  Celsius</b><br/>'
            },

            series: [{
                name: 'Temperature',
                colorByPoint: true,
                data:barchart
            }],
        });
    },function errorCallback(data){
        $scope.error = data;
    });

    $http({method: 'GET',url: 'https://angapi.herokuapp.com/temprature/',headers:headers}).
    then(function successCallback(data) {
        $scope.temp_data = []
        angular.forEach(data.data,function(data){
            $scope.temp_data.push(data);
        })
    }, function errorCallback(data) {
        $scope.error = data.data;
        
    });  
    }else{
        $cookies.remove("token");
        $cookies.remove("currentuser");
        $location.path('/');
    }
});