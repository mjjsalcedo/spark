const parkingBack = document.getElementById('parking-back');

parkingBack.addEventListener('click', function() {
  modal.className = 'modal';
});

const modal = document.getElementById('modal');
const modal_address_state = document.getElementById('address-state');
const modal_address_street = document.getElementById('address-street');
const modal_price = document.getElementById('parking-price');

function modifyModal(address_state, address_street, price) {
  modal_address_street.innerText = address_street;
  modal_address_state.innerText = address_state;
  modal_price.innerText = price;
}

function initMap() {
  let map;

  //find current position of user
  navigator.geolocation.getCurrentPosition(function(position) {
    const pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
  };

  //create map with current position as center
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: pos,
    disableDefaultUI: true
  });

  map.setCenter(pos);

  map.addListener('click', function() {
    currentInfoWindow.close();
  });

  //create centerControl button on map
  var centerControlDiv = document.createElement('div');
  var centerControl = new CenterControl(centerControlDiv, map, pos);

  centerControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(centerControlDiv);

  const marker = new google.maps.Marker({
    position: pos,
    map: map
  });


  //holder variable for the currentInfoWindow
  let currentInfoWindow;

  //get fake renter data and make markers to place on google map
  getRenterMarkers()
    .then(renters => {
      renters.forEach(renter => {
        const pos = {
          lat: parseFloat(renter.lat),
          lng: parseFloat(renter.long)
        };

        const marker = new google.maps.Marker({
          position: pos,
          icon: {
            url: 'bolt.png',
            scaledSize: new google.maps.Size(40, 40)
          },
          map: map
        });

        const contentString = `${renter.address_street} ${renter.address_state} $${renter.price}`;
        const infoWindowEl = document.createElement('div');
        infoWindowEl.addEventListener('click', function() {
          console.log("clicked")
          modal.className += ' active'
          modifyModal(renter.address_state, renter.address_street, renter.price);
        })

        infoWindowEl.innerText = contentString;

        const infoWindow = new google.maps.InfoWindow({
          content: infoWindowEl
        })

        marker.addListener('click', function() {
          if(currentInfoWindow) currentInfoWindow.close();

          currentInfoWindow = infoWindow;

          infoWindow.open(map, marker);
        });

      });
    })
    .then(() => {
      const overlay = document.getElementsByClassName('logo-overlay');
      overlay[0].className += ' hidden';
    });
  });
}

function getRenterMarkers() {
   return fetch('/data')
    .then(res => res.json())
}