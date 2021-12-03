const euroExchangeRatesURL = 'https://v6.exchangerate-api.com/v6/4c0b515b45ea357d785ed835/latest/EUR';

let view = 'list';
let hotels = []
let page_nr = 0; //default: 0
let euroConversionRates = {}

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

function getInitParams(){
    return {
        "units": "metric",
        "order_by": "popularity",
        "checkin_date": getUrlParameter('checkin'),
        "checkout_date": getUrlParameter('checkout'),
        "adults_number": getUrlParameter('adults'),
        "room_number": getUrlParameter('rooms'),
        "filter_by_currency":"EUR",
        "locale": "en-gb",
        "page_number":page_nr,
        "dest_type": getUrlParameter('dest_type'),
        "dest_id": getUrlParameter('dest_id')
    }
}

function getParamsFromFilters(){
    const order_by = $('#order-by-select').val();
    const budget = [];
    $('.budget-checkbox:checked').each((index, el) => {
        budget.push(el.value);
    })
    const popularFilters = [];
    $('.popular-filters-checkbox:checked').each((index, el) => {
        popularFilters.push(el.value);
    })
    const rating = [];
    $('.rating-checkbox:checked').each((index, el) => {
        rating.push(el.value);
    })
    const classCheckboxElements = [];
    $('.class-checkbox:checked').each((index, el) => {
        classCheckboxElements.push(el.value);
    })

    let freeCancellation = $('#free-cancellation:checked').val();
    if(freeCancellation == "yes"){
        popularFilters.push("free_cancellation::1");
    }
    
    const filter_results = [...budget, ...popularFilters, ...rating, ...classCheckboxElements].join();
    let initParams = getInitParams();
    delete initParams.order_by;
    var params = {};
    if(filter_results != ""){
        params = {"order_by": order_by, ...initParams, "categories_filter_ids":filter_results};
    }
    else{
        params = {"order_by": order_by, ...initParams};
    }
    return params;
};

function getHotels(params = {}) {

    const data = {...params}
    const route = 'search';
    $.ajax({
        method: "GET",
        async: true,
        url: `${baseHotelsUrl}${route}`,
        headers: {
            'x-rapidapi-host': apiHost,
            'x-rapidapi-key': bookingApiKey
        },
        data
    })
    .done(response => {
        $(".hotels-results").text(getUrlParameter('destination')+": "+response.total_count_with_filters+" properties found");
        hotels = response.result;
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
    if(view === 'grid'){
        $('#hotel-list').attr('class', "row row-cols-1 row-cols-md-3");
    }
    else{
        $('#hotel-list').attr('class', "row");
    }
    $hotelList.empty();
    // console.log(hotels);
    hotels.forEach(hotel => {
        const $template = getHotelTemplate(hotel);
        $hotelList.append($template);
    })
}

function getEURExchangeRate(){
    $.ajax({
        method: "GET",
        async: true,
        url: euroExchangeRatesURL
    })
    .done(response => {
        euroConversionRates = response.conversion_rates;
        console.log(euroConversionRates);
    })
    .fail(response => {
        console.log(response);
    })
    .always(() => {
        console.log('getEURExchangeRate ajax completed');
    })
}

function getHotelTemplate(hotel){
    const templateSelector = `#hotel-${view}-template`;
    const $template = $($(templateSelector).html());
    $template.find('.hotel-image').attr('src', hotel.max_photo_url);
    $template.find('.hotel-image').attr('alt', hotel.hotel_name);
    $template.find('.hotel-name').text(hotel.hotel_name);
    let starsIcons = "";
    if(view == "grid"){
        for(let i=0;i<parseInt(hotel.class);i++){
            starsIcons += '<i class=\"fas fa-star small\" style=\"color:#FDCC0D;\"></i>';
        }
    }
    else{
        for(let i=0;i<parseInt(hotel.class);i++){
            starsIcons += '<i class=\"fas fa-star\" style="\color:#FDCC0D;\"></i>';
        }
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
    
    if(view == "grid"){
        if(typeof hotel.ribbon_text !== "undefined"){
            $template.find('.hotel-includes-info').append(hotel.ribbon_text + ((hotel.is_free_cancellable==1)?"<br>Free cancellation":"")+((hotel.is_no_prepayment_block==1)?"<br> No prepayment needed":""));
        }
        else{
            $template.find('.hotel-includes-info').append(((hotel.is_free_cancellable==1)?"Free cancellation":"")+((hotel.is_no_prepayment_block==1)?"<br> No prepayment needed":""));
        }    
    }
    else{
        $template.find('.hotel-breakfast-info').text(hotel.ribbon_text);
        if(parseInt(hotel.is_free_cancellable) === 1){
            $template.find('.hotel-cancellation-info').text("Free cancellation");
        }
        if(parseInt(hotel.is_no_prepayment_block) === 1){
            $template.find('.hotel-prepayment-info').text("• No prepayment needed");
        }
        $template.find('.hotel-urgency-message').text(hotel.urgency_message);
    }
    $template.find('.hotel-reviw-score-word').text(hotel.review_score_word);
    $template.find('.hotel-review-count').text(hotel.review_nr + " reviews");
    $template.find('.hotel-review-score').text(hotel.review_score);
    let dateFrom = getUrlParameter('checkin');
    let dateto = getUrlParameter('checkout');
    let nights = moment(dateto).diff(moment(dateFrom),'days');

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
    
    let seletedCurrency = getUrlParameter('currency');
    if(seletedCurrency == hotel.price_breakdown.currency){
        $template.find('.hotel-price-per-night').text(hotel.price_breakdown.all_inclusive_price + " " + hotel.price_breakdown.currency);
    }
    else{
        let price = Math.ceil(hotel.price_breakdown.all_inclusive_price / euroConversionRates[hotel.price_breakdown.currency]);
        $template.find('.hotel-price-per-night').text(price + " EUR");
    }
    
    $template.find('.book-button').attr('href', hotel.url);
    return $template;
}

$('#grid-view').click(e => {
    view = 'grid';
    $(e.currentTarget).addClass('view-btn').removeClass('btn-outline-dark');
    $('#list-view').addClass('btn-outline-dark').removeClass('view-btn');
    renderHotelsList();
})

$('#list-view').click(e => {
    view = 'list';
    $(e.currentTarget).addClass('view-btn').removeClass('btn-outline-dark');
    $('#grid-view').addClass('btn-outline-dark').removeClass('view-btn');
    renderHotelsList();
})

$('#find-hotels').click(()=> {
    getHotels(this.getParamsFromFilters());
})

$('.previous-page').on("click",function(){
    page_nr = page_nr - 1;
    if(page_nr < 0){
        $('.previous-page').attr("class", "previous-page btn disabled");
        page_nr = 0;
    }
    else{
        let params = getParamsFromFilters();
        params.page_number = page_nr;
        $(".active-page").text(page_nr+1);
        getHotels(params);
    }
})

$('.next-page').on("click",function(){
    console.log("page_nr next_page",page_nr);
    page_nr = page_nr + 1;
    console.log("page_nr next_page",page_nr);
    let params = getParamsFromFilters();
    params.page_number = page_nr;
    $(".active-page").text(page_nr+1);
    if(page_nr>=1){
        $('.previous-page').attr("class", "previous-page btn");
    }
    getHotels(params);
})

// getParamsFromFilters();
getEURExchangeRate();
getHotels(this.getInitParams());
