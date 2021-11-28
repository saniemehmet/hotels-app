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


const baseUrl = 'https://booking-com.p.rapidapi.com/v1/hotels/';
var locale = "en-gb";

function getLocationData() {
    var location = $('#location').val();
    var route = "";
    if (location != null || location != "") {
        route = `locations?locale=${locale}&name=${location}`;
    }
    console.log(`${baseUrl}${route}`);
    return $.ajax({
        method: "GET",
        url: `${baseUrl}${route}`,
        async: true,
        headers: {
            'x-rapidapi-host': 'booking-com.p.rapidapi.com',
            'x-rapidapi-key': '18478709b4msh25f760bdd13c2f9p19b5f2jsn61b2c447d2fb'
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

    let adults = $('#adults').val();
    let rooms = $('#rooms').val();
    let isAdultsAndRoomValid = adults >= 1 && rooms >= 1;

    if (isDestinationValid && !isCheckinInvalid && !isCheckoutInvalid && isAdultsAndRoomValid) {
        window.location.href = `hotels.html?destination=${destination["label"]}&dest_id=${destination["dest_id"]}&dest_type=${destination["dest_type"]}&checkin=${checkin}&checkout=${checkout}&adults=${adults}&rooms=${rooms}`;
    }

    return false;
});

initDatePickers();
