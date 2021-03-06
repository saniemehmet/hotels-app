const baseHotelsUrl = 'https://booking-com.p.rapidapi.com/v1/hotels/';
const travelAdvisoryInfoURL = 'https://www.travel-advisory.info/api';
const apiHost = 'booking-com.p.rapidapi.com';
const bookingApiKey = '7319e31318msh37155d5db3d4508p196adajsn712abe4b8c9d';

var locale = "en-gb";
let travelAdvisoryInfo = [];
let travelInfo = [];

function setAdultsAndRoom() {
    let adults = $('#adults').val();
    let rooms = $('#rooms').val();

    if (adults > 1 && rooms > 1) {
        $('#adults-and-room').val(adults + " adults | " + rooms + " rooms");
    }
    else if (adults == 1) {
        $('#adults-and-room').val(adults + " adult | " + rooms + " rooms");
    }
    else if (rooms == 1) {
        $('#adults-and-room').val(adults + " adults | " + rooms + " room");
    }
    else {
        $('#adults-and-room').val(adults + " adult | " + rooms + " room");
    }
}

function initDatePickers() {
    const $dateFrom = $("#date-from");
    $dateFrom.datepicker({
        minDate: 0
    })
    const dateFrom = moment().toDate();
    $dateFrom.datepicker('setDate', dateFrom);

    const $dateTo = $("#date-to");
    $dateTo.datepicker({
        minDate: 1
    });
    const dateTo = moment().add(1, 'days').toDate();
    $dateTo.datepicker('setDate', dateTo);
}

function getDateRangeObject() {
    let dateFrom = $("#date-from").val();
    let dateTo = $("#date-to").val();

    dateFrom = moment(dateFrom).format('YYYY-MM-DD');
    dateTo = moment(dateTo).format('YYYY-MM-DD');
    return {
        'checkin': dateFrom,
        'checkout': dateTo,
    }
}

function getLocationId() {
    let location = $('#location').val();
    if (location != null || location != "") {

    }
}

function getLocationData() {
    var location = $('#location').val();
    var route = "";
    if (location != "") {
        route = `locations?locale=${locale}&name=${location}`;
    }
    return $.ajax({
        method: "GET",
        url: `${baseHotelsUrl}${route}`,
        async: true,
        headers: {
            'x-rapidapi-host': apiHost,
            'x-rapidapi-key': bookingApiKey
        }
    })
}

$('#search-hotels').click(async function () {
    let destination = {};
    await getLocationData()
        .done(response => {
        if (response[0]["dest_type"] != "hotel") {
            destination = {
                "label": response[0]["label"],
                "dest_id": response[0]["dest_id"],
                "dest_type": response[0]["dest_type"]
            };
        }
        })
        .fail(response => {
            console.log("ajax failed", response);
        });

    let isDestinationValid = destination["label"] != "" && destination["dest_id"] != "" && destination["dest_type"] != "";

    let dateRange = getDateRangeObject();
    let checkin = dateRange['checkin'];
    let checkout = dateRange['checkout'];
    let isCheckinInvalid = moment(checkin).isBefore(moment(new Date()).format('YYYY-MM-DD'));
    let isCheckoutInvalid = moment(checkout).isBefore(moment(new Date()).add(1, 'days').format('YYYY-MM-DD'));
    let isCheckoutBeforeCheckin = moment(checkout).isBefore(moment(checkin).format('YYYY-MM-DD'));
    let adults = $('#adults').val();
    let rooms = $('#rooms').val();
    let isAdultsAndRoomValid = adults >= 1 && rooms >= 1;
    const currency = $('.currency-select').val();

    if (isDestinationValid && !isCheckinInvalid && !isCheckoutInvalid && !isCheckoutBeforeCheckin && isAdultsAndRoomValid) {
        window.location.href = `hotels.html?destination=${destination["label"]}&dest_id=${destination["dest_id"]}&dest_type=${destination["dest_type"]}&checkin=${checkin}&checkout=${checkout}&adults=${adults}&rooms=${rooms}&currency=${currency}`;
    }
    else{
        if(!isDestinationValid){
            alert("Please enter a location.");
        }
        else if(isCheckinInvalid){
            alert("Checkin date is not valid. Please try again with a valid date!");
        }
        else if(isCheckoutInvalid){
            alert("Checkin date is not valid. Please try again with a valid date!");
        }
        else if(isCheckoutBeforeCheckin){
            alert("Checkout cannot be before checkin!");
        }
        else if(!isAdultsAndRoomValid){
            alert("Please choose valid adults and room count.");
        }
    }

    return false;
});

function colorDivByRiskLevel(score){
    if((score>=0) && (score<=2.5)){
        $(".country-name").attr('class', 'country-name low-risk text-center');
    }
    else if((score >2.5) && (score <= 3.5)){
        $(".country-name").attr('class', 'country-name medium-risk text-center');
    }
    else if((score >=3.5) && (score <= 4.5)){
        $(".country-name").attr('class', 'country-name high-risk text-center');
    }
    else{
        $(".country-name").attr('class', 'country-name extreme-warning text-center');
    }
}

function getTravelAdvisoryInfo(){

    $.ajax({
        method: "GET",
        async: true,
        url: travelAdvisoryInfoURL
    })
    .done(response => {
        travelAdvisoryInfo = response.data;
        travelInfo = Object.values(travelAdvisoryInfo);
        $(".country-name").text(travelAdvisoryInfo["BG"]["name"]);
        $(".advisory-message").text(travelAdvisoryInfo["BG"]["advisory"]["message"]);
        colorDivByRiskLevel(travelAdvisoryInfo["BG"]["advisory"]["score"]);
    })
    .fail(response => {
        console.log(response);
    })
    .always(() => {
        console.log('travel advisory ajax completed');
    })
}

initDatePickers();
getTravelAdvisoryInfo();

setInterval(function() {
    var rand = Math.floor(Math.random() * travelInfo.length);
    colorDivByRiskLevel(travelInfo[rand]["advisory"]["score"]);
    $(".country-name").text(travelInfo[rand]["name"]);
    $(".advisory-message").text(travelInfo[rand]["advisory"]["message"]);
  }, 8000);


