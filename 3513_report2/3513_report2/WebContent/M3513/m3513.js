var map;
var select;
var markers = [];//마커 저장 배열
var bounds=[];//원 저장 배열
var isMyLoc=false;
var mylocPosition;//나의 위치 
var myMarker;
var myinfowindow;
var lat, lon;

window.onload = function () {
	var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
		mapOption = {
		center: new daum.maps.LatLng(37.56544,126.977119,17), // 추가1 서울시청역으로 임의로 지정, 지도의 중심좌표
		level: 7 // 지도의 확대 레벨
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
	parkListRefresh();
	dreamParkListRefresh();
	
}


function computeDistance (startCoords,destCoords){
    
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

function searchTextFocus()
{
	 document.getElementById("searchText").value="";
	 isMyLoc=false;
     handleRefresh();
}

function searchMyLocPark()
{
	 document.getElementById("searchText").value="";
	 
		
	  var locPosition = new daum.maps.LatLng(37.466554, 126.932919), // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다
      message = '<div style="padding:5px;">반경 3km이내 공원</div>'; // 인포윈도우에 표시될 내용입니다
      
      // 마커와 인포윈도우를 표시합니다
      displayMarker(locPosition, message);
      mylocPosition= {//open API의 값들 위도와 경도
              latitude : 37.466554, //LONGITUDE
  			longitude: 126.932919 //LATITUDE
        };
	 
	 isMyLoc=true;
	 removeMarker();

}
//지도에 마커와 인포윈도우를 표시하는 함수입니다
function displayMarker(locPosition, message) {

    // 마커를 생성합니다
    myMarker = new daum.maps.Marker({  
        map: map, 
        position: locPosition
    }); 
    
    var iwContent = message, // 인포윈도우에 표시할 내용
        iwRemoveable = true;

    // 인포윈도우를 생성합니다
    myinfowindow = new daum.maps.InfoWindow({
        content : iwContent,
        removable : iwRemoveable
    });
    
    // 인포윈도우를 마커위에 표시합니다 
    myinfowindow.open(map, myMarker);
    
    // 지도 중심좌표를 접속위치로 변경합니다
    map.setCenter(locPosition);    
}    

function handleRefresh() {
	
	var parkSelect = document.getElementById("parkSelect");
	var selectpark = parkSelect.selectedIndex;
	var whatpark = parkSelect[selectpark].value;
	var url;
	var searchText = document.getElementById("searchText").value;
	
	if(searchText!="")
	{
		if(whatpark=='id'){
			url = "http://openapi.seoul.go.kr:8088/4466774450796c343936667a706565/json/SearchParkInfoByParkIDService/1/1/"+searchText+"/";
			select="id";
		}
		else if(whatpark=='name'){
			url = "http://openapi.seoul.go.kr:8088/4466774450796c343936667a706565/json/SearchInfoByParkNameService/1/1/"+searchText+"/";
			select="name";
		}
		else if(whatpark=='address'){
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
	if(isMyLoc==false)
	{
		if(myMarker!=null && myinfowindow!=null){
	    	 myMarker.setMap(null);
	         myinfowindow.close();
	     }
	}
	$.getJSON(url, updatePark);
}

function parkListRefresh()
{
	var parkUrl;
	parkUrl = "http://openAPI.seoul.go.kr:8088/4466774450796c343936667a706565/json/SearchParkInfoService/1/131";
	
	$.getJSON(parkUrl, parkList);
}

function dreamParkListRefresh()
{
	var dreamparkUrl;
	parkUrl = "http://openAPI.seoul.go.kr:8088/4466774450796c343936667a706565/json/ListDreamParksService/1/300";
	
	$.getJSON(parkUrl, dreamParkList);

}
function updatePark(parks) {//1번 호출
	var parkSelect = document.getElementById("parkSelect");
	var selectpark = parkSelect.selectedIndex;
	var whatpark = parkSelect[selectpark].value;
	var arr;
	var result;
	
	 try { 
		if(select=='id'){
			 arr= parks.SearchParkInfoByParkIDService.row;
		}
		else if(select=='name'){
			 arr= parks.SearchInfoByParkNameService.row;
		}
		else if(select=="none"){
			arr = parks.SearchParkInfoService.row;
		}
		else if(select="address"){
			arr = parks.SearchParkInformationByAddressService.row;
		}
	 }catch(err) {
	        alert("데이터가 없습니다.");
	        return;
	 }

   var addr = "";

	removeMarker();
	
   for (var i = 0; i < arr.length; i++) {
      var park = arr[i];
      var imageSrc = "marker1.png",
		imageSize = new daum.maps.Size(35, 35), //마커의 크기(daummap에서 size 검색, 크기정보를 가지고 있는 사이즈 객체 생성)
		imageOption = {offset: new daum.maps.Point(14, 20)};//point 검색, 화면 좌표 정보를 담고 있는 포인터 객체 생성
	                                                        //point생성, 좌표를 0,0으로 해도 됨
      var loc = {//open API의 값들 위도와 경도
            latitude : park.LATITUDE, //LONGITUDE
			longitude: park.LONGITUDE //LATITUDE
      };
		
      try{
    	  if(isMyLoc==false)
  		 {
  			
  			addr = park.ADDR;//중복되는 데이타는 제외
  			if(select=="id" || select=="name" ||select=="address" ){
  				addMarker(imageSrc, imageSize, imageOption, park.LATITUDE, park.LONGITUDE,park.P_IDX, park.P_PARK,park.P_LIST_CONTENT,park.P_ADDR,park.P_ZONE,"");	
  			}
  			else{
  				addMarker(imageSrc, imageSize, imageOption, park.LATITUDE, park.LONGITUDE,park.P_IDX, park.P_PARK,park.P_LIST_CONTENT,park.P_ADDR,park.P_ZONE,park.P_IMG);	
  			}
  		}
  		else
  		{
  			var km= computeDistance (mylocPosition, loc);
  	
  			if(addr != park.P_ADDR && km <= 3){
  				addr = park.ADDR;//중복되는 데이타는 제외
  				addMarker(imageSrc, imageSize, imageOption, park.LATITUDE, park.LONGITUDE,park.P_IDX, park.P_PARK,park.P_LIST_CONTENT,park.P_ADDR,park.P_ZONE,park.P_IMG);	
  			}
  		}		   
    	  
      }catch(err) {
	        return;
	 }
   }
}

function parkList(parks)
{
	var arr=parks.SearchParkInfoService.row;
	 for (var i = 0; i < arr.length; i++) {
		   var park = arr[i];
		   
		   var childUl = document.createElement("ul");
		   childUl.className="w3-ul w3-border w3-margin";
		   childUl.setAttribute("id","listUl"+i)
		   document.getElementById("list").appendChild(childUl);

		   var childLi = document.createElement("li");		   
		   childLi.appendChild(document.createTextNode(park.P_IDX+"  "));
		   childLi.appendChild(document.createTextNode(park.P_PARK));
		   document.getElementById("listUl"+i).appendChild(childLi);
		   
		   var childLi_content = document.createElement("li");
		   childLi_content.setAttribute("id","liContent");	   
		   childLi_content.appendChild(document.createTextNode(park.P_LIST_CONTENT));//P_IDX
		   childLi_content.appendChild(document.createElement("br"));
		   
		   var childImg = document.createElement("img");
		   childImg.setAttribute("src",park.P_IMG);
		   childImg.style.margin="10px";
		   childImg.className="responsive";

		   childLi_content.appendChild(childImg);
		   childLi_content.appendChild(document.createElement("br"));
		   childLi_content.appendChild(document.createTextNode("주소  |"+park.P_ADDR));
		   childLi_content.appendChild(document.createElement("br"));
		   childLi_content.appendChild(document.createTextNode("시설  |"+park.MAIN_EQUIP));
		   childLi_content.appendChild(document.createElement("br"));
		   childLi_content.appendChild(document.createTextNode("식물  |"+park.MAIN_PLANTS));
		   childLi_content.appendChild(document.createElement("br"));
		   childLi_content.appendChild(document.createTextNode("전화번호  |"+park.P_ADMINTEL));
		   childLi_content.appendChild(document.createElement("br"));
		   childLi_content.appendChild(document.createTextNode("면적  |"+park.AREA));
		   childLi_content.appendChild(document.createElement("br"));
		   childLi_content.appendChild(document.createTextNode("개원일  |"+park.OPEN_DT));
		   childLi_content.appendChild(document.createElement("br"));
		   childLi_content.appendChild(document.createTextNode("참고사항  |"+park.USE_REFER));
		   childLi_content.appendChild(document.createElement("br"));
		   childLi_content.appendChild(document.createTextNode("바로가기  |"+park.TEMPLATE_URL));
		   childLi_content.appendChild(document.createElement("br"));
		   document.getElementById("listUl"+i).appendChild(childLi_content);

		   //GUIDANCE
		   var childDetail = document.createElement("details");
		   childDetail.setAttribute("id","details"+i);
		   childDetail.style.paddingLeft="15px";
		   document.getElementById("listUl"+i).appendChild(childDetail);
		   var childSummary = document.createElement("summary");
		   childSummary.appendChild(document.createTextNode("오시는 길 "));
		   document.getElementById("details"+i).appendChild(childSummary);
		   var childP = document.createElement("p");
		   childP.appendChild(document.createTextNode(park.VISIT_ROAD));
		   document.getElementById("details"+i).appendChild(childP);
		   document.getElementById("listUl"+i).appendChild(childDetail);
		   
		   var childGuideDetail = document.createElement("details");
		   childGuideDetail.setAttribute("id","detailsGuide"+i);
		   childGuideDetail.style.paddingLeft="15px";
		   document.getElementById("listUl"+i).appendChild(childGuideDetail);
		   var childGuideSummary = document.createElement("summary");
		   childGuideSummary.appendChild(document.createTextNode("안내도 "));
		   document.getElementById("detailsGuide"+i).appendChild(childGuideSummary);
		   var childGuideImg = document.createElement("img");
		   childGuideImg.setAttribute("src",park.GUIDANCE);
		   childGuideImg.className="responsive";
		   document.getElementById("detailsGuide"+i).appendChild(childGuideImg);
		   document.getElementById("listUl"+i).appendChild(childGuideDetail);
		 
	   }
}

function dreamParkList(parks)
{
	var arr=parks.ListDreamParksService.row;
	 for (var i = 0; i < arr.length; i++) {
		   var park = arr[i];
		   
		   var childUl = document.createElement("ul");
		   childUl.className="w3-ul w3-border w3-margin";
		   childUl.setAttribute("id","dreamlistUl"+i)
		   document.getElementById("dreamParkList").appendChild(childUl);

		   var childLi = document.createElement("li");		   
		   childLi.appendChild(document.createTextNode(park.P_PARK+"  "));
		   childLi.appendChild(document.createTextNode(park.P_ADDR));
		   document.getElementById("dreamlistUl"+i).appendChild(childLi);
		   
	 }
}

function addBound(){
	// 지도에 표시할 원을 생성합니다
	var bound = new daum.maps.Circle({
	   center : map.getCenter(),  // 원의 중심좌표 입니다 
	   radius: 1000, // 미터 단위의 원의 반지름입니다 
	   strokeWeight: 2, // 선의 두께입니다 
	   strokeColor: '#7BA518', // 선의 색깔입니다
	   strokeOpacity: 0.7, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
	   strokeStyle: 'solid', // 선의 스타일 입니다
	   fillColor: '#7BA518', // 채우기 색깔입니다
	   fillOpacity: 0.25,  // 채우기 불투명도 입니다
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
function addMarker(imageSrc, imageSize, imageOption, latitude, longitude,idx, name,content,addr,zone, img){

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
		closeParkDiv();
	}
	marker.setMap(map);
	daum.maps.event.addListener(map, 'dragstart', function() {
		marker.setMap(null);
	});
	markers.push(marker);
	
	var bound = new daum.maps.Circle({
		   center : markerPosition,  // 원의 중심좌표 입니다 
		   radius: 1000, // 미터 단위의 원의 반지름입니다 
		   strokeWeight: 2, // 선의 두께입니다 
		   strokeColor: '#7BA518', // 선의 색깔입니다
		   strokeOpacity: 0.7, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
		   strokeStyle: 'solid', // 선의 스타일 입니다
		   fillColor: '#7BA518', // 채우기 색깔입니다
		   fillOpacity: 0.25,  // 채우기 불투명도 입니다
		   zIndex: 1
	}); 
	
	// 지도에 원을 표시합니다 
	bound.setMap(map);
	daum.maps.event.addListener(map, 'dragstart', function() {//지도가 이동될때도 원이 다시 그려짐
		marker.setMap(null);
		bound.setMap(null);
	});
	bounds.push(bound);

	if(img=="")
	{
		var content =  "<div style='width:100%; height:100%; padding:5px; font-size:0.8em;'>"
			+idx+"번  "+ name+'<br>'+addr+'<br>'+"</div>";
	}
	else
	{
		var content =  "<div style='width:100%; height:100%; padding:5px; font-size:0.8em;'>"
			+idx+"번  "+ name+'<br>'+addr+'<br>'+"<img src='"+img+"' class='responsive2'></img></div>";
	}

	
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

function firstPage()
{
	var map = document.getElementById("map");
	map.style.display="block";
	
	var parkDiv =document.getElementById("parkDiv");
	parkDiv.style.display="none";

	var list=document.getElementById("list");
	list.style.display="none";

}
function showlist()
{
	var map = document.getElementById("map");
	map.style.display="none";
	
	var parkDiv =document.getElementById("parkDiv");
	parkDiv.style.display="none";

	var list=document.getElementById("list");
	list.style.display="inline";

	var dreamParkList=document.getElementById("dreamParkList");
	dreamParkList.style.display="none";
}

function showDreamPark()
{
	var map = document.getElementById("map");
	map.style.display="none";
	
	var parkDiv =document.getElementById("parkDiv");
	parkDiv.style.display="none";

	var list=document.getElementById("list");
	list.style.display="none";
	
	var dreamParkList=document.getElementById("dreamParkList");
	dreamParkList.style.display="inline";
}

function searchPark()
{
	var map = document.getElementById("map");
	var parkDiv =document.getElementById("parkDiv");
	var list=document.getElementById("list");
	var dreamParkList=document.getElementById("dreamParkList");
	
	if(map.style.display!="none")
	{
		parkDiv.style.display="block";
	}
	else if((map.style.display=="none" && list.style.display=="inline") || (map.style.display=="none" && dreamParkList.style.display=="inline"))
	{
		parkDiv.style.display="block";
		map.style.display="block";
		list.style.display="none";
		dreamParkList.style.display="none";
	}	
	
}

function closeParkDiv()
{
	var map = document.getElementById("map");
	var parkDiv =document.getElementById("parkDiv");
	
	if(map.style.display!="none")
	{
		parkDiv.style.display="none";
	}
}
