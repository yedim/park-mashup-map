var map;
var select;
var markers = [];//마커 저장 배열
var bounds=[];//원 저장 배열
var isMyLoc=false;
var mylocPosition;//나의 위치 

window.onload = function () {
	var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
		mapOption = {
		center: new daum.maps.LatLng(37.56544,126.977119,17), // 추가1 서울시청역으로 임의로 지정, 지도의 중심좌표
		level: 6 // 지도의 확대 레벨
		};
    
	// 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
	map = new daum.maps.Map(mapContainer, mapOption);

    // 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
    var zoomControl = new daum.maps.ZoomControl();
    map.addControl(zoomControl, daum.maps.ControlPosition.RIGHT);
	
    handleRefresh();//맨처음
    
	var button = document.getElementById("button");
	button.onclick = handleRefresh;//검색버튼을 클릭할때 마커표시
	
	
	daum.maps.event.addListener(map, 'dragend', function() {
		handleRefresh();//지도의 중심이 이동될때도 마커를 다시 표시
	});
	
}
function searchTextFocus()
{
	 document.getElementById("searchText").value="";
	 isMyLoc=false;
     handleRefresh();

}

function searchMyLocPark()
{
	 document.getElementById("searchText").value="";
	
	 isMyLoc=true;
	if (navigator.geolocation) {
	    // GeoLocation을 이용해서 접속 위치를 얻어옵니다
	    navigator.geolocation.getCurrentPosition(function(position) {
	        
	        var lat = position.coords.latitude, // 위도
	            lon = position.coords.longitude; // 경도
	        
	        var locPosition = new daum.maps.LatLng(lat, lon), // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다
	        message = '<div style="padding:5px;">반경 3km이내 공원</div>'; // 인포윈도우에 표시될 내용입니다
	        
	        // 마커와 인포윈도우를 표시합니다
	        displayMarker(locPosition, message);
	        mylocPosition= {//open API의 값들 위도와 경도
	                latitude : position.coords.latitude, //LONGITUDE
	    			longitude: position.coords.longitude //LATITUDE
	          };
	      });
		    
		} else { // HTML5의 GeoLocation을 사용할 수 없을때 마커 표시 위치와 인포윈도우 내용을 설정합니다
		    var locPosition = new daum.maps.LatLng(33.450701, 126.570667),    
		        message = 'geolocation을 사용할수 없어요..'
		        
		    displayMarker(locPosition, message);
		}

     handleRefresh();
}
//지도에 마커와 인포윈도우를 표시하는 함수입니다
function displayMarker(locPosition, message) {

    // 마커를 생성합니다
    var marker = new daum.maps.Marker({  
        map: map, 
        position: locPosition
    }); 
    
    var iwContent = message, // 인포윈도우에 표시할 내용
        iwRemoveable = true;

    // 인포윈도우를 생성합니다
    var infowindow = new daum.maps.InfoWindow({
        content : iwContent,
        removable : iwRemoveable
    });
    
    // 인포윈도우를 마커위에 표시합니다 
    infowindow.open(map, marker);
    
    // 지도 중심좌표를 접속위치로 변경합니다
    map.setCenter(locPosition);      
}    

function handleRefresh() {
	
	var payselect = document.getElementById("pay");//유료-nofree-0,  무료-free-1
	var selectpay = payselect.selectedIndex;
	var whatpay = payselect[selectpay].value;//유료 또는 무료
	var url;
	var searchText = document.getElementById("searchText").value;
	
	if(searchText!="")
	{
		if(whatpay=='id')
		{
			url = "http://openapi.seoul.go.kr:8088/4466774450796c343936667a706565/json/SearchParkInfoByParkIDService/1/1/"+searchText+"/";
			select="id";
		}
		else if(whatpay=='name')
		{
			url = "http://openapi.seoul.go.kr:8088/4466774450796c343936667a706565/json/SearchInfoByParkNameService/1/1/"+searchText+"/";
			select="name";
		}
		else if(whatpay=='address')
		{
			url="http://openapi.seoul.go.kr:8088/4466774450796c343936667a706565/json/SearchParkInformationByAddressService/1/131/"+searchText+"/";
			select="address";
		}
		isMyLoc=false;
	}
	else
	{
		url = "http://openAPI.seoul.go.kr:8088/4466774450796c343936667a706565/json/SearchParkInfoService/1/131";
		select="none";
	}
	
    document.getElementById("pTag").innerHTML=select+" "+isMyLoc;
	$.getJSON(url, updatePark);
	
}


