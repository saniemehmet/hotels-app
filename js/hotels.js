var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};

function getParamsForHotelSearch(){
    return {
        "units": "metric",
        "order_by": "popularity",
        "checkin_date": getUrlParameter('checkin'),
        "checkout_date": getUrlParameter('checkout'),
        "adults_number": getUrlParameter('adults'),
        "room_number": getUrlParameter('rooms'),
        "filter_by_currency":"EUR",
        "locale": "en-gb",
        "dest_type": getUrlParameter('dest_type'),
        "dest_id": getUrlParameter('dest_id')
    };
};

let hotels = []

function getHotels(params = {}) {

    const data = {...params}
    console.log("params", data);
    const route = 'search';
    $.ajax({
        method: "GET",
        async: true,
        url: `${baseUrl}${route}`,
        headers: {
            'x-rapidapi-host': 'booking-com.p.rapidapi.com',
            'x-rapidapi-key': '18478709b4msh25f760bdd13c2f9p19b5f2jsn61b2c447d2fb'
        },
        data
    })
    .done(response => {
        $(".hotels-results").text(getUrlParameter('destination')+": "+response.total_count_with_filters+" properties found");
        hotels = response.result;
        // console.log(hotels);
        renderHotelsList();
    })
    .fail(response => {
        console.log(response);
    })
    .always(() => {
        console.log('ajax completed');
    })
}

function renderHotelsList(){
    $hotelList = $('#hotel-list');
    $hotelList.empty();
    console.log(hotels);
    hotels.forEach(hotel => {
        const $template = getHotelTemplate(hotel);
        $hotelList.append($template);
    })
}



function getHotelTemplate(hotel){
    const templateSelector = `#hotel-list-template`;
    const $template = $($(templateSelector).html());
    $template.find('.hotel-image').attr('src', hotel.max_photo_url);
    $template.find('.hotel-image').attr('alt', hotel.hotel_name);
    $template.find('.hotel-name').text(hotel.hotel_name);
    let starsIcons = "";
    for(let i=0;i<parseInt(hotel.class);i++){
        starsIcons += '<i class=\"fas fa-star\" style="\color:#FDCC0D;\"></i>';
    }
    $template.find('.hotel-class').append(starsIcons);
    $template.find('.hotel-city').text(hotel.city);
    if(hotel.distance_to_cc>=1){
        $template.find('.hotel-distance-to-center').text(" • "+hotel.distance_to_cc+" km from centre");
    }
    else{
        $template.find('.hotel-distance-to-center').text(" • "+(hotel.distance_to_cc*1000)+" m from centre");
    }
    
    $template.find('.hotel-room-info').append(hotel.unit_configuration_label);
    
    $template.find('.hotel-breakfast-info').text(hotel.ribbon_text);
    if(parseInt(hotel.is_free_cancellable) == 1){
        $template.find('.hotel-cancellation-info').text("Free cancellation");
    }
    if(parseInt(hotel.is_no_prepayment_block) == 1){
        $template.find('.hotel-prepayment-info').text("• No prepayment needed");
    }
    $template.find('.hotel-urgency-message').text(hotel.urgency_message);

    $template.find('.hotel-reviw-score-word').text(hotel.review_score_word);
    $template.find('.hotel-review-count').text(hotel.review_nr + " reviews");
    $template.find('.hotel-review-score').text(hotel.review_score);
    let dateFrom = getUrlParameter('checkin');
    let dateto = getUrlParameter('checkout');
    let nights = moment(dateto).diff(moment(dateFrom),'days');
    console.log("nights", nights);
    let adults = getUrlParameter('adults');
    if(nights > 1 && adults > 1){
        $template.find('.hotel-nights-and-adults').text(`${nights} nights, ${adults} adults`); 
    }
    else if(nights > 1){
        $template.find('.hotel-nights-and-adults').text(`${nights} nights, ${adults} adult`);  
    }
    else if(adults > 1){
        $template.find('.hotel-nights-and-adults').text(`${nights} night, ${adults} adults`);  
    }
    else{
        $template.find('.hotel-nights-and-adults').text(`${nights} night, ${adults} adult`);  
    }
    $template.find('.hotel-price-per-night').text(hotel.price_breakdown.all_inclusive_price + " " + hotel.price_breakdown.currency);
    
    $template.find('.book-button').attr('href', hotel.url);
    return $template;
}

getParamsForHotelSearch();

getHotels(this.getParamsForHotelSearch());