function updatePark(parks) {//1번 호출
	var payselect = document.getElementById("pay");//유료-nofree-0,  무료-free-1
	var selectpay = payselect.selectedIndex;
	var whatpay = payselect[selectpay].value;//유료 또는 무료
	var arr;
	if(select=='id')
	{
		 arr= parks.SearchParkInfoByParkIDService.row;
	}
	else if(select=='name')
	{
		 arr= parks.SearchInfoByParkNameService.row;
	}
	else if(select=="none")
	{
		arr = parks.SearchParkInfoService.row;
	}
	else if(select="address")
	{
		arr = parks.SearchParkInformationByAddressService.row;
	}

   var addr = "";

	removeMarker();

   for (var i = 0; i < arr.length; i++) {
      var park = arr[i];
      var imageSrc = "marker1.png",
		imageSize = new daum.maps.Size(27, 40), //마커의 크기(daummap에서 size 검색, 크기정보를 가지고 있는 사이즈 객체 생성)
		imageOption = {offset: new daum.maps.Point(14, 28)};//point 검색, 화면 좌표 정보를 담고 있는 포인터 객체 생성
	                                                        //point생성, 좌표를 0,0으로 해도 됨
      var loc = {//open API의 값들 위도와 경도
            latitude : park.LATITUDE, //LONGITUDE
			longitude: park.LONGITUDE //LATITUDE
      };
		if(isMyLoc==false)
			{
			addr = park.ADDR;//중복되는 데이타는 제외
			addMarker(imageSrc, imageSize, imageOption, park.LATITUDE, park.LONGITUDE, park.P_PARK
					,park.P_IMG);//,park.TEL, remain, park.PAY_NM, park.WEEKEND_BEGIN_TIME);
	     
			}
		else
		{
			var km= computeDistance (mylocPosition, loc);
	
			if(addr != park.P_ADDR && km <= 3)
			{
				addr = park.ADDR;//중복되는 데이타는 제외
				addMarker(imageSrc, imageSize, imageOption, park.LATITUDE, park.LONGITUDE, park.P_PARK);//,park.TEL, remain, park.PAY_NM, park.WEEKEND_BEGIN_TIME);
			}
			 document.getElementById("pTag").innerHTML=mylocPosition+" "+loc;
				
		}
				   
   }
}

function addBound(){
	// 지도에 표시할 원을 생성합니다
	var bound = new daum.maps.Circle({
	   center : map.getCenter(),  // 원의 중심좌표 입니다 
	   radius: 1000, // 미터 단위의 원의 반지름입니다 
	   strokeWeight: 5, // 선의 두께입니다 
	   strokeColor: '#3333ff', // 선의 색깔입니다
	   strokeOpacity: 0.7, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
	   strokeStyle: 'dashed', // 선의 스타일 입니다
	   fillColor: '#b5b5ff', // 채우기 색깔입니다
	   fillOpacity: 0.3,  // 채우기 불투명도 입니다
	   zIndex: 1
	}); 
	
	// 지도에 원을 표시합니다 
	bound.setMap(map);

	daum.maps.event.addListener(map, 'dragstart', function() {//지도가 이동될때도 원이 다시 그려짐
		bound.setMap(null);
	});
}

function removeMarker()
{
	 for (var i = 0; i < markers.length; i++) {
	        markers[i].setMap(null);
	        bounds[i].setMap(null);
	    }  
}
function addMarker(imageSrc, imageSize, imageOption, latitude, longitude, name,img){

	var markerImage = new daum.maps.MarkerImage(imageSrc, imageSize, imageOption),
	markerPosition = new daum.maps.LatLng(latitude, longitude);
	var marker = new daum.maps.Marker({
		position: markerPosition,
		image: markerImage,
		clickable: true,
		zIndex: 7
	});
	
	if(select!="none")
	{
		map.panTo(markerPosition);
	}
	marker.setMap(map);
	daum.maps.event.addListener(map, 'dragstart', function() {
		marker.setMap(null);
	});
	markers.push(marker);
	
	var bound = new daum.maps.Circle({
		   center : markerPosition,  // 원의 중심좌표 입니다 
		   radius: 1000, // 미터 단위의 원의 반지름입니다 
		   strokeWeight: 5, // 선의 두께입니다 
		   strokeColor: '#3333ff', // 선의 색깔입니다
		   strokeOpacity: 0.7, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
		   strokeStyle: 'dashed', // 선의 스타일 입니다
		   fillColor: '#b5b5ff', // 채우기 색깔입니다
		   fillOpacity: 0.3,  // 채우기 불투명도 입니다
		   zIndex: 1
	}); 
	
	// 지도에 원을 표시합니다 
	bound.setMap(map);
	daum.maps.event.addListener(map, 'dragstart', function() {//지도가 이동될때도 원이 다시 그려짐
		marker.setMap(null);
		bound.setMap(null);
	});
	bounds.push(bound);

	var content =  "<div style='width:100%; height:100%; padding:5px; font-size:0.8em;'>"
		+ name+'<br>'+"<img src='"+img+"'></img></div>";
	
	// 마커를 클릭했을 때 마커 위에 표시할 인포윈도우를 생성합니다
	var iwContent = content, // 인포윈도우에 표출될 내용으로 HTML 문자열이나 document element가 가능합니다
		iwPosition = markerPosition, //인포윈도우 표시 위치입니다
		iwRemoveable = true; // removeable 속성을 ture 로 설정하면 인포윈도우를 닫을 수 있는 x버튼이 표시됩니다

	// 인포윈도우를 생성합니다
	var infowindow = new daum.maps.InfoWindow({
	   position : iwPosition,
	   content : iwContent,
	   removable : iwRemoveable,
	   zIndex : 10
	});

	// 마커에 클릭이벤트를 등록합니다
	daum.maps.event.addListener(marker, 'click', function() {
      // 마커 위에 인포윈도우를 표시합니다
    infowindow.open(map, marker);  
	});

}

function computeDistance  (startCoords,destCoords){
    
    var startLatRads = degreesToRadians(startCoords.latitude);
    var startLongRads =degreesToRadians(startCoords.longitude);
    var destLatRads = degreesToRadians(destCoords.latitude);
    var destLongRads = degreesToRadians(destCoords.longitude);
    
    var Radius = 6371;
    var distance = Math.acos(Math.sin(startLatRads) * Math.sin(destLatRads ) +
                             Math.cos(startLatRads) * Math.cos(destLatRads )  *
                             Math.cos(startLongRads -destLongRads )) * Radius;
    
    return distance ;
}

function degreesToRadians(degrees){
    var radians = (degrees * Math.PI)/180;
    return radians;
